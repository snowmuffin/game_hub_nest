import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGameSchemas1751197800000 implements MigrationInterface {
  name = 'CreateGameSchemas1751197800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Space Engineers 스키마 생성
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS space_engineers`);

    // 2. Valheim 스키마 생성
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS valheim`);

    // 3. Minecraft 스키마 생성 (향후 확장용)
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS minecraft`);

    console.log('✅ Game schemas created successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 스키마 삭제 (CASCADE로 모든 테이블도 함께 삭제)
    await queryRunner.query(`DROP SCHEMA IF EXISTS minecraft CASCADE`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS valheim CASCADE`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS space_engineers CASCADE`);

    console.log('✅ Game schemas dropped successfully');
  }
}
