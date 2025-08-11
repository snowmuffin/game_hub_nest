import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterStorageAndItemIdToBigInt20250413000300
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE online_storage_items
      ALTER COLUMN storage_id TYPE bigint
    `);
    await queryRunner.query(`
      ALTER TABLE online_storage_items
      ALTER COLUMN item_id TYPE bigint
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE online_storage_items
      ALTER COLUMN storage_id TYPE int
    `);
    await queryRunner.query(`
      ALTER TABLE online_storage_items
      ALTER COLUMN item_id TYPE int
    `);
  }
}
