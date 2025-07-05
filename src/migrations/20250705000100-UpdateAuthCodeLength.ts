import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAuthCodeLength20250705000100 implements MigrationInterface {
  name = 'UpdateAuthCodeLength20250705000100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 기존 auth_codes 테이블의 authCode 컬럼 길이를 8자리로 확장
    await queryRunner.query(`
      ALTER TABLE "muffincraft_auth_codes" 
      ALTER COLUMN "authCode" TYPE character varying(8)
    `);
    
    // 기존 데이터가 있다면 모두 만료 처리 (새로운 형식으로 변경하므로)
    await queryRunner.query(`
      UPDATE "muffincraft_auth_codes" 
      SET "isUsed" = true, "expiresAt" = NOW() - INTERVAL '1 day'
      WHERE "isUsed" = false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 롤백: 8자리를 다시 6자리로 되돌림
    await queryRunner.query(`
      ALTER TABLE "muffincraft_auth_codes" 
      ALTER COLUMN "authCode" TYPE character varying(6)
    `);
  }
}
