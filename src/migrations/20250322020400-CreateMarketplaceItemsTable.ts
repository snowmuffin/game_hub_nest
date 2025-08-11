import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMarketplaceItemsTable20250322020400
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'marketplace_items',
        columns: [
          { name: 'id', type: 'bigserial', isPrimary: true },
          { name: 'seller_steam_id', type: 'varchar' },
          { name: 'item_name', type: 'varchar' },
          { name: 'price', type: 'integer' },
          { name: 'quantity', type: 'integer' },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('marketplace_items');
  }
}
