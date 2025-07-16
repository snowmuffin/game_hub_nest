import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateInventoryEntityStructure1736109300000 implements MigrationInterface {
    name = 'UpdateInventoryEntityStructure1736109300000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if table exists before trying to alter it
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'muffin_craft_inventory'
            );
        `);
        
        if (tableExists[0].exists) {
            // 외래키 제약조건 제거 (이미 되어있을 수 있음)
            await queryRunner.query(`ALTER TABLE "muffin_craft_inventory" DROP CONSTRAINT IF EXISTS "FK_b5bd1b11ac846b8c6577a7e0e1d"`);
            
            // user 컬럼을 userId로 변경
            await queryRunner.query(`ALTER TABLE "muffin_craft_inventory" RENAME COLUMN "userId" TO "userId_temp"`);
            await queryRunner.query(`ALTER TABLE "muffin_craft_inventory" ADD "userId" integer`);
            await queryRunner.query(`UPDATE "muffin_craft_inventory" SET "userId" = "userId_temp"`);
            await queryRunner.query(`ALTER TABLE "muffin_craft_inventory" DROP COLUMN "userId_temp"`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if table exists before trying to alter it
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'muffin_craft_inventory'
            );
        `);
        
        if (tableExists[0].exists) {
            // 롤백 시 userId를 다시 user 관계로 변경 (외래키 제약조건 포함)
            await queryRunner.query(`ALTER TABLE "muffin_craft_inventory" RENAME COLUMN "userId" TO "userId_temp"`);
            await queryRunner.query(`ALTER TABLE "muffin_craft_inventory" ADD "userId" uuid`);
            await queryRunner.query(`UPDATE "muffin_craft_inventory" SET "userId" = "userId_temp"`);
            await queryRunner.query(`ALTER TABLE "muffin_craft_inventory" DROP COLUMN "userId_temp"`);
            await queryRunner.query(`ALTER TABLE "muffin_craft_inventory" ADD CONSTRAINT "FK_b5bd1b11ac846b8c6577a7e0e1d" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }
    }
}
