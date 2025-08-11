import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetDefaultSteamIdInOnlineStorage20250413000200
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE online_storage
      ALTER COLUMN steam_id SET DEFAULT 'unknown'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE online_storage
      ALTER COLUMN steam_id DROP DEFAULT
    `);
  }
}
