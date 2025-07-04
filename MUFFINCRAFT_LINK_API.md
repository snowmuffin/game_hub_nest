# MuffinCraft 링크 시스템 API

MuffinCraft에서 사용자와 마인크래프트 캐릭터를 연동하는 시스템입니다.

## API 엔드포인트

### 1. 링크 코드 생성 (사용자 웹사이트용)
- **POST** `/muffincraft/link/generate`
- **인증**: JWT 토큰 필요
- **설명**: 로그인한 사용자가 마인크래프트 캐릭터와 연동하기 위한 8자리 코드를 생성합니다.

**응답 예시:**
```json
{
  "code": "ABC12345",
  "expiresAt": "2024-07-04T12:30:00.000Z"
}
```

### 2. 캐릭터 연동 (마인크래프트 플러그인용)
- **POST** `/muffincraft/link/verify`
- **인증**: 불필요
- **설명**: 마인크래프트 플러그인에서 링크 코드를 통해 캐릭터를 연동합니다.

**요청 본문:**
```json
{
  "code": "ABC12345",
  "minecraftUsername": "PlayerName",
  "minecraftUuid": "550e8400-e29b-41d4-a716-446655440000"
}
```

**응답 예시:**
```json
{
  "success": true,
  "message": "캐릭터가 성공적으로 연동되었습니다."
}
```

### 3. 연동된 캐릭터 목록 조회
- **GET** `/muffincraft/characters`
- **인증**: JWT 토큰 필요
- **설명**: 사용자에게 연동된 모든 마인크래프트 캐릭터 목록을 반환합니다.

**응답 예시:**
```json
[
  {
    "id": 1,
    "minecraft_username": "PlayerName",
    "minecraft_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "is_linked": true,
    "created_at": "2024-07-04T10:00:00.000Z"
  }
]
```

### 4. 캐릭터 연동 해제
- **DELETE** `/muffincraft/characters/:characterId`
- **인증**: JWT 토큰 필요
- **설명**: 특정 캐릭터의 연동을 해제합니다.

**응답 예시:**
```json
{
  "success": true,
  "message": "캐릭터 연동이 해제되었습니다."
}
```

### 5. UUID로 사용자 ID 조회 (마인크래프트 플러그인용)
- **GET** `/muffincraft/user/by-uuid/:uuid`
- **인증**: 불필요
- **설명**: 마인크래프트 UUID를 통해 연동된 사용자 ID를 조회합니다.

**응답 예시:**
```json
{
  "userId": 123
}
```

## 사용 flow

1. **사용자가 웹사이트에서 링크 요청**
   - 로그인 후 `/muffincraft/link/generate` 호출
   - 8자리 코드 받음 (10분간 유효)

2. **마인크래프트에서 명령어 입력**
   - 플레이어가 `/link ABC12345` 같은 명령어 입력
   - 플러그인이 `/muffincraft/link/verify` API 호출

3. **연동 완료**
   - 성공 시 캐릭터와 사용자 계정이 연동됨
   - 이후 플러그인은 UUID로 사용자 정보 조회 가능

## 데이터베이스 테이블

### muffincraft_characters
- 마인크래프트 캐릭터 정보 저장
- 사용자와의 연동 상태 관리

### muffincraft_link_codes
- 임시 링크 코드 저장
- 10분 후 자동 만료
- 일회용 (사용 후 is_used = true)

## 보안 고려사항

- 링크 코드는 10분 후 자동 만료
- 한 번 사용한 코드는 재사용 불가
- 이미 연동된 캐릭터는 다른 계정에 연동 불가
- 사용자당 동시에 하나의 링크 코드만 유효
