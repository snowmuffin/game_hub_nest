# Game Hub NestJS Backend - Project Structure Guide

## 📁 Directory Layout

```
game_hub_nest/
├── 📝 Config & Root Docs
│   ├── .env.example                    # Environment variable template
│   ├── package.json                    # Dependencies & scripts
│   ├── tsconfig.json                   # TypeScript config
│   ├── nest-cli.json                   # Nest CLI config
│   ├── ecosystem.config.js             # PM2 process config
│   ├── docker-compose.yml              # Dev/test docker stack
│   ├── Dockerfile                      # Image build recipe
│   ├── nginx.conf.example              # Nginx reverse proxy template
│   └── .gitignore                      # Git ignore rules
│
├── 🚀 Deployment & Ops
│   ├── deploy.sh                       # Automated deployment script
│   ├── start-dev.sh                    # Local dev bootstrap
│   ├── cleanup.sh                      # Cleanup helper
│   ├── server-setup.sh                 # Initial server provisioning
│   ├── DEPLOYMENT.md (missing)         # Deployment guide (referenced, not present)
│   ├── AWS_DEPLOYMENT_GUIDE.md (missing) # AWS deployment guide (referenced, not present)
│   └── logs/                           # Runtime logs (git-ignored)
│
├── 🗄️ Database
│   ├── src/data-source.ts              # TypeORM data source
│   ├── src/migrations/                 # Migration files
│   ├── SCHEMA_DESIGN.md (missing)      # Schema design doc (referenced, not present)
│   ├── MIGRATION_SAFETY_GUIDE.md (missing) # Migration safety doc (use DATABASE_MIGRATION_GUIDE.md)
│   └── WALLET_SYSTEM.md (missing)      # Wallet design doc (planned)
│
├── 📚 Documentation
│   ├── README.md                       # Main project overview
│   ├── PROJECT_STRUCTURE.md            # This structure guide
│   └── PROJECT_CLEANUP_REPORT.md (missing) # Cleanup report (referenced, not present)
│
├── 🎯 Core Application
│   ├── src/
│   │   ├── main.ts                     # Application bootstrap
│   │   ├── app.module.ts               # Root module
│   │   ├── app.controller.ts           # Basic controller
│   │   └── app.service.ts              # Basic service
│   │
│   ├── 🔐 Authentication
│   │   └── src/auth/
│   │       ├── auth.module.ts          # Auth module
│   │       ├── auth.controller.ts      # Auth endpoints
│   │       ├── auth.service.ts         # Auth logic
│   │       ├── jwt-auth.guard.ts       # JWT guard
│   │       └── steam.strategy.ts       # Steam OAuth strategy
│   │
│   ├── 👤 Users
│   │   └── src/user/                   # User module
│   │
│   ├── 💰 Wallet System
│   │   └── src/wallet/
│   │       └── src/entities/
│   │           ├── wallet.entity.ts
│   │           ├── currency.entity.ts
│   │           └── wallet-transaction.entity.ts
│   │
│   ├── 🎮 Game Core
│   │   ├── src/game/                   # Game registry & logic
│   │   └── src/entities/
│   │       ├── game.entity.ts
│   │       └── game-server.entity.ts
│   │
│   ├── 🚀 Space Engineers
│   │   └── src/Space_Engineers/
│   │       ├── space-engineers.module.ts
│   │       ├── item/                   # Item management
│   │       ├── storage/                # Online storage
│   │       └── damage-logs/            # Damage logs
│   │
│   ├── ⚔️ Valheim
│   │   └── src/Valheim/
│   │       ├── valheim.module.ts
│   │       ├── character/              # Character domain
│   │       ├── world/                  # World domain
│   │       └── inventory/              # Inventory domain
│   │
│   ├── 🛠️ Utilities
│   │   ├── src/middleware/             # Logging & other middleware
│   │   └── src/utils/                  # Shared utilities
│   │
│   └── 🧪 Tests
│       └── test/                       # Test files
```

## 🔧 Key Components

### 1. Environment Configuration
- Separate dev/prod via `.env`
- Strict TypeScript compiler settings
- ESLint + Prettier for style & consistency

### 2. Database Architecture
- Hybrid schema layout:
  - `public`: shared data (users, wallets, games)
  - `space_engineers`: Space Engineers domain
  - `valheim`: Valheim domain
- TypeORM migrations for evolution
- PostgreSQL as primary store

### 3. Authentication System
- JWT for API auth
- Steam OAuth strategy
- Role-based access control (extensible)

### 4. Multi-Game Wallet System
- Unified or per‑game currency handling
- Full transaction history
- Multi-currency extensibility

### 5. Deployment & Operations
- PM2 process supervision
- Nginx reverse proxy
- Docker containerization
- Scripted deployment pipeline

## 📊 Module Dependencies

```
AppModule
├── ConfigModule (global)
├── TypeOrmModule (global)
├── AuthModule
│   ├── JwtModule
│   └── PassportModule
├── UserModule
├── WalletModule
├── GameModule
├── SpaceEngineersModule
│   ├── ItemModule
│   ├── StorageModule
│   └── DamageLogsModule
└── ValheimModule
  ├── CharacterModule
  ├── WorldModule
  └── InventoryModule
```

## 🎯 Development Guidelines

### 1. Adding a New Game
1. Create `src/{GameName}/` directory
2. Implement `{GameName}Module`
3. Create dedicated DB schema
4. Annotate entities with `@Entity({ schema: '{game_schema}' })`
5. Register the module in `AppModule`

### 2. Building an API Module
1. Define DTOs (validation with class-validator)
2. Model entities & relationships
3. Implement service logic (transaction boundaries where needed)
4. Expose controller endpoints with proper HTTP codes
5. Apply guards/interceptors (auth, logging, caching as needed)

### 3. Database Changes
1. Generate migration: `npm run migration:generate -- --name <Name>`
2. Review and adjust SQL if necessary
3. Backup production DB
4. Apply: `npm run migration:run`
5. Monitor logs & rollback with `npm run migration:revert` if issues occur

## 🔍 Code Quality

- **ESLint**: linting rules enforcement
- **Prettier**: consistent formatting
- **Jest**: unit & (future) e2e tests
- **TypeScript**: static type safety
- **Husky (planned)**: pre-commit hooks

## 📈 Performance

- **PM2 cluster mode** for multi-process scaling
- **DB indexing** on high-read columns
- **Redis caching (planned)** for hot paths
- **Gzip compression** via Nginx or middleware

## 🛡️ Security Considerations

- **Environment isolation** for secrets
- **CORS whitelist** configuration
- **Rate limiting (planned)** to mitigate abuse
- **Input validation** via DTOs
- **JWT rotation (future)** for enhanced token security
