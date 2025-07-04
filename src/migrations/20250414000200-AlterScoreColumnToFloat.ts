import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterScoreColumnToFloat20250414000200 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      ALTER COLUMN score TYPE FLOAT USING score::FLOAT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      ALTER COLUMN score TYPE INTEGER USING score::INTEGER
    `);
  }
}
