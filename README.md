```markdown
# 🎮 Game Hub NestJS Backend

![TypeScript](https://img.shields.io/badge/language-TypeScript-007ACC)
![Docker](https://img.shields.io/badge/using-Docker-2496ED)

**A scalable backend API for a multi‑game platform**

Game Hub is a RESTful API backend built with NestJS and TypeORM that manages users, game items, online storage, a marketplace, and a unified wallet system. It currently supports games like Space Engineers and Valheim, providing a modular architecture that allows for easy integration of additional games in the future.

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
- **JWT-based authentication** for secure API access.
- **Steam OAuth integration** for seamless platform login, enhancing user experience.
- **Role-based access control** to enforce fine‑grained permissions for different user roles.

### 💰 Unified Wallet System
- **Multi-game wallet** that can be shared or segmented per game/server, allowing for flexible financial management.
- **Support for multiple currencies**, including global and game-specific currencies.
- **Full transaction audit trail** to track all wallet activities.
- **Atomic secure transactions** leveraging database transactions for integrity.

### 🎮 Multi-Game Support
- **Space Engineers**: Manage items, online storage, and damage logs effectively.
- **Valheim**: Track characters, worlds, inventory, buildings, and skills.
- **Pluggable design** facilitates adding new games with minimal coupling, making it scalable.

### 🏗️ Hybrid Schema Architecture
- **Shared data** is maintained in a `public` schema, including users, wallets, currencies, and games.
- **Game-specific schemas** are used to isolate per-game entities, ensuring data integrity.
- **Cross-game aggregation** is enabled without duplicating identity data, which enhances performance.

### 🛠️ Developer Friendly
- **TypeScript** is used throughout the codebase, ensuring type safety and better maintainability.
- **TypeORM migrations** facilitate safe schema evolution and database management.
- **Centralized logging middleware** provides structured logs for easier debugging and monitoring.

## 🔧 Architecture

This project is implemented using the following technologies and tools:

- **Backend Framework**: NestJS (in TypeScript)
- **ORM**: TypeORM for database interactions.
- **Database**: PostgreSQL for data storage.
- **Authentication**: Passport.js combined with JWT and Steam OAuth for secure access.
- **Process Manager**: PM2 for managing application processes.
- **Reverse Proxy**: Nginx for handling incoming requests and load balancing.
- **Containerization**: Docker and Docker Compose for development and deployment.

### 🏗️ Module Layout

The application is structured into several modules, each serving a specific purpose:

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

To get started with the Game Hub backend, follow these simple steps:

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

### 4️⃣ Verify the Setup
```bash
curl http://localhost:4000/health
open http://localhost:4000
```

## ⚙️ Environment Configuration

Environment variables are managed via the `.env` file. Key configurations include:

### 🗄️ Database
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=game_hub_db
DB_SSL=false  # Set to true in production if using SSL
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

Refer to the full list in `.env.example` for all environment variables.

## Database Migrations

> **NOTE:** A dedicated safe migration script is referenced here, but it is not currently present in the repository. Use the manual commands below unless you add such a script.

### Manual Migration Commands
```bash
# Generate a new migration (provide a name)
npm run migration:generate -- --name <MigrationName>

# Run pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert
```

### 🛡️ Important Notes
- Always back up your database before running migrations.
- Test migrations in a development environment first.
- Refer to `DATABASE_MIGRATION_GUIDE.md` for detailed instructions.
- Validate wallet schema changes against existing transaction integrity to avoid data loss.

### Wallet System Highlights
- Multi-game and per-server wallet support.
- Support for multiple currencies (both global and game-specific).
- Full immutable transaction history for transparency.
- Extensible currency model to accommodate future needs.

## Game-Specific Modules

### Space Engineers (`space_engineers` schema)
- Manage item inventories and online storage efficiently.
- Track damage logs and player-related entities for enhanced gameplay analytics.

### Valheim (`valheim` schema)
- Oversee character and skills management.
- Handle item, inventory, and building data, ensuring a rich user experience.

## 📋 Testing

For testing, this project includes a dedicated test suite. To run the tests, use:
```bash
npm run test
```

This will execute all unit tests and provide feedback on your code quality and functionality.

## 🗂️ Project Structure

The project is organized into the following directories:
- `src/`: Contains the main application code (112 files).
- `root/`: Contains configuration and environment files (24 files).
- `test/`: Contains unit tests (6 files).
- `config/`: Contains additional configuration files (1 file).
- `scripts/`: Contains any auxiliary scripts (1 file).

## 🤝 Contributing

Contributions are welcome! To contribute to the Game Hub project:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/new-feature`).
3. Make your changes and commit (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature/new-feature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Feel free to explore the codebase, contribute, and help enhance the Game Hub experience!
```