import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableColumn } from 'typeorm';

export class UpdateOnlineStorageStructure20250413000150 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. online_storage 테이블의 id를 bigint로 변경
    await queryRunner.query(`
      ALTER TABLE online_storage
      ALTER COLUMN id TYPE bigint
    `);

    // 2. steam_id 기본값 설정 (if not already set)
    const steamIdDefault = await queryRunner.query(`
      SELECT column_default 
      FROM information_schema.columns 
      WHERE table_name = 'online_storage' AND column_name = 'steam_id' AND table_schema = CURRENT_SCHEMA()
    `);
    
    if (steamIdDefault.length > 0 && !steamIdDefault[0].column_default) {
      await queryRunner.query(`ALTER TABLE online_storage ALTER COLUMN steam_id SET DEFAULT 'unknown'`);
    }

    // 3. 기존 online_storage 테이블에서 items 컬럼 제거
    await queryRunner.query(`
      ALTER TABLE online_storage
      DROP COLUMN IF EXISTS items
    `);

    // 4. online_storage_items 테이블 생성 (if not exists)
    const tableExists = await queryRunner.hasTable('online_storage_items');
    if (!tableExists) {
      await queryRunner.createTable(
        new Table({
          name: 'online_storage_items',
          columns: [
            { name: 'id', type: 'bigserial', isPrimary: true },
            { name: 'storage_id', type: 'bigint', isNullable: false },
            { name: 'item_id', type: 'bigint', isNullable: false },
            { name: 'quantity', type: 'int', default: '0', isNullable: false },
          ],
        }),
        true,
      );
    }

    // 5. Check if foreign keys already exist before creating them
    const existingConstraints = await queryRunner.query(`
      SELECT constraint_name, column_name, table_name
      FROM information_schema.key_column_usage 
      WHERE table_name = 'online_storage_items' AND table_schema = CURRENT_SCHEMA()
    `);
    
    const storageConstraintExists = existingConstraints.some(c => c.column_name === 'storage_id');
    const itemConstraintExists = existingConstraints.some(c => c.column_name === 'item_id');

    // 5. storage_id 외래 키 추가 (if not exists)
    if (!storageConstraintExists) {
      await queryRunner.createForeignKey(
        'online_storage_items',
        new TableForeignKey({
          columnNames: ['storage_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'online_storage',
          onDelete: 'CASCADE',
        }),
      );
    }

    // 6. item_id 외래 키 추가 (if not exists)
    if (!itemConstraintExists) {
      await queryRunner.createForeignKey(
        'online_storage_items',
        new TableForeignKey({
          columnNames: ['item_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'items',
          onDelete: 'CASCADE',
        }),
      );
    }

    // 7. items 테이블과 online_storage_items 테이블의 item_id를 bigint로 변경
    await queryRunner.query(`
      ALTER TABLE items
      ALTER COLUMN id TYPE bigint
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert items id to int
    await queryRunner.query(`
      ALTER TABLE items
      ALTER COLUMN id TYPE integer
    `);

    // Drop foreign keys
    const table = await queryRunner.getTable('online_storage_items');
    if (table) {
      const itemForeignKey = table.foreignKeys.find(fk => fk.columnNames.includes('item_id'));
      const storageForeignKey = table.foreignKeys.find(fk => fk.columnNames.includes('storage_id'));
      
      if (itemForeignKey) {
        await queryRunner.dropForeignKey('online_storage_items', itemForeignKey);
      }
      if (storageForeignKey) {
        await queryRunner.dropForeignKey('online_storage_items', storageForeignKey);
      }
    }

    // Drop online_storage_items table
    await queryRunner.dropTable('online_storage_items');

    // Add back items column to online_storage
    await queryRunner.addColumn(
      'online_storage',
      new TableColumn({
        name: 'items',
        type: 'json',
        isNullable: true,
      }),
    );

    // Revert steam_id default
    const onlineTable = await queryRunner.getTable('online_storage');
    const steamIdColumn = onlineTable?.findColumnByName('steam_id');
    if (steamIdColumn) {
      await queryRunner.changeColumn(
        'online_storage',
        'steam_id',
        new TableColumn({
          name: 'steam_id',
          type: steamIdColumn.type,
          isNullable: steamIdColumn.isNullable,
        }),
      );
    }

    // Revert online_storage id to int
    await queryRunner.query(`
      ALTER TABLE online_storage
      ALTER COLUMN id TYPE integer
    `);
  }
}
