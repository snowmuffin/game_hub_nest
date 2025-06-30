# 🔧 서버 .env 파일 수정 권장사항

## 현재 서버의 .env 파일에 추가/수정해야 할 내용:

### 1. 추가해야 할 환경변수:
```bash
# 가장 중요! - NODE_ENV 추가
NODE_ENV=production

# Steam API URL 추가
STEAM_API_URL=https://api.steampowered.com

# 로깅 설정 추가
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# 보안 관련 추가
HEALTH_CHECK_KEY=production-health-secret-2024
```

### 2. 수정해야 할 환경변수:

```bash
# JWT 시크릿 - 더 안전하게 변경
JWT_SECRET=GameHub-Production-JWT-Secret-2024-SuperSecure-Key

# CORS 설정 - 보안 강화 (선택사항)
Whitelist=https://api.snowmuffingame.com,https://snowmuffingame.com,http://localhost:3000

# 또는 현재대로 모든 도메인 허용하려면
Whitelist=*
```

### 3. Steam OAuth URL 확인:
현재 설정이 `api.snowmuffingame.com`인데, 
Steam에서 등록된 도메인과 일치하는지 확인 필요.

만약 Steam에 `se.snowmuffingame.com`으로 등록되어 있다면:
```bash
RETURN_URL=https://se.snowmuffingame.com/api/auth/steam/return
REALM=https://se.snowmuffingame.com/
```

### 4. 최종 권장 .env 파일:

```bash
# Server Configuration
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# Domain Configuration  
DOMAIN=api.snowmuffingame.com
BASE_URL=https://api.snowmuffingame.com
BACKEND_URL=http://13.125.32.159:4000

# Steam 인증 관련 환경변수
STEAM_API_KEY=E0ACE700D306A5880F0C3F6B393A5346
STEAM_API_URL=https://api.steampowered.com
RETURN_URL=https://api.snowmuffingame.com/api/auth/steam/return
REALM=https://api.snowmuffingame.com/

# CORS Configuration
Whitelist=*

# JWT 관련 환경변수 - 보안 강화
JWT_SECRET=GameHub-Production-JWT-Secret-2024-SuperSecure-Key

# Database 관련 환경변수
DB_HOST=gamehub-spaceengineers.c9ecui4q2er7.ap-northeast-2.rds.amazonaws.com
DB_PORT=5432
DB_USER=Snowmuffin
DB_PASSWORD=Ov0CaSYp]wBEQ]8hj4rAKBfz5prB
DB_NAME=postgres
DB_SSL=true

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Health Check
HEALTH_CHECK_KEY=production-health-secret-2024
```

## 🚨 우선순위:

1. **NODE_ENV=production** (가장 중요!)
2. **STEAM_API_URL** 추가
3. **JWT_SECRET** 보안 강화
4. **LOG_LEVEL, LOG_FILE** 로깅 설정
5. **HEALTH_CHECK_KEY** 보안 설정
