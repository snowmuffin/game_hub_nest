# 멀티 게임 지갑 시스템 설계

## 개요

이 시스템은 유저가 여러 게임과 서버에서 각각 다른 화폐로 된 지갑을 가질 수 있도록 설계되었습니다.

## 데이터베이스 구조

### 1. Games 테이블
- 지원하는 게임들의 정보를 저장
- `code`: 게임의 고유 코드 (예: 'space_engineers', 'minecraft')
- `name`: 게임 이름
- `description`: 게임 설명
- `icon_url`: 게임 아이콘 이미지 URL
- `is_active`: 게임 활성화 상태

### 2. GameServers 테이블
- 각 게임별 서버 정보를 저장
- `game_id`: 소속 게임 ID
- `code`: 서버 코드 (예: 'main', 'creative', 'survival')
- `name`: 서버 이름
- `server_url`: 서버 주소
- `port`: 서버 포트
- `metadata`: 서버별 추가 설정 정보 (JSON)

### 3. Currencies 테이블
- 화폐 정보를 저장 (글로벌 화폐 + 게임별 화폐)
- `game_id`: 게임 ID (NULL이면 글로벌 화폐)
- `code`: 화폐 코드 (예: 'USD', 'SE_CREDITS', 'MC_EMERALD')
- `name`: 화폐 이름
- `symbol`: 화폐 기호
- `type`: 'GLOBAL' 또는 'GAME_SPECIFIC'
- `decimal_places`: 소수점 자릿수

### 4. Wallets 테이블
- 유저의 지갑 정보를 저장
- `user_id`: 지갑 소유자
- `game_id`: 게임 ID
- `server_id`: 서버 ID (NULL이면 게임 전체 지갑)
- `currency_id`: 화폐 ID
- `balance`: 현재 잔액
- `locked_balance`: 거래 중인 잠긴 잔액
- 유니크 인덱스: (user_id, game_id, server_id, currency_id)

### 5. WalletTransactions 테이블
- 지갑 거래 내역을 저장
- `wallet_id`: 대상 지갑
- `user_id`: 거래 실행자
- `transaction_type`: 거래 유형 (DEPOSIT, WITHDRAW, TRANSFER_IN, TRANSFER_OUT, PURCHASE, SALE, REWARD, PENALTY)
- `amount`: 거래 금액
- `balance_before`: 거래 전 잔액
- `balance_after`: 거래 후 잔액
- `description`: 거래 설명
- `reference_id`: 외부 참조 ID
- `status`: 거래 상태 (PENDING, COMPLETED, FAILED, CANCELLED)

## 사용 예시

### 지갑 구조 예시

```
유저 "John"의 지갑들:

1. Space Engineers - Main Server - Space Credits
   - 잔액: 1,500.00 SC

2. Space Engineers - Creative Server - Space Credits
   - 잔액: 500.00 SC

3. Space Engineers - Main Server - Gold Ore
   - 잔액: 25.5000 Au

4. Minecraft - Survival Server - Emerald
   - 잔액: 64 💎

5. 글로벌 - USD
   - 잔액: $10.50
```

### API 사용 예시

#### 1. 지갑 생성/조회
```http
POST /wallet/create
{
  "gameId": 1,
  "serverId": 1,
  "currencyId": 4
}
```

#### 2. 내 지갑 목록 조회
```http
GET /wallet/my-wallets
```

#### 3. 특정 게임의 지갑들 조회
```http
GET /wallet/my-wallets/game/1
```

#### 4. 입금
```http
POST /wallet/transaction
{
  "walletId": 1,
  "type": "DEPOSIT",
  "amount": 100.00,
  "description": "Quest reward"
}
```

#### 5. 지갑 간 전송
```http
POST /wallet/transfer
{
  "fromWalletId": 1,
  "toWalletId": 2,
  "amount": 50.00,
  "description": "Transfer to creative server"
}
```

## 특징

### 1. 다중 게임 지원
- 각 게임마다 독립적인 화폐 시스템
- 게임별 서버 지원
- 크로스 게임 화폐 전송 가능

### 2. 서버별 지갑
- 같은 게임 내에서도 서버별로 별도 지갑
- 서버 간 화폐 이동 추적
- 서버별 경제 시스템 독립성

### 3. 글로벌 화폐
- USD, EUR 등 실제 화폐 지원
- 게임 화폐와 실제 화폐 간 교환 가능

### 4. 거래 추적
- 모든 거래 내역 완전 추적
- 잔액 변화 이력 저장
- 거래 상태 관리

### 5. 확장성
- 새로운 게임 쉽게 추가
- 새로운 화폐 쉽게 추가
- 서버별 메타데이터 지원

## 보안 고려사항

1. **동시성 제어**: 지갑 잔액 업데이트 시 비관적 락 사용
2. **거래 원자성**: 데이터베이스 트랜잭션으로 거래 원자성 보장
3. **권한 검증**: 자신의 지갑에만 접근 가능
4. **잔액 검증**: 출금 시 잔액 부족 체크
5. **거래 로깅**: 모든 거래 완전 로그 기록

## 마이그레이션 순서

1. `20250629000100-CreateGamesAndServersTable.ts` - 게임, 서버 테이블 생성
2. `20250629000200-UpdateCurrenciesTable.ts` - 화폐 테이블 확장
3. `20250629000300-UpdateWalletsTable.ts` - 지갑, 거래 테이블 재구성
4. `20250629000400-InsertInitialGameData.ts` - 초기 데이터 삽입

## 향후 확장 가능성

1. **환율 시스템**: 화폐 간 실시간 환율
2. **거래 수수료**: 거래별 수수료 시스템
3. **자동 거래**: 조건부 자동 거래
4. **지갑 그룹**: 여러 지갑을 그룹으로 관리
5. **거래 한도**: 일일/월간 거래 한도 설정
