# MuffinCraft 인증 시스템

MuffinCraft 서버와 웹사이트 유저 계정을 연동하기 위한 인증 시스템입니다.

## 📋 개요

1. **마인크래프트 서버**에서 플레이어가 인증 요청
2. **시스템**이 6자리 인증 코드 생성 및 반환
3. **플레이어**가 웹사이트에서 인증 코드 입력
4. **계정 연동** 완료

## 🚀 API 엔드포인트

### 1. 인증 코드 생성 (마인크래프트 서버용)

```http
POST /muffincraft/auth/generate-code
Content-Type: application/json

{
  "minecraftUsername": "player123",
  "minecraftUuid": "550e8400-e29b-41d4-a716-446655440000" // 선택사항
}
```

**응답:**
```json
{
  "success": true,
  "authCode": "123456",
  "expiresAt": "2025-07-04T12:10:00.000Z",
  "message": "인증 코드가 생성되었습니다. 10분 내에 웹사이트에서 인증을 완료해주세요."
}
```

### 2. 계정 연동 (웹사이트용)

```http
POST /muffincraft/auth/link-account
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "authCode": "123456"
}
```

**응답:**
```json
{
  "success": true,
  "message": "마인크래프트 계정이 성공적으로 연동되었습니다.",
  "player": {
    "minecraftUsername": "player123",
    "minecraftUuid": "550e8400-e29b-41d4-a716-446655440000",
    "linkedAt": "2025-07-04T12:05:00.000Z"
  }
}
```

### 3. 인증 코드 상태 확인

```http
GET /muffincraft/auth/code/123456
```

**응답:**
```json
{
  "success": true,
  "status": {
    "isUsed": false,
    "isExpired": false,
    "expiresAt": "2025-07-04T12:10:00.000Z",
    "minecraftUsername": "player123"
  }
}
```

### 4. 플레이어 정보 조회

```http
GET /muffincraft/auth/player/player123
```

**응답:**
```json
{
  "success": true,
  "isLinked": true,
  "player": {
    "minecraftUsername": "player123",
    "minecraftUuid": "550e8400-e29b-41d4-a716-446655440000",
    "linkedAt": "2025-07-04T12:05:00.000Z"
  }
}
```

### 5. 계정 연동 해제 (웹사이트용)

```http
PUT /muffincraft/auth/unlink
Authorization: Bearer <JWT_TOKEN>
```

**응답:**
```json
{
  "success": true,
  "message": "마인크래프트 계정 연동이 해제되었습니다."
}
```

## 🗃️ 데이터베이스 스키마

### MuffinCraft Players 테이블
```sql
CREATE TABLE "muffincraft_players" (
  "id" SERIAL PRIMARY KEY,
  "userId" integer,                    -- 연동된 웹사이트 유저 ID
  "minecraftUsername" varchar(16) UNIQUE NOT NULL,
  "minecraftUuid" varchar(36) UNIQUE,
  "isLinked" boolean DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);
```

### MuffinCraft Auth Codes 테이블
```sql
CREATE TABLE "muffincraft_auth_codes" (
  "id" SERIAL PRIMARY KEY,
  "authCode" varchar(6) UNIQUE NOT NULL,
  "minecraftUsername" varchar(16) NOT NULL,
  "minecraftUuid" varchar(36),
  "isUsed" boolean DEFAULT false,
  "usedBy" integer,                    -- 사용한 웹사이트 유저 ID
  "expiresAt" TIMESTAMP NOT NULL,      -- 만료 시간 (10분)
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);
```

## 🔧 마인크래프트 플러그인 예시

```java
// 플레이어 인증 요청 예시
public void requestAuth(Player player) {
    String username = player.getName();
    String uuid = player.getUniqueId().toString();
    
    // HTTP POST 요청
    JSONObject requestBody = new JSONObject();
    requestBody.put("minecraftUsername", username);
    requestBody.put("minecraftUuid", uuid);
    
    // API 호출
    String response = httpPost("http://your-server.com/muffincraft/auth/generate-code", requestBody);
    JSONObject result = new JSONObject(response);
    
    if (result.getBoolean("success")) {
        String authCode = result.getString("authCode");
        player.sendMessage("§a인증 코드: §f" + authCode);
        player.sendMessage("§e웹사이트에서 10분 내에 인증을 완료해주세요!");
    }
}
```

## 🛡️ 보안 고려사항

1. **인증 코드 만료**: 10분 후 자동 만료
2. **일회성 사용**: 한 번 사용된 코드는 재사용 불가
3. **JWT 토큰**: 웹 API는 JWT 인증 필요
4. **중복 연동 방지**: 한 계정당 하나의 마인크래프트 계정만 연동

## 📝 사용 흐름

1. **플레이어가 마인크래프트에서 `/link` 명령어 실행**
2. **서버가 인증 코드 생성 API 호출**
3. **플레이어에게 6자리 코드 표시**
4. **플레이어가 웹사이트 로그인 후 코드 입력**
5. **시스템이 계정 연동 처리**
6. **연동 완료!**
