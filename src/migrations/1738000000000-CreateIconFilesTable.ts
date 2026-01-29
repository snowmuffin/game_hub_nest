import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIconFilesTable1738000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create icon_files table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "space_engineers"."icon_files" (
        "id" SERIAL PRIMARY KEY,
        "file_name" VARCHAR(255) UNIQUE NOT NULL,
        "cdn_url" TEXT NOT NULL,
        "uploaded_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create unique index on file_name
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_icon_files_file_name" 
      ON "space_engineers"."icon_files"("file_name");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop icon_files table
    await queryRunner.query(`
      DROP TABLE IF EXISTS "space_engineers"."icon_files" CASCADE;
    `);
  }
}
