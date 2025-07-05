import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAuthCodeToComplex20250705000200 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 인증 코드 길이를 12자리로 확장하고 기존 코드들을 만료 처리
    await queryRunner.query(`
      -- 기존 8자리 코드들 모두 만료 처리
      UPDATE muffincraft_auth_codes 
      SET "isUsed" = true 
      WHERE LENGTH("authCode") = 8;
    `);

    // authCode 컬럼을 12자리로 확장
    await queryRunner.query(`
      ALTER TABLE muffincraft_auth_codes 
      ALTER COLUMN "authCode" TYPE varchar(12);
    `);

    // 새로운 복잡한 인증 코드 포맷을 위한 인덱스 재생성
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_muffincraft_auth_codes_authCode";
      CREATE UNIQUE INDEX "IDX_muffincraft_auth_codes_authCode" 
      ON muffincraft_auth_codes ("authCode");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 롤백: authCode를 다시 8자리로 변경
    await queryRunner.query(`
      ALTER TABLE muffincraft_auth_codes 
      ALTER COLUMN "authCode" TYPE varchar(8);
    `);

    // 기존 인덱스 재생성
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_muffincraft_auth_codes_authCode";
      CREATE UNIQUE INDEX "IDX_muffincraft_auth_codes_authCode" 
      ON muffincraft_auth_codes ("authCode");
    `);
  }
}
