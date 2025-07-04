import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIconsColumnToItemsTable20250329000200 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('items');
    const iconsColumn = table?.findColumnByName('icons');

    if (!iconsColumn) {
      await queryRunner.addColumn(
        'items',
        new TableColumn({
          name: 'icons',
          type: 'json',
        }),
      );
    } else {
      console.log('Column "icons" already exists in "items" table.');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('items', 'icons');
  }
}