import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1726220000000 implements MigrationInterface {
  name = 'CreateUsersTable1726220000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "username" varchar(100) NOT NULL UNIQUE,
        "email" varchar(100) UNIQUE,
        "password" varchar NULL,
        "steam_id" varchar(50) NOT NULL UNIQUE,
        "score" double precision NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "last_active_at" TIMESTAMPTZ NULL,
        "roles" text[] NOT NULL DEFAULT '{"USER"}'
      );
    `);

    // Helpful index for lookups by steam_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_steam_id ON "users"("steam_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_steam_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users";`);
  }
}
