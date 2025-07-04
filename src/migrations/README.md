# Migration Files Overview

이 폴더는 데이터베이스 스키마 변경을 위한 TypeORM 마이그레이션 파일들을 포함합니다.

## Migration 실행 순서

### 1. 기본 테이블 생성 (2025-03-22)
- `20250322010100-CreateUsersTable.ts` - 사용자 테이블 생성
- `20250322010200-CreateItemsTable.ts` - 아이템 테이블 생성
- `20250322020300-CreateOnlineStorageTable.ts` - 온라인 스토리지 테이블 생성
- `20250322020400-CreateMarketplaceItemsTable.ts` - 마켓플레이스 아이템 테이블 생성

### 2. 월렛 및 통화 시스템 (2025-03-29)
- `20250329000100-CreateWalletsAndCurrenciesTables.ts` - 월렛 및 통화 테이블 생성
- `20250329000250-UpdateItemsTableStructure.ts` - 아이템 테이블 구조 업데이트
  - icons 컬럼 추가
  - index_name 컬럼 추가 (unique)
  - name → display_name 컬럼명 변경
  - rarity 컬럼 기본값 설정

### 3. 테이블 구조 개선 (2025-04)
- `20250413000150-UpdateOnlineStorageStructure.ts` - 온라인 스토리지 구조 업데이트
  - ID를 bigint로 변경
  - steam_id 기본값 설정
  - online_storage_items 테이블 생성 (관계형 구조로 변경)
- `20250414000150-UpdateUsersTableStructure.ts` - 사용자 테이블 구조 업데이트
  - 기본키 추가
  - score 컬럼 추가 (float 타입)

### 4. 게임 시스템 확장 (2025-06)
- `20250629000100-CreateGamesAndServersTable.ts` - 게임 및 서버 테이블 생성
- `20250629000200-UpdateCurrenciesTable.ts` - 통화 테이블 업데이트
- `20250629000300-UpdateWalletsTable.ts` - 월렛 테이블 업데이트
- `20250629000400-InsertInitialGameData.ts` - 초기 게임 데이터 삽입
- `20250629000500-MigrateExistingWalletData.ts` - 기존 월렛 데이터 마이그레이션
- `20250629050000-CreateGameSchemas.ts` - 게임별 스키마 생성
- `20250629100000-CreateValheimTables.ts` - Valheim 게임 테이블 생성
- `20250630163000-CreateDropTable.ts` - 드롭 테이블 생성

### 5. MuffinCraft 통합 (2025-07)
- `20250704000100-CreateMuffinCraftLinkTables.ts` - MuffinCraft 연동 테이블 생성

## 마이그레이션 실행 방법

```bash
# 마이그레이션 실행
npm run migration:run

# 마이그레이션 되돌리기
npm run migration:revert

# 새 마이그레이션 생성
npm run migration:generate -- -n MigrationName
```

## 주요 변경사항

### 2024-07-04 정리 작업
- 중복된 마이그레이션 파일들 제거
- 관련된 작은 마이그레이션들을 논리적 단위로 통합
- 파일명과 실행 순서 정리

### 통합된 마이그레이션
- Items 테이블 관련 4개 마이그레이션 → `UpdateItemsTableStructure`로 통합
- OnlineStorage 관련 4개 마이그레이션 → `UpdateOnlineStorageStructure`로 통합  
- Users 테이블 관련 3개 마이그레이션 → `UpdateUsersTableStructure`로 통합

이로써 마이그레이션 파일 수를 크게 줄이고 관리가 용이해졌습니다.
