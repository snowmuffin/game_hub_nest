import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDropTable20250630163000 implements MigrationInterface {
  name = 'CreateDropTable20250630163000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // space_engineers 스키마가 없다면 생성
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "space_engineers"`);

    // drop_table 테이블이 존재하는지 확인
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'space_engineers' 
        AND table_name = 'drop_table'
      );
    `);

    // 테이블이 존재하지 않을 때만 생성
    if (!tableExists[0].exists) {
      await queryRunner.query(`
        CREATE TABLE "space_engineers"."drop_table" (
          "id" SERIAL NOT NULL,
          "item_id" varchar(255) NOT NULL,
          "item_name" varchar(255) NOT NULL,
          "rarity" int NOT NULL,
          "drop_rate_multiplier" decimal(10,6) NOT NULL DEFAULT 1,
          "is_active" boolean NOT NULL DEFAULT true,
          "description" text,
          "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "UQ_298414d3c5235a8362216a7dce9" UNIQUE ("item_id"),
          CONSTRAINT "PK_fb3f89fa31a38df2c62e2efc7b6" PRIMARY KEY ("id")
        )
      `);

      // 인덱스 생성
      await queryRunner.query(`CREATE INDEX "IDX_DROP_TABLE_ITEM_ID" ON "space_engineers"."drop_table" ("item_id")`);
      await queryRunner.query(`CREATE INDEX "IDX_DROP_TABLE_RARITY" ON "space_engineers"."drop_table" ("rarity")`);
      await queryRunner.query(`CREATE INDEX "IDX_DROP_TABLE_IS_ACTIVE" ON "space_engineers"."drop_table" ("is_active")`);
    } else {
      console.log('Drop table already exists, skipping creation...');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "space_engineers"."drop_table"`);
  }
}
