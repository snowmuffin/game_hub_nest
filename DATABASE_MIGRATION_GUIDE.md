# Database Migration Guide

## 🎯 Overview

이 프로젝트는 TypeORM을 사용하여 PostgreSQL의 복수 스키마(`space_engineers`, `valheim`)를 관리합니다. 
**모든 환경에서 마이그레이션을 사용**하여 안전하고 예측 가능한 스키마 관리를 수행합니다.

## 🚀 Quick Start

### 🆕 첫 번째 설정 (신규 개발자)
```bash
# 개발 환경 전체 설정 (권장)
./setup-dev.sh

# 또는 수동 설정
npm run db:init-schemas              # 스키마 생성
npm run migration:generate -- InitialSchema  # 첫 마이그레이션 생성
npm run migration:run                # 마이그레이션 실행
```

### 🔄 일상적인 개발
```bash
# 개발 서버 시작 (마이그레이션 자동 확인 포함)
./start-dev.sh

# 또는
npm run start:dev
```

### 🚀 프로덕션 배포
```bash
npm run deploy  # 안전한 마이그레이션 포함
```

## 🛡️ Why Always Use Migrations?

### ❌ synchronize: true의 문제점
- **데이터 손실**: 컬럼 삭제 시 데이터 영구 손실
- **예측 불가능**: 의도하지 않은 스키마 변경
- **동시성 문제**: 여러 인스턴스 동시 실행 시 충돌
- **롤백 불가**: 변경사항 되돌리기 어려움

### ✅ 마이그레이션의 장점
- **안전성**: 단계별 변경, 롤백 지원
- **추적성**: 모든 변경사항 기록
- **협업**: 팀원 간 스키마 동기화
- **일관성**: 모든 환경에서 동일한 스키마

## 📋 Migration Commands

### 🔍 상태 확인
```bash
# 마이그레이션 상태 확인
npm run migration:show

# 현재 데이터베이스 스키마 확인
npm run db:init-schemas
```

### 🏗️ 마이그레이션 생성
```bash
# 엔티티 변경사항을 기반으로 마이그레이션 자동 생성 (권장)
npm run migration:generate -- MigrationName

# 빈 마이그레이션 파일 생성
npm run migration:create -- MigrationName
```

### ▶️ 마이그레이션 실행
```bash
# 마이그레이션 실행
npm run migration:run

# 마이그레이션 되돌리기
npm run migration:revert

# 안전한 마이그레이션 (스키마 초기화 + 마이그레이션)
npm run db:safe-migration
```

## 🛡️ Safety Guidelines

### ✅ 권장사항

1. **자동 생성 사용**: 수동으로 마이그레이션 파일을 작성하지 말고 `migration:generate` 사용
2. **백업**: 프로덕션 마이그레이션 전 항상 데이터베이스 백업
3. **테스트**: 스테이징 환경에서 먼저 마이그레이션 테스트
4. **검토**: 생성된 마이그레이션 파일을 실행 전에 반드시 검토

### ❌ 주의사항

1. **수동 작성 금지**: 마이그레이션 파일 수동 작성 시 오류 위험
2. **프로덕션 synchronize**: 프로덕션에서 `synchronize: true` 사용 금지
3. **직접 SQL**: 가능한 TypeORM 메서드 사용, 직접 SQL 최소화

## 🏗️ Schema Structure

```
Database: snowmuffin
├── public (default schema)
│   ├── users
│   ├── games
│   ├── game_servers
│   ├── currencies
│   ├── wallets
│   └── wallet_transactions
├── space_engineers
│   ├── items
│   ├── drop_table
│   ├── marketplace_items
│   ├── online_storage
│   ├── online_storage_items
│   └── item_download_log
└── valheim
    ├── characters
    ├── character_skills
    ├── items
    ├── inventories
    ├── buildings
    ├── worlds
    ├── biomes
    └── boss_encounters
```

## 🔧 Environment Configuration

### Development (.env)
```bash
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=snowmuffin
DB_SSL=false
```

### Production (.env.production)
```bash
NODE_ENV=production
DB_HOST=your-prod-host
DB_PORT=5432
DB_USER=your-prod-user
DB_PASSWORD=your-prod-password
DB_NAME=snowmuffin
DB_SSL=true
```

## 🚨 Troubleshooting

### 스키마가 없다는 오류
```bash
# 스키마 초기화 실행
npm run db:init-schemas
```

### 마이그레이션 실패
```bash
# 마이그레이션 상태 확인
npm run migration:show

# 필요시 되돌리기
npm run migration:revert
```

### 개발 환경 스키마 리셋
```bash
# ⚠️ 주의: 모든 데이터가 삭제됩니다
npm run db:schema:drop
npm run db:init-schemas
npm run start:dev  # 자동 동기화로 스키마 재생성
```

## 📝 Best Practices

1. **마이그레이션 네이밍**: 의미있는 이름 사용 (`AddUserProfileFields`, `CreateGameTables`)
2. **원자성**: 하나의 마이그레이션은 하나의 논리적 변경사항만 포함
3. **테스트**: 마이그레이션 실행 전후 애플리케이션 테스트
4. **문서화**: 복잡한 마이그레이션은 주석으로 설명 추가
5. **백업**: 프로덕션 배포 전 반드시 데이터베이스 백업
