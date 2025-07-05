# MuffinCraft 외부 창고 시스템

## 🎯 개요
MuffinCraft는 마인크래프트 서버와 웹 플랫폼을 연동하는 통합 시스템입니다. 플레이어의 연동 여부와 관계없이 JWT 토큰 기반 인증을 통해 안전하게 서비스를 이용할 수 있습니다.

## 🔐 인증 시스템

### JWT 토큰 발급
- **연동된 플레이어**: 웹 사이트 계정과 연결된 플레이어
- **미연동 플레이어**: 마인크래프트만으로 플레이하는 플레이어
- 모든 플레이어가 자동으로 JWT 토큰을 받아 API 사용 가능

### 토큰 자동 갱신
- 플레이어 접속 시 자동 갱신
- 명령어 사용 시 자동 갱신
- 게임 활동 시 자동 갱신

## 🏦 외부 창고 시스템 (NEW!)

### 개념
- **인게임 인벤토리와 완전히 분리된 별도 창고**
- 웹사이트와 게임 간 아이템 공유 가능
- 플레이어가 수동으로 아이템 입출금 관리

### 사용법

#### 게임 내 명령어
```
/warehouse              - 창고 GUI 열기
/warehouse list         - 창고 아이템 목록 보기  
/warehouse deposit 64   - 손에 든 아이템 64개 입금
/warehouse withdraw DIAMOND 10 - 다이아몬드 10개 출금
/warehouse help         - 도움말 보기
```

#### 웹 API
```typescript
// 창고 아이템 조회
GET /muffincraft/warehouse/my-warehouse
Authorization: Bearer <player_token>

// 아이템 입금
POST /muffincraft/warehouse/deposit
{
  "itemId": "DIAMOND",
  "itemName": "Diamond", 
  "quantity": 10,
  "metadata": {}
}

// 아이템 출금
POST /muffincraft/warehouse/withdraw
{
  "itemId": "DIAMOND",
  "quantity": 5
}
```

## 💰 통화 시스템

### 잔액 조회
```
/balance                - 내 잔액 확인
/balance send <player> <amount> - 다른 플레이어에게 송금
```

### API 엔드포인트
```typescript
GET /muffincraft/currency/balance     - 잔액 조회
POST /muffincraft/currency/transfer   - 송금
```

## 🔄 기존 시스템 변경사항

### ⚠️ DEPRECATED: 자동 인벤토리 동기화
- **기존**: 인게임 인벤토리와 웹 인벤토리 자동 동기화
- **변경**: 외부 창고 시스템으로 대체
- **이유**: 
  - 인게임 플레이와 웹 시스템의 명확한 분리
  - 플레이어의 수동 제어를 통한 안전성 향상
  - 아이템 분실 위험 최소화

### 마이그레이션 가이드
1. **기존 `/inventory` 명령어** → **`/warehouse` 명령어**
2. **자동 동기화** → **수동 입출금**
3. **API 경로**: `/muffincraft/inventory/*` → `/muffincraft/warehouse/*`

## 🛡️ 보안 기능

### 토큰 기반 인증
- JWT 토큰으로 모든 API 요청 보호
- 토큰 만료 시 자동 갱신
- 플레이어별 독립적인 토큰 관리

### 권한 시스템
- `muffincraft.warehouse` - 창고 사용 권한
- `muffincraft.balance` - 통화 사용 권한
- `muffincraft.admin` - 관리자 권한

## 📊 API 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { ... },
  "message": "성공 메시지"
}
```

### 오류 응답
```json
{
  "success": false,
  "error": "오류 메시지",
  "code": "ERROR_CODE"
}
```

## 🔧 설정

### 백엔드 설정
```env
JWT_SECRET=your_jwt_secret
DATABASE_URL=your_database_url
```

### 플러그인 설정 (config.yml)
```yaml
api:
  url: http://localhost:3000
  token: 'server_token'
```

## 🚀 시작하기

### 1. 서버 시작
```bash
# 백엔드 실행
npm run start:dev

# 마인크래프트 서버 실행  
java -Xms2G -Xmx4G -jar paper-1.21.4-232.jar nogui
```

### 2. 플레이어 테스트
1. 마인크래프트 서버에 접속
2. `/warehouse` 명령어로 창고 열기
3. 아이템을 인벤토리에 넣고 `/warehouse deposit 1` 실행
4. 웹사이트에서 창고 확인

## 📈 향후 계획

- [ ] 창고 용량 제한 시스템
- [ ] 아이템 거래 시스템  
- [ ] 창고 공유 기능
- [ ] 모바일 앱 지원

---

**문의사항이나 버그 리포트는 GitHub Issues를 이용해주세요.**
