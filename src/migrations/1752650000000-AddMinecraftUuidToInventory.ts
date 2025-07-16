import { MigrationInterface, QueryRunner } from "typeorm"

export class AddMinecraftUuidToInventory1752650000000 implements MigrationInterface {
    name = 'AddMinecraftUuidToInventory1752650000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // minecraftUuid 컬럼이 없는 경우에만 추가
        const hasColumn = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'muffin_craft_inventory' 
                AND column_name = 'minecraftUuid'
            );
        `);

        if (!hasColumn[0].exists) {
            await queryRunner.query(`
                ALTER TABLE "muffin_craft_inventory" 
                ADD COLUMN "minecraftUuid" character varying
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // minecraftUuid 컬럼이 있는 경우에만 삭제
        const hasColumn = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'muffin_craft_inventory' 
                AND column_name = 'minecraftUuid'
            );
        `);

        if (hasColumn[0].exists) {
            await queryRunner.query(`
                ALTER TABLE "muffin_craft_inventory" 
                DROP COLUMN "minecraftUuid"
            `);
        }
    }
}
