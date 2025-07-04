import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateItemsTableStructure20250329000250 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table exists first
    const tableExists = await queryRunner.hasTable('items');
    if (!tableExists) {
      console.log('Items table does not exist, skipping migration');
      return;
    }

    // Check current table structure using SQL queries instead of getTable
    const existingColumns = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'items' AND table_schema = CURRENT_SCHEMA()
    `);
    
    const columnNames = existingColumns.map(row => row.column_name);

    // Add icons column if it doesn't exist
    if (!columnNames.includes('icons')) {
      await queryRunner.addColumn(
        'items',
        new TableColumn({
          name: 'icons',
          type: 'json',
        }),
      );
    }

    // Add index_name column if it doesn't exist
    if (!columnNames.includes('index_name')) {
      await queryRunner.addColumn(
        'items',
        new TableColumn({
          name: 'index_name',
          type: 'varchar',
          isNullable: false,
          isUnique: true,
        }),
      );
    }

    // Rename name column to display_name if needed
    if (columnNames.includes('name') && !columnNames.includes('display_name')) {
      await queryRunner.renameColumn('items', 'name', 'display_name');
    }

    // Set default value for rarity column if it doesn't have one
    const rarityColumn = await queryRunner.query(`
      SELECT column_default 
      FROM information_schema.columns 
      WHERE table_name = 'items' AND column_name = 'rarity' AND table_schema = CURRENT_SCHEMA()
    `);
    
    if (rarityColumn.length > 0 && !rarityColumn[0].column_default) {
      await queryRunner.query(`ALTER TABLE items ALTER COLUMN rarity SET DEFAULT 0`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if table exists first
    const tableExists = await queryRunner.hasTable('items');
    if (!tableExists) {
      console.log('Items table does not exist, skipping rollback');
      return;
    }

    // Check current table structure
    const existingColumns = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'items' AND table_schema = CURRENT_SCHEMA()
    `);
    
    const columnNames = existingColumns.map(row => row.column_name);

    // Revert rarity column default
    await queryRunner.query(`ALTER TABLE items ALTER COLUMN rarity DROP DEFAULT`);

    // Rename display_name back to name if display_name exists
    if (columnNames.includes('display_name')) {
      await queryRunner.renameColumn('items', 'display_name', 'name');
    }

    // Drop index_name column if it exists
    if (columnNames.includes('index_name')) {
      await queryRunner.dropColumn('items', 'index_name');
    }

    // Drop icons column if it exists
    if (columnNames.includes('icons')) {
      await queryRunner.dropColumn('items', 'icons');
    }
  }
}
