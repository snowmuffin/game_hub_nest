import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config();

/**
 * Production Database Schema Setup Script
 *
 * This script safely sets up the database schema for production deployment
 * It handles initial schema creation and migration execution
 */
async function setupProductionSchema() {
  console.log('🚀 Starting production database schema setup...');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'snowmuffin',
    entities: [path.join(process.cwd(), 'src/**/*.entity{.ts,.js}')],
    migrations: [path.join(process.cwd(), 'src/migrations/*{.ts,.js}')],
    synchronize: false, // Never use synchronize in production
    logging: ['error', 'warn'],
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    migrationsTableName: 'migrations_history',
  });

  try {
    console.log('🔍 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Database connection established');

    // Step 1: Create required schemas
    console.log('🏗️ Creating required schemas...');
    await createRequiredSchemas(dataSource);

    // Step 2: Check if this is first deployment
    const isFirstDeployment = await checkIfFirstDeployment(dataSource);

    if (isFirstDeployment) {
      console.log(
        '🎯 First deployment detected - setting up initial schema...',
      );
      await handleFirstDeployment(dataSource);
    } else {
      console.log(
        '🔄 Existing deployment detected - running pending migrations...',
      );
      await runPendingMigrations(dataSource);
    }

    console.log('🎉 Production schema setup completed successfully!');
  } catch (error) {
    console.error('❌ Production schema setup failed:', error);
    throw error;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

async function createRequiredSchemas(dataSource: DataSource) {
  // Create required schemas
  await dataSource.query(`CREATE SCHEMA IF NOT EXISTS "space_engineers"`);
  console.log('✅ space_engineers schema ready');

  await dataSource.query(`CREATE SCHEMA IF NOT EXISTS "valheim"`);
  console.log('✅ valheim schema ready');

  // Create required extensions
  try {
    await dataSource.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    console.log('✅ uuid-ossp extension ready');
  } catch {
    console.log('⚠️ uuid-ossp extension creation skipped (may already exist)');
  }
}

async function checkIfFirstDeployment(
  dataSource: DataSource,
): Promise<boolean> {
  try {
    // Check if migrations table exists
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'migrations_history'
      )
    `);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const migrationsTableExists = Boolean(result?.[0]?.exists);

    if (!migrationsTableExists) {
      return true; // First deployment
    }

    // Check if there are any migrations recorded
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const migrationCount = await dataSource.query(`
      SELECT COUNT(*) as count FROM migrations_history
    `);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const count = parseInt(String(migrationCount?.[0]?.count || '0'), 10);
    return count === 0;
  } catch {
    console.log(
      '🔍 Cannot determine deployment status, treating as first deployment',
    );
    return true;
  }
}

async function handleFirstDeployment(dataSource: DataSource) {
  console.log('🎯 Handling first deployment...');

  // Check if any tables exist (users table is a good indicator)
  const tablesExist = await checkIfTablesExist(dataSource);

  if (!tablesExist) {
    console.log('📋 No existing tables found - this is a clean database');
    console.log('💡 Running migrations to create initial schema...');

    // Run all migrations
    await dataSource.runMigrations();
    console.log('✅ Initial migrations executed successfully');
  } else {
    console.log('⚠️ Some tables already exist - manual review recommended');
    console.log('💡 Please check your database state manually');
  }
}

async function checkIfTablesExist(dataSource: DataSource): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users' 
        AND table_schema = 'public'
      )
    `);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return Boolean(result?.[0]?.exists);
  } catch {
    return false;
  }
}

async function runPendingMigrations(dataSource: DataSource) {
  try {
    // Check for pending migrations
    const hasPendingMigrations = await dataSource.showMigrations();

    if (hasPendingMigrations) {
      console.log('📋 Found pending migrations, executing...');
      await dataSource.runMigrations();
      console.log('✅ Pending migrations executed successfully');
    } else {
      console.log('✅ No pending migrations - database is up to date');
    }
  } catch {
    console.log('📋 Running migrations...');
    await dataSource.runMigrations();
    console.log('✅ Migrations executed successfully');
  }
}

// Run the setup if called directly
if (require.main === module) {
  setupProductionSchema()
    .then(() => {
      console.log('🎉 Production schema setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Production schema setup failed:', error);
      process.exit(1);
    });
}

export { setupProductionSchema };
