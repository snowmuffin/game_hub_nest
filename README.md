# 🎮 Game Hub NestJS Backend

**A scalable backend API for a multi‑game platform**

Game Hub is a RESTful API backend built with NestJS and TypeORM that manages users, game items, online storage, a marketplace, and a unified wallet system. It currently supports Space Engineers and Valheim and provides a modular structure that makes it easy to integrate additional games.

## 📑 Table of Contents
- [Features](#-features)
- [Architecture](#-architecture)
- [System Requirements](#-system-requirements)
- [Quick Start](#-quick-start)
- [Environment Configuration](#-environment-configuration)
- [Database Migrations](#-database-migrations)
- [Running the Application](#-running-the-application)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🔐 Authentication
- **JWT-based authentication** for secure API access
- **Steam OAuth integration** for seamless platform login
- **Role-based access control** for fine‑grained permissions

### 💰 Unified Wallet System
- **Multi-game wallet** shared or segmented per game/server
- **Multiple currencies** (global + game-specific)
- **Full transaction audit trail**
- **Atomic secure transactions** using DB transactions

### 🎮 Multi-Game Support
- **Space Engineers**: items, online storage, damage logs
- **Valheim**: characters, worlds, inventory, buildings, skills
- **Pluggable design** to add new games with minimal coupling

### 🏗️ Hybrid Schema Architecture
- **Shared data** in `public` schema (users, wallets, currencies, games)
- **Game-specific schemas** isolate per-game entities
- **Cross‑game aggregation** without duplicating identity data

### 🛠️ Developer Friendly
- **TypeScript** throughout for type safety
- **TypeORM migrations** for safe schema evolution
- **Centralized logging** middleware & structured logs

## 🔧 Architecture

Implemented with:

- **Backend Framework**: NestJS (TypeScript)
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Authentication**: Passport.js + JWT + Steam OAuth
- **Process Manager**: PM2
- **Reverse Proxy**: Nginx
- **Containerization**: Docker & Docker Compose

### 🏗️ Module Layout

```
AppModule
├── Core
│   ├── ConfigModule (global)
│   └── TypeOrmModule (global)
├── Auth
│   ├── AuthModule
│   └── UserModule
├── Wallet
│   └── WalletModule
├── Games
│   ├── GameModule
│   ├── SpaceEngineersModule
│   └── ValheimModule
```

## 📋 System Requirements

### Minimum
- **Node.js**: v20.0.0+
- **npm**: v8.0.0+
- **PostgreSQL**: v13+
- **Memory**: 1GB RAM
- **Disk**: 2GB free

### Recommended (Production)
- **Node.js**: v20 LTS
- **Memory**: 4GB+ RAM
- **CPU**: 2 cores+
- **Disk**: 10GB+ SSD

## 🚀 Quick Start

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/game_hub_nest.git
cd game_hub_nest
```

### 2️⃣ Configure Environment
```bash
cp .env.example .env
nano .env
```

### 3️⃣ Start Development Environment
```bash
./start-dev.sh
```

### 4️⃣ Verify
```bash
curl http://localhost:4000/api/health
open http://localhost:4000/api
```

## ⚙️ Environment Configuration

Environment variables are managed via `.env`.

### 🗄️ Database
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=game_hub_db
DB_SSL=false  # set true in production if using SSL
```

### 🔐 Auth
```bash
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
STEAM_API_KEY=your_steam_api_key_here
STEAM_RETURN_URL=http://localhost:4000/auth/steam/return
```

### 🌐 Server
```bash
NODE_ENV=development
PORT=4000
HOST=0.0.0.0
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

See the full list in `.env.example`:
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

> NOTE: A dedicated safe migration script is referenced here, but not currently present in the repository. Use the manual commands below unless you add such a script.

### Manual Migration Commands
```bash
# Generate a new migration (provide a name)
npm run migration:generate -- --name <MigrationName>

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### 🛡️ Important Notes
- Always back up your database before running migrations
- Test migrations in development first
- See `DATABASE_MIGRATION_GUIDE.md` for detailed instructions
- Wallet schema changes should be validated against existing transaction integrity

### Wallet System Highlights
- Multi-game + per-server wallet support
- Multiple currencies (global + per game)
- Full immutable transaction history
- Extensible currency model

## Game-Specific Modules

### Space Engineers (`space_engineers` schema)
- Damage logs tracking
- Item management & online storage
- Player-related entities

### Valheim (`valheim` schema)
- Character & skills management
- Item & inventory handling
- Buildings & world data
- Skills progression + (planned) boss tracking

### Database Architecture

Hybrid schema design:

- **Public schema**: users, games, wallets, currencies, transactions
- **Game schemas**: isolated game-specific tables
  - `space_engineers.*`
  - `valheim.*`
  - `minecraft.*` (reserved for future integration)

Benefits:
- ✅ Isolation of game domains
- ✅ Shared identity + wallet context
- ✅ Scales with additional games
- ✅ Security boundaries per schema

> A separate `WALLET_SYSTEM.md` is referenced in code comments but not present yet. Consider adding it for deeper design details.

## Running the Application
```bash
# Development (hot reload)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## Project Structure
```
src/
├── auth/                  # Authentication (JWT & Steam)
├── entities/              # TypeORM entities (shared + game-specific)
├── game/                  # Game registry & management
├── wallet/                # Multi-game wallet logic
├── middleware/            # Logging & other middlewares
├── Space_Engineers/       # Space Engineers domain modules
│   ├── damage-logs/
│   └── item/
├── Valheim/               # Valheim domain modules
│   ├── building/
│   ├── character/
│   ├── inventory/
│   ├── item/
│   ├── skills/
│   └── world/
├── utils/                 # Utilities & helpers
├── app.module.ts          # Root module
├── main.ts                # Bootstrap entry
└── data-source.ts         # TypeORM data source config
```

## Contributing
Contributions are welcome—open an issue or submit a PR with clear context.

## License
Private project (no open-source license). All rights reserved.
