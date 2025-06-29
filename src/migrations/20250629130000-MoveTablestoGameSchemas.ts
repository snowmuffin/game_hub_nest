import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveTablestoGameSchemas1751198300000 implements MigrationInterface {
  name = 'MoveTablestoGameSchemas1751198300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Starting table migration to game schemas...');

    // === Space Engineers 테이블 이동 ===
    
    // 1. items 테이블 -> space_engineers.items
    const itemsExists = await queryRunner.hasTable('items');
    if (itemsExists) {
      await queryRunner.query(`
        CREATE TABLE space_engineers.items AS 
        SELECT * FROM public.items
      `);
      console.log('✅ Moved items -> space_engineers.items');
    }

    // 2. online_storage 테이블 -> space_engineers.online_storage
    const storageExists = await queryRunner.hasTable('online_storage');
    if (storageExists) {
      await queryRunner.query(`
        CREATE TABLE space_engineers.online_storage AS 
        SELECT * FROM public.online_storage
      `);
      console.log('✅ Moved online_storage -> space_engineers.online_storage');
    }

    // 3. online_storage_items 테이블 -> space_engineers.online_storage_items
    const storageItemsExists = await queryRunner.hasTable('online_storage_items');
    if (storageItemsExists) {
      await queryRunner.query(`
        CREATE TABLE space_engineers.online_storage_items AS 
        SELECT * FROM public.online_storage_items
      `);
      console.log('✅ Moved online_storage_items -> space_engineers.online_storage_items');
    }

    // 4. marketplace_items 테이블 -> space_engineers.marketplace_items
    const marketplaceExists = await queryRunner.hasTable('marketplace_items');
    if (marketplaceExists) {
      await queryRunner.query(`
        CREATE TABLE space_engineers.marketplace_items AS 
        SELECT * FROM public.marketplace_items
      `);
      console.log('✅ Moved marketplace_items -> space_engineers.marketplace_items');
    }

    // === Valheim 테이블 이동 ===
    
    // Valheim 테이블들을 valheim 스키마로 이동
    const valheimTables = [
      'valheim_items',
      'valheim_characters', 
      'valheim_inventories',
      'valheim_buildings',
      'valheim_worlds',
      'valheim_biomes',
      'valheim_boss_encounters',
      'valheim_character_skills'
    ];

    for (const tableName of valheimTables) {
      const tableExists = await queryRunner.hasTable(tableName);
      if (tableExists) {
        // 접두어 제거한 새 테이블명
        const newTableName = tableName.replace('valheim_', '');
        
        await queryRunner.query(`
          CREATE TABLE valheim.${newTableName} AS 
          SELECT * FROM public.${tableName}
        `);
        console.log(`✅ Moved ${tableName} -> valheim.${newTableName}`);
      }
    }

    // === 인덱스 및 제약조건 재생성 ===
    
    // Space Engineers 인덱스 재생성
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_se_items_index_name 
      ON space_engineers.items(index_name)
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_se_storage_steam_id 
      ON space_engineers.online_storage(steam_id)
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_se_storage_items_storage_item 
      ON space_engineers.online_storage_items(storage_id, item_id)
    `);

    // Valheim 인덱스 재생성
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_valheim_items_code 
      ON valheim.items(item_code)
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_valheim_characters_user 
      ON valheim.characters(user_id)
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_valheim_inventories_user_item 
      ON valheim.inventories(user_id, item_id)
    `);

    console.log('🎉 All tables moved to game schemas successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Rolling back table migration...');

    // === Space Engineers 테이블 복원 ===
    
    const seTables = ['items', 'online_storage', 'online_storage_items', 'marketplace_items'];
    
    for (const tableName of seTables) {
      const tableExists = await queryRunner.hasTable(`space_engineers.${tableName}`);
      if (tableExists) {
        await queryRunner.query(`
          CREATE TABLE public.${tableName} AS 
          SELECT * FROM space_engineers.${tableName}
        `);
        console.log(`✅ Restored space_engineers.${tableName} -> public.${tableName}`);
      }
    }

    // === Valheim 테이블 복원 ===
    
    const valheimTables = [
      'items', 'characters', 'inventories', 'buildings', 
      'worlds', 'biomes', 'boss_encounters', 'character_skills'
    ];

    for (const tableName of valheimTables) {
      const tableExists = await queryRunner.hasTable(`valheim.${tableName}`);
      if (tableExists) {
        const publicTableName = `valheim_${tableName}`;
        
        await queryRunner.query(`
          CREATE TABLE public.${publicTableName} AS 
          SELECT * FROM valheim.${tableName}
        `);
        console.log(`✅ Restored valheim.${tableName} -> public.${publicTableName}`);
      }
    }

    console.log('🎉 Rollback completed successfully!');
  }
}
