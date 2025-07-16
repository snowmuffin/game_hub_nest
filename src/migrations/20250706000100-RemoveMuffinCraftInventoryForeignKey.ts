import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveMuffinCraftInventoryForeignKey20250706000100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table exists before trying to drop constraint
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'muffin_craft_inventory'
      );
    `);
    
    if (tableExists[0].exists) {
      // muffin_craft_inventory 테이블의 users 테이블에 대한 외래키 제약조건 제거
      await queryRunner.query(`
        ALTER TABLE "muffin_craft_inventory" 
        DROP CONSTRAINT IF EXISTS "FK_b5bd1b11ac846b8c6577a7e0e1d";
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if table exists before trying to add constraint back
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'muffin_craft_inventory'
      );
    `);
    
    if (tableExists[0].exists) {
      // 롤백: 외래키 제약조건 다시 추가
      await queryRunner.query(`
        ALTER TABLE "muffin_craft_inventory" 
        ADD CONSTRAINT "FK_b5bd1b11ac846b8c6577a7e0e1d" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") 
        ON DELETE NO ACTION ON UPDATE NO ACTION;
      `);
    }
  }
}
