import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetDefaultValueForRarityInItemsTable20250329000500 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE items
      ALTER COLUMN rarity SET DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE items
      ALTER COLUMN rarity DROP DEFAULT
    `);
  }
}