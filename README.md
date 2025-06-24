# Game Hub NestJS Backend

Game Hub is a RESTful API backend built with NestJS and TypeORM for managing users, game items, online storage, and marketplace assets.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Database Migrations](#database-migrations)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features
- User authentication with JWT and Steam OAuth
- CRUD operations for items, storage and marketplace
- Role-based access control via guards and decorators
- Centralized logging middleware
- Database migrations managed by TypeORM

## Architecture
This project is implemented with:
- NestJS framework (TypeScript)
- TypeORM for database abstraction
- PostgreSQL as the primary datastore
- Passport.js strategies for authentication

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
Generate and apply migrations with the npm scripts:
```bash
# Generate a new migration (provide a name)
npm run migration:generate -- --name <MigrationName>

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

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
├── middleware/            # Application-wide middleware
├── migrations/            # Database migration files
├── Space_Engineers/       # Game-specific modules
│   ├── damage-logs/       # Damage log API
│   ├── item/              # Item management API
│   └── user/              # User profile API
├── utils/                 # Helper functions and utilities
├── app.module.ts          # Root module
├── main.ts                # Entry point
└── data-source.ts         # TypeORM data source configuration
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request with your changes.

## License
This project is private and unlicensed.
