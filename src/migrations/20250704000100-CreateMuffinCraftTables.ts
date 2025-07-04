import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMuffinCraftTables20250704000100 implements MigrationInterface {
  name = 'CreateMuffinCraftTables20250704000100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // MuffinCraft Players 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "muffincraft_players" (
        "id" SERIAL NOT NULL,
        "userId" integer,
        "minecraftUsername" character varying(16) NOT NULL,
        "minecraftUuid" character varying(36),
        "isLinked" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_muffincraft_players_username" UNIQUE ("minecraftUsername"),
        CONSTRAINT "UQ_muffincraft_players_uuid" UNIQUE ("minecraftUuid"),
        CONSTRAINT "PK_muffincraft_players" PRIMARY KEY ("id")
      )
    `);

    // MuffinCraft Auth Codes 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "muffincraft_auth_codes" (
        "id" SERIAL NOT NULL,
        "authCode" character varying(6) NOT NULL,
        "minecraftUsername" character varying(16) NOT NULL,
        "minecraftUuid" character varying(36),
        "isUsed" boolean NOT NULL DEFAULT false,
        "usedBy" integer,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_muffincraft_auth_codes_code" UNIQUE ("authCode"),
        CONSTRAINT "PK_muffincraft_auth_codes" PRIMARY KEY ("id")
      )
    `);

    // 인덱스 생성
    await queryRunner.query(`
      CREATE INDEX "idx_user_id" ON "muffincraft_players" ("userId")
    `);
    
    await queryRunner.query(`
      CREATE INDEX "idx_minecraft_username" ON "muffincraft_players" ("minecraftUsername")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_auth_code" ON "muffincraft_auth_codes" ("authCode")
    `);
    
    await queryRunner.query(`
      CREATE INDEX "idx_minecraft_username_auth" ON "muffincraft_auth_codes" ("minecraftUsername")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 인덱스 삭제
    await queryRunner.query(`DROP INDEX "idx_minecraft_username_auth"`);
    await queryRunner.query(`DROP INDEX "idx_auth_code"`);
    await queryRunner.query(`DROP INDEX "idx_minecraft_username"`);
    await queryRunner.query(`DROP INDEX "idx_user_id"`);
    
    // 테이블 삭제
    await queryRunner.query(`DROP TABLE "muffincraft_auth_codes"`);
    await queryRunner.query(`DROP TABLE "muffincraft_players"`);
  }
}
