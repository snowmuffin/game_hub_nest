# 안전한 마이그레이션 가이드

## ⚠️ 중요: 마이그레이션 실행 전 필수 작업

### 1. 데이터베이스 백업
```bash
# PostgreSQL 백업 명령어
pg_dump -h [호스트] -U [사용자명] -d [데이터베이스명] > backup_$(date +%Y%m%d_%H%M%S).sql

# 예시:
pg_dump -h localhost -U postgres -d snowmuffin > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. 백업 복구 방법 (문제 발생 시)
```bash
# 백업에서 복구
psql -h [호스트] -U [사용자명] -d [데이터베이스명] < backup_파일명.sql
```

### 3. 마이그레이션 실행 전 체크리스트
- [ ] 데이터베이스 백업 완료
- [ ] 테스트 환경에서 마이그레이션 테스트 완료
- [ ] 애플리케이션 서비스 중단 (선택사항)
- [ ] 마이그레이션 롤백 계획 수립

## 📋 마이그레이션 단계별 실행 계획

### 1단계: 새 테이블 생성 (안전)
- `games` 테이블 생성
- `game_servers` 테이블 생성
- 기존 데이터에 영향 없음

### 2단계: 기존 테이블 확장 (주의)
- `currencies` 테이블에 컬럼 추가
- 기존 데이터 유지되지만 새 컬럼들은 기본값으로 설정

### 3단계: 지갑 시스템 재구성 (위험)
- 기존 `wallets` 테이블 백업 후 재생성
- 기존 지갑 데이터를 새 구조로 마이그레이션

### 4단계: 초기 데이터 삽입 (안전)
- 게임, 서버, 화폐 기본 데이터 삽입

## 🛡️ 안전한 실행 명령어

```bash
# 1. 현재 마이그레이션 상태 확인
npm run migration:show

# 2. 단계별 마이그레이션 실행
npm run migration:run

# 3. 문제 발생 시 롤백
npm run migration:revert
```

## 🔄 데이터 마이그레이션 전략

### 기존 wallets 데이터 보존 방법

1. **임시 테이블 생성**: 기존 wallets 데이터를 임시 테이블에 백업
2. **새 구조 적용**: 새로운 wallets 테이블 구조 생성
3. **데이터 변환**: 기존 데이터를 새 구조에 맞게 변환하여 삽입
4. **검증**: 데이터 무결성 검증
5. **임시 테이블 삭제**: 검증 완료 후 임시 테이블 제거

## ⚡ 빠른 실행 (위험도별)

### 🟢 낮은 위험도 - 안전한 단계별 실행 (권장)
```bash
# 자동 백업 + 단계별 실행
./safe-migration.sh step
```

### 🟡 중간 위험도 - 전체 마이그레이션
```bash
# 자동 백업 + 전체 실행
./safe-migration.sh all
```

### 🔴 높은 위험도 - 수동 실행 (전문가용)
```bash
# 수동 백업 후 실행
pg_dump -h [호스트] -U [사용자명] -d [데이터베이스명] > backup_manual.sql
npm run migration:run
```

## 🆘 문제 발생 시 복구 방법

### 1. 마이그레이션 롤백
```bash
./safe-migration.sh rollback
```

### 2. 백업에서 복구
```bash
./safe-migration.sh restore
```

### 3. 수동 복구
```bash
# 백업 파일에서 수동 복구
psql -h [호스트] -U [사용자명] -d [데이터베이스명] < backup_파일명.sql
```

## 📋 마이그레이션 체크리스트

### 실행 전
- [ ] 환경변수 설정 확인 (DB_HOST, DB_USER, DB_NAME)
- [ ] 데이터베이스 접속 확인
- [ ] 디스크 공간 충분한지 확인 (백업용)
- [ ] 애플리케이션 서비스 중단 (선택사항)

### 실행 중
- [ ] 백업 파일 생성됨
- [ ] 각 마이그레이션 단계 성공 확인
- [ ] 에러 로그 확인

### 실행 후
- [ ] 새 테이블 구조 확인
- [ ] 기존 데이터 보존 확인
- [ ] 애플리케이션 정상 동작 확인
- [ ] 백업 파일 안전한 곳에 보관

## 💡 추가 팁

### 테스트 환경에서 먼저 실행
```bash
# 테스트 DB에서 먼저 테스트
export DB_NAME=test_database
./safe-migration.sh step
```

### 백업 테이블 확인
```sql
-- 백업된 wallets 테이블 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'spaceengineers' 
AND table_name LIKE 'wallets_backup_%';
```

### 데이터 무결성 검증
```sql
-- 마이그레이션 후 데이터 확인
SELECT 
    u.username,
    w.balance,
    g.name as game_name,
    c.name as currency_name
FROM spaceengineers.wallets w
JOIN spaceengineers.users u ON w.user_id = u.id
JOIN spaceengineers.games g ON w.game_id = g.id
JOIN spaceengineers.currencies c ON w.currency_id = c.id
LIMIT 10;
```
