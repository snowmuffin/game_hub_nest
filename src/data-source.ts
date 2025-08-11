import { DataSource } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'snowmuffin',
  entities: [path.join(process.cwd(), 'src/**/*.entity{.ts,.js}')],
  migrations: [path.join(process.cwd(), 'src/migrations/*{.ts,.js}')],
  // Always use migrations instead of synchronize for safety
  synchronize: false,
  logging:
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'schema']
      : ['error'],
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  // Migration configuration
  migrationsRun: false, // Don't auto-run migrations on startup
  migrationsTableName: 'migrations_history',
  // Schema support for multi-tenant setup
  extra: {
    // Create schemas if they don't exist
    createSchema: true,
  },
});
