import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOnlineStorageIdToBigInt20250413000100
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE online_storage
      ALTER COLUMN id TYPE bigint
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE online_storage
      ALTER COLUMN id TYPE integer
    `);
  }
}
