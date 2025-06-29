#!/bin/bash

# 안전한 지갑 시스템 마이그레이션 스크립트
# 사용법: ./safe-migration.sh [step|all|rollback]

set -e  # 에러 발생시 스크립트 중단

# 색깔 출력을 위한 변수
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# .env 파일 로드 함수
load_env() {
    if [ -f ".env" ]; then
        log_info ".env 파일을 로드합니다..."
        export $(grep -v '^#' .env | grep -v '^$' | xargs)
        log_success ".env 파일 로드 완료"
    else
        log_warning ".env 파일을 찾을 수 없습니다."
    fi
}

# 로깅 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 환경변수 확인
check_env() {
    log_info "환경변수 확인 중..."
    
    # .env 파일 로드
    load_env
    
    if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_NAME" ]; then
        log_error "데이터베이스 환경변수가 설정되지 않았습니다."
        log_error "필요한 변수: DB_HOST, DB_USER, DB_NAME"
        log_info "현재 설정:"
        log_info "  DB_HOST=${DB_HOST:-'(설정되지 않음)'}"
        log_info "  DB_USER=${DB_USER:-'(설정되지 않음)'}"
        log_info "  DB_NAME=${DB_NAME:-'(설정되지 않음)'}"
        exit 1
    fi
    
    log_success "환경변수 확인 완료"
    log_info "데이터베이스 연결 정보:"
    log_info "  호스트: $DB_HOST"
    log_info "  사용자: $DB_USER"
    log_info "  데이터베이스: $DB_NAME"
}

# 데이터베이스 백업
backup_database() {
    log_info "데이터베이스 백업 시작..."
    
    local backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if command -v pg_dump >/dev/null 2>&1; then
        log_info "pg_dump를 사용하여 백업 중..."
        
        # 비밀번호 환경변수 설정
        export PGPASSWORD="$DB_PASSWORD"
        
        if pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" > "$backup_file" 2>/dev/null; then
            log_success "데이터베이스 백업 완료: $backup_file"
            echo "$backup_file" > .last_backup
        else
            log_error "백업 중 오류가 발생했습니다."
            log_warning "계속 진행하시겠습니까? (백업 없이 진행하는 것은 위험합니다)"
            read -p "계속 진행하시겠습니까? (y/N): " confirm
            if [[ $confirm != [yY] ]]; then
                log_info "마이그레이션 취소됨"
                exit 0
            fi
        fi
        
        # 비밀번호 환경변수 제거
        unset PGPASSWORD
    else
        log_warning "pg_dump를 찾을 수 없습니다. 수동으로 백업해주세요."
        log_warning "또는 다음 명령어로 pg_dump를 설치하세요:"
        log_warning "  macOS: brew install postgresql"
        log_warning "  Ubuntu: sudo apt-get install postgresql-client"
        read -p "백업 없이 계속 진행하시겠습니까? (y/N): " confirm
        if [[ $confirm != [yY] ]]; then
            log_info "마이그레이션 취소됨"
            exit 0
        fi
    fi
}

# 마이그레이션 상태 확인
check_migration_status() {
    log_info "현재 마이그레이션 상태 확인..."
    npm run migration:show 2>/dev/null || log_warning "마이그레이션 상태를 확인할 수 없습니다."
}

# 단계별 마이그레이션 실행
run_step_migration() {
    log_info "단계별 마이그레이션 시작..."
    
    # 1단계: 게임 및 서버 테이블 생성
    log_info "1단계: 게임 및 서버 테이블 생성..."
    if npm run migration:run 2>&1 | grep -q "CreateGamesAndServersTable"; then
        log_success "1단계 완료"
    fi
    
    # 2단계: 화폐 테이블 확장
    log_info "2단계: 화폐 테이블 확장..."
    if npm run migration:run 2>&1 | grep -q "UpdateCurrenciesTable"; then
        log_success "2단계 완료"
    fi
    
    # 3단계: 지갑 테이블 재구성 (위험)
    log_warning "3단계: 지갑 테이블 재구성 (기존 데이터 백업됨)"
    read -p "지갑 테이블을 재구성하시겠습니까? (y/N): " confirm
    if [[ $confirm == [yY] ]]; then
        if npm run migration:run 2>&1 | grep -q "UpdateWalletsTable"; then
            log_success "3단계 완료"
        fi
    else
        log_info "3단계 건너뜀"
        return
    fi
    
    # 4단계: 초기 데이터 삽입
    log_info "4단계: 초기 데이터 삽입..."
    if npm run migration:run 2>&1 | grep -q "InsertInitialGameData"; then
        log_success "4단계 완료"
    fi
    
    # 5단계: 기존 데이터 마이그레이션
    log_info "5단계: 기존 데이터 마이그레이션..."
    read -p "기존 지갑 데이터를 새 구조로 마이그레이션하시겠습니까? (y/N): " confirm
    if [[ $confirm == [yY] ]]; then
        if npm run migration:run 2>&1 | grep -q "MigrateExistingWalletData"; then
            log_success "5단계 완료"
        fi
    else
        log_info "5단계 건너뜀"
    fi
}

# 전체 마이그레이션 실행
run_full_migration() {
    log_warning "전체 마이그레이션을 실행합니다."
    log_warning "이 작업은 기존 wallets 테이블을 재구성합니다."
    
    read -p "정말 진행하시겠습니까? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        log_info "마이그레이션 취소됨"
        exit 0
    fi
    
    log_info "전체 마이그레이션 시작..."
    npm run migration:run
    log_success "전체 마이그레이션 완료"
}

# 마이그레이션 롤백
rollback_migration() {
    log_warning "마이그레이션 롤백을 실행합니다."
    
    read -p "정말 롤백하시겠습니까? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        log_info "롤백 취소됨"
        exit 0
    fi
    
    log_info "마이그레이션 롤백 시작..."
    npm run migration:revert
    log_success "마이그레이션 롤백 완료"
}

# 백업에서 복구
restore_from_backup() {
    if [ -f ".last_backup" ]; then
        local backup_file=$(cat .last_backup)
        if [ -f "$backup_file" ]; then
            log_info "백업에서 복구: $backup_file"
            
            # 비밀번호 환경변수 설정
            export PGPASSWORD="$DB_PASSWORD"
            
            if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" < "$backup_file" 2>/dev/null; then
                log_success "백업에서 복구 완료"
            else
                log_error "복구 중 오류가 발생했습니다."
            fi
            
            # 비밀번호 환경변수 제거
            unset PGPASSWORD
        else
            log_error "백업 파일을 찾을 수 없습니다: $backup_file"
        fi
    else
        log_error "백업 정보를 찾을 수 없습니다."
    fi
}

# 메인 실행 로직
main() {
    echo "=================================================="
    echo "🛡️  안전한 지갑 시스템 마이그레이션 도구"
    echo "=================================================="
    
    check_env
    
    case "${1:-}" in
        "step")
            backup_database
            check_migration_status
            run_step_migration
            ;;
        "all")
            backup_database
            check_migration_status
            run_full_migration
            ;;
        "rollback")
            rollback_migration
            ;;
        "restore")
            restore_from_backup
            ;;
        *)
            echo "사용법: $0 [step|all|rollback|restore]"
            echo ""
            echo "  step     - 단계별 마이그레이션 (권장)"
            echo "  all      - 전체 마이그레이션 (위험)"
            echo "  rollback - 마이그레이션 롤백"
            echo "  restore  - 백업에서 복구"
            echo ""
            echo "권장 순서:"
            echo "1. ./safe-migration.sh step"
            echo "2. 데이터 확인 후 문제있으면 rollback"
            exit 1
            ;;
    esac
    
    log_success "작업 완료! 🎉"
}

# 스크립트 실행
main "$@"
