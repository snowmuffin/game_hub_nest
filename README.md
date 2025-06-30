# Game Hub - Multi-Game Backend Platform

🎮 Game Hub is a comprehensive RESTful API backend built with NestJS and TypeORM, designed to support multiple games with automated module generation capabilities.

## 🌟 Key Features

### 🚀 Automated Module Generation
- **Advanced CLI Generator**: Create complete game modules with a few commands
- **Template-Based Generation**: Pre-built templates for popular games (Minecraft, Terraria, Space Engineers, etc.)
- **Custom Configuration**: Fully customizable modules with detailed endpoint and database configuration

### 🎮 Multi-Game Support
- **Space Engineers**: Item management, damage logs, server status
- **Minecraft**: Block/item management, world data, player statistics  
- **Valheim**: Character progression, building system, world management
- **Terraria**: Character data, progression tracking, world events
- **MMORPG Templates**: Guild systems, quest management, complex character systems

### 🛠️ Core Features
- User authentication with JWT and Steam OAuth
- **Multi-game wallet system** with currency management
- **Multi-game support**: Space Engineers & Valheim with dedicated schemas
- **Hybrid schema architecture**: Common data in public, game-specific data in separate schemas
- CRUD operations for items, storage and marketplace
- Role-based access control via guards and decorators
- Centralized logging middleware
- Database migrations managed by TypeORM
- Safe migration tools with automatic backup

## 🚀 Quick Start - Generate Your First Game Module

### Generate a new game module in 30 seconds:
```bash
# Use the advanced generator with templates
npm run generate:game-module-v2

# Choose from existing templates:
# - minecraft: Full Minecraft server integration
# - terraria: Character and world management
# - mmorpg: Guild, quest, and character systems
# - survival: Base building and resource management
# - racing: Track, vehicle, and leaderboard systems

# Or create completely custom modules with detailed configuration
```

### Project Management:
```bash
# List all projects and templates
npm run project-manager list

# Validate a project
npm run project-manager validate MyGame

# Generate documentation
npm run project-manager generate-docs MyGame

# Create backups
npm run project-manager backup MyGame
```

📖 **Detailed Guide**: See [MODULE_GENERATOR_README.md](MODULE_GENERATOR_README.md) for comprehensive documentation.

## Architecture
This project is implemented with:
- NestJS framework (TypeScript)
- TypeORM for database abstraction
- PostgreSQL as the primary datastore
- Passport.js strategies for authentication
- **Automated Module Generation System** with CLI tools and templates

## Requirements
- Node.js v18 or higher
- npm (or yarn)
- PostgreSQL database

## Getting Started
```bash
# Clone the repository
git clone https://github.com/<username>/game_hub_nest.git
cd game_hub_nest

# Install dependencies
npm install
```

## Configuration
Create a `.env` file in the project root and set the following variables:
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
