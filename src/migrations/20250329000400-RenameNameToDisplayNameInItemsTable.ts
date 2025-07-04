import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameNameToDisplayNameInItemsTable20250329000400 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('items');
    const nameColumn = table?.findColumnByName('name');

    if (nameColumn) {
      await queryRunner.query(`
        ALTER TABLE items
        RENAME COLUMN name TO display_name
      `);
    } else {
      console.log('Column "name" does not exist in "items" table.');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('items');
    const displayNameColumn = table?.findColumnByName('display_name');

    if (displayNameColumn) {
      await queryRunner.query(`
        ALTER TABLE items
        RENAME COLUMN display_name TO name
      `);
    } else {
      console.log('Column "display_name" does not exist in "items" table.');
    }
  }
}