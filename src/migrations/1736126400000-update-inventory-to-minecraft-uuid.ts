import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateInventoryToMinecraftUuid1736126400000 implements MigrationInterface {
    name = 'UpdateInventoryToMinecraftUuid1736126400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // userId 컬럼을 minecraftUuid로 변경
        await queryRunner.query(`
            ALTER TABLE "muffin_craft_inventory" 
            ADD COLUMN "minecraftUuid" character varying
        `);
        
        // 기존 데이터가 있다면 정리 (개발 단계에서는 데이터 삭제)
        await queryRunner.query(`DELETE FROM "muffin_craft_inventory"`);
        
        // userId 컬럼 삭제
        await queryRunner.query(`
            ALTER TABLE "muffin_craft_inventory" 
            DROP COLUMN "userId"
        `);
        
        // minecraftUuid를 NOT NULL로 설정
        await queryRunner.query(`
            ALTER TABLE "muffin_craft_inventory" 
            ALTER COLUMN "minecraftUuid" SET NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 롤백 시 userId 컬럼 다시 추가
        await queryRunner.query(`
            ALTER TABLE "muffin_craft_inventory" 
            ADD COLUMN "userId" integer
        `);
        
        // 기존 데이터 정리
        await queryRunner.query(`DELETE FROM "muffin_craft_inventory"`);
        
        // minecraftUuid 컬럼 삭제
        await queryRunner.query(`
            ALTER TABLE "muffin_craft_inventory" 
            DROP COLUMN "minecraftUuid"
        `);
    }
}
