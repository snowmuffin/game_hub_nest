import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHangarGrids1726200000001 implements MigrationInterface {
  name = 'CreateHangarGrids1726200000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "space_engineers"."hangar_grids" (
        "id" SERIAL PRIMARY KEY,
        "user_id" integer NOT NULL,
        "server_id" integer NULL,
        "name" varchar(200) NULL,
        "description" varchar(1000) NULL,
        "s3_bucket" varchar(255) NOT NULL,
        "s3_key" varchar(1024) NOT NULL,
        "content_type" varchar(255) NULL,
        "size_bytes" bigint NULL,
        "file_hash" varchar(128) NULL,
        "status" varchar(20) NOT NULL DEFAULT 'UPLOADING',
        "metadata" json NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_hangar_user ON "space_engineers"."hangar_grids"("user_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS "space_engineers"."hangar_grids"`,
    );
  }
}
