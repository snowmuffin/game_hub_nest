import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameNameToDisplayNameInItemsTable20250329000400 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE items
      RENAME COLUMN name TO display_name
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE items
      RENAME COLUMN display_name TO name
    `);
  }
}