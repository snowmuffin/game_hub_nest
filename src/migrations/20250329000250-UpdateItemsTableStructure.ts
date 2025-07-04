import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateItemsTableStructure20250329000250 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('items');
    
    // Add icons column
    const iconsColumn = table?.findColumnByName('icons');
    if (!iconsColumn) {
      await queryRunner.addColumn(
        'items',
        new TableColumn({
          name: 'icons',
          type: 'json',
        }),
      );
    }

    // Add index_name column
    const indexNameColumn = table?.findColumnByName('index_name');
    if (!indexNameColumn) {
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

    // Rename name column to display_name
    const nameColumn = table?.findColumnByName('name');
    const displayNameColumn = table?.findColumnByName('display_name');
    
    if (nameColumn && !displayNameColumn) {
      await queryRunner.renameColumn('items', 'name', 'display_name');
    }

    // Set default value for rarity column
    const rarityColumn = table?.findColumnByName('rarity');
    if (rarityColumn && !rarityColumn.default) {
      await queryRunner.changeColumn(
        'items',
        'rarity',
        new TableColumn({
          name: 'rarity',
          type: rarityColumn.type,
          default: "'common'",
          isNullable: rarityColumn.isNullable,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert rarity column default
    const table = await queryRunner.getTable('items');
    const rarityColumn = table?.findColumnByName('rarity');
    if (rarityColumn) {
      await queryRunner.changeColumn(
        'items',
        'rarity',
        new TableColumn({
          name: 'rarity',
          type: rarityColumn.type,
          isNullable: rarityColumn.isNullable,
        }),
      );
    }

    // Rename display_name back to name
    const displayNameColumn = table?.findColumnByName('display_name');
    if (displayNameColumn) {
      await queryRunner.renameColumn('items', 'display_name', 'name');
    }

    // Drop index_name column
    await queryRunner.dropColumn('items', 'index_name');

    // Drop icons column
    await queryRunner.dropColumn('items', 'icons');
  }
}
