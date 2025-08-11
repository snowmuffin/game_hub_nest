import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Database Schema Initialization Script
 *
 * This script ensures that required schemas exist before running migrations
 * It's safer than manually creating migration files
 */
async function initializeSchemas() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'snowmuffin',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    logging: false,
  });

  try {
    console.log('🔍 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Database connection established');

    // Create schemas if they don't exist
    console.log('🏗️ Creating required schemas...');

    await dataSource.query(`CREATE SCHEMA IF NOT EXISTS "space_engineers"`);
    console.log('✅ space_engineers schema ready');

    await dataSource.query(`CREATE SCHEMA IF NOT EXISTS "valheim"`);
    console.log('✅ valheim schema ready');

    // Create extension if needed
    try {
      await dataSource.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
      console.log('✅ uuid-ossp extension ready');
    } catch {
      console.log(
        '⚠️ uuid-ossp extension creation failed (may already exist or no permissions)',
      );
    }

    console.log('🎉 Schema initialization completed successfully!');
  } catch (error) {
    console.error('❌ Schema initialization failed:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// Run the initialization
if (require.main === module) {
  initializeSchemas().catch((error) => {
    console.error('❌ Failed to initialize schemas:', error);
    process.exit(1);
  });
}

export { initializeSchemas };
