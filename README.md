# 🎮 Game Hub NestJS Backend

**멀티게임 플랫폼을 위한 확장 가능한 백엔드 API**

Game Hub는 NestJS와 TypeORM으로 구축된 RESTful API 백엔드로, 사용자 관리, 게임 아이템, 온라인 스토리지, 마켓플레이스 등을 관리합니다. 현재 Space Engineers와 Valheim을 지원하며, 새로운 게임을 쉽게 추가할 수 있는 모듈화된 구조를 제공합니다.

## 📑 목차
- [주요 기능](#-주요-기능)
- [시스템 아키텍처](#-시스템-아키텍처)
- [시스템 요구사항](#-시스템-요구사항)
- [빠른 시작](#-빠른-시작)
- [환경 설정](#-환경-설정)
- [데이터베이스 관리](#-데이터베이스-관리)
- [애플리케이션 실행](#-애플리케이션-실행)
- [배포 가이드](#-배포-가이드)
- [테스트](#-테스트)
- [프로젝트 구조](#-프로젝트-구조)
- [API 문서](#-api-문서)
- [기여하기](#-기여하기)

## ✨ 주요 기능

### 🔐 인증 시스템
- **JWT 토큰 기반 인증**: 안전한 API 접근 제어
- **Steam OAuth 연동**: 게임 플랫폼과의 seamless 연동
- **Role-based Access Control**: 권한 기반 세밀한 접근 제어

### 💰 통합 지갑 시스템
- **멀티게임 지갑**: 게임 간 화폐 공유 및 관리
- **다중 화폐 지원**: 게임별 고유 화폐 시스템
- **거래 내역 추적**: 모든 거래의 완전한 감사 로그
- **안전한 거래**: 트랜잭션 기반 안전한 화폐 이동

### 🎮 멀티게임 지원
- **Space Engineers**: 아이템 관리, 온라인 스토리지, 데미지 로그
- **Valheim**: 캐릭터, 월드, 인벤토리, 건물 관리
- **확장 가능한 구조**: 새 게임 추가를 위한 플러그인 방식

### 🏗️ 하이브리드 스키마 아키텍처
- **공통 데이터**: `public` 스키마에서 사용자, 지갑, 게임 정보 관리
- **게임별 데이터**: 각 게임 전용 스키마로 독립적 데이터 관리
- **크로스게임 쿼리**: 통합된 데이터 접근 및 분석

### 🛠️ 개발자 친화적
- **TypeScript**: 완전한 타입 안전성
- **자동 마이그레이션**: TypeORM 기반 안전한 DB 스키마 관리
- **중앙집중식 로깅**: 모든 요청과 오류의 체계적 로깅
## 🔧 시스템 아키텍처

이 프로젝트는 다음 기술스택으로 구현되었습니다:

- **Backend Framework**: NestJS (TypeScript)
- **Database ORM**: TypeORM
- **Database**: PostgreSQL
- **Authentication**: Passport.js + JWT + Steam OAuth
- **Process Manager**: PM2
- **Reverse Proxy**: Nginx
- **Containerization**: Docker & Docker Compose

### 🏗️ 모듈 구조

```
AppModule
├── 🔧 Core Modules
│   ├── ConfigModule (Global)
│   └── TypeOrmModule (Global)
├── 🔐 Authentication
│   ├── AuthModule
│   └── UserModule
├── 💰 Wallet System
│   └── WalletModule
├── 🎮 Game Management
│   ├── GameModule
│   ├── SpaceEngineersModule
│   └── ValheimModule
```

## 📋 시스템 요구사항

### 최소 요구사항
- **Node.js**: v20.0.0 이상
- **npm**: v8.0.0 이상  
- **PostgreSQL**: v13 이상
- **메모리**: 최소 1GB RAM
- **디스크**: 최소 2GB 여유 공간

### 권장 사양 (프로덕션)
- **Node.js**: v20 LTS
- **메모리**: 4GB RAM 이상
- **CPU**: 2코어 이상
- **디스크**: SSD 10GB 이상

## 🚀 빠른 시작

### 1️⃣ 저장소 클론
```bash
git clone https://github.com/your-username/game_hub_nest.git
cd game_hub_nest
```

### 2️⃣ 환경 설정
```bash
# 환경 파일 생성
cp .env.example .env

# 환경변수 수정 (에디터로 .env 파일 편집)
nano .env
```

### 3️⃣ 개발 환경 시작
```bash
# 개발 환경 자동 설정 및 시작
./start-dev.sh
```

### 4️⃣ 접속 확인
```bash
# Health check
curl http://localhost:4000/api/health

# API 문서 (브라우저에서)
open http://localhost:4000/api
```

## ⚙️ 환경 설정

환경변수는 `.env` 파일을 통해 관리됩니다. 주요 설정 항목:

### 🗄️ 데이터베이스 설정
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=game_hub_db
DB_SSL=false  # 프로덕션에서는 true
```

### 🔐 인증 설정
```bash
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
STEAM_API_KEY=your_steam_api_key_here
STEAM_RETURN_URL=http://localhost:4000/auth/steam/return
```

### 🌐 서버 설정
```bash
NODE_ENV=development
PORT=4000
HOST=0.0.0.0
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

**전체 설정 옵션은 `.env.example` 파일을 참조하세요.**
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=game_hub
JWT_SECRET=your_jwt_secret
STEAM_API_KEY=your_steam_api_key
```

## Database Migrations

### Safe Migration Tool (Recommended)
Use the safe migration script that automatically backs up your data:

```bash
# Step-by-step migration (recommended)
./safe-migration.sh step

# Full migration (after testing)
./safe-migration.sh all

# Rollback if needed
./safe-migration.sh rollback

# Restore from backup
./safe-migration.sh restore
```

### Manual Migration Commands
Generate and apply migrations with the npm scripts:
```bash
# Generate a new migration (provide a name)
npm run migration:generate -- --name <MigrationName>

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### 🛡️ Important Notes
- **Always backup your database before running migrations**
- Test migrations in development environment first
- Check `MIGRATION_SAFETY_GUIDE.md` for detailed instructions
- Wallet system migration will backup existing data automatically

### New Wallet System
The new multi-game wallet system includes:
- Support for multiple games (Space Engineers, Valheim, etc.)
- Server-specific wallets within games
- Multiple currencies (game-specific + global currencies)
- Complete transaction history tracking
- Safe migration from existing wallet data

### Game-Specific Modules

### Game-Specific Modules

#### Space Engineers (space_engineers schema)
- Damage logs tracking
- Item management
- User profiles

#### Valheim (valheim schema)
- Character management with skills system
- Item and inventory management
- Building and construction tracking
- World and biome exploration
- Boss encounter tracking
- Skills progression system

### Database Architecture

The project uses a **hybrid schema approach**:

- **Public Schema**: Common data (users, games, wallets, currencies, transactions)
- **Game Schemas**: Game-specific data isolated in dedicated schemas
  - `space_engineers.*` - All Space Engineers specific tables
  - `valheim.*` - All Valheim specific tables
  - `minecraft.*` - Ready for future Minecraft integration

This design provides:
- ✅ **Data Isolation**: Game data completely separated
- ✅ **Shared Resources**: Common user and wallet data accessible across games  
- ✅ **Scalability**: Easy to add new games with dedicated schemas
- ✅ **Security**: Fine-grained access control per game

See `WALLET_SYSTEM.md` for detailed documentation.

## Running the Application
```bash
# Development mode with hot reload
npm run start:dev

# Production build and start
npm run build
npm run start:prod
```

## Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage report
npm run test:cov
```

## Project Structure
```
src/
├── auth/                  # Authentication module (JWT & Steam)
├── entities/              # TypeORM entity definitions
├── game/                  # Game management module
├── wallet/                # Multi-game wallet system
├── middleware/            # Application-wide middleware
├── migrations/            # Database migration files
├── Space_Engineers/       # Space Engineers game modules
│   ├── damage-logs/       # Damage log API
│   ├── item/              # Item management API
│   └── user/              # User profile API
├── Valheim/               # Valheim game modules
│   ├── building/          # Building management API
│   ├── character/         # Character management API
│   ├── inventory/         # Inventory management API
│   ├── item/              # Item management API
│   ├── skills/            # Skills progression API
│   └── world/             # World & biome management API
├── utils/                 # Helper functions and utilities
├── app.module.ts          # Root module
├── main.ts                # Entry point
└── data-source.ts         # TypeORM data source configuration
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request with your changes.

## License
This project is private and unlicensed.
