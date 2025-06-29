import { AppDataSource } from './src/data-source';

async function createSchemas() {
  try {
    console.log('🔗 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Connected to database');

    const queryRunner = AppDataSource.createQueryRunner();

    // 스키마 생성
    await queryRunner.query('CREATE SCHEMA IF NOT EXISTS space_engineers');
    console.log('✅ space_engineers schema created');

    await queryRunner.query('CREATE SCHEMA IF NOT EXISTS valheim');
    console.log('✅ valheim schema created');

    await queryRunner.query('CREATE SCHEMA IF NOT EXISTS minecraft');
    console.log('✅ minecraft schema created');

    // 생성된 스키마 확인
    const result = await queryRunner.query(`
      SELECT nspname FROM pg_namespace 
      WHERE nspname IN ('space_engineers', 'valheim', 'minecraft')
      ORDER BY nspname;
    `);
    
    console.log('📋 Created schemas:', result.rows.map((r: any) => r.nspname));

    await queryRunner.release();
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('🔚 Database connection closed');
  }
}

createSchemas();
