const { Client } = require('pg');

async function createSchemas() {
  const client = new Client({
    host: 'gamehub-spaceengineers.c9ecui4q2er7.ap-northeast-2.rds.amazonaws.com',
    port: 5432,
    user: 'Snowmuffin',
    password: 'Ov0CaSYp]wBEQ]8hj4rAKBfz5prB',
    database: 'postgres',
    ssl: true
  });

  try {
    await client.connect();
    console.log('🔗 Connected to database');

    // 스키마 생성
    await client.query('CREATE SCHEMA IF NOT EXISTS space_engineers');
    console.log('✅ space_engineers schema created');

    await client.query('CREATE SCHEMA IF NOT EXISTS valheim');
    console.log('✅ valheim schema created');

    await client.query('CREATE SCHEMA IF NOT EXISTS minecraft');
    console.log('✅ minecraft schema created');

    // 생성된 스키마 확인
    const result = await client.query(`
      SELECT nspname FROM pg_namespace 
      WHERE nspname IN ('space_engineers', 'valheim', 'minecraft')
      ORDER BY nspname;
    `);
    
    console.log('📋 Created schemas:', result.rows.map(r => r.nspname));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
    console.log('🔚 Database connection closed');
  }
}

createSchemas();
