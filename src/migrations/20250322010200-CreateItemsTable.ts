import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateItemsTable20250322010200 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'items',
        columns: [
          { name: 'id', type: 'bigserial', isPrimary: true },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'rarity', type: 'int', isNullable: false },
          { name: 'description', type: 'text', isNullable: true },
          {
            name: 'category',
            type: 'varchar',
            length: '10',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('items');
  }
}
