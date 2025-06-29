import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPrimaryKeyToUsersTable20250629000050 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔧 Adding primary key to users table...');
    
    // id 컬럼에 PRIMARY KEY 제약조건 추가
    await queryRunner.query(`
      ALTER TABLE spaceengineers.users 
      ADD CONSTRAINT users_pkey PRIMARY KEY (id);
    `);
    
    console.log('✅ Primary key added to users table successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Removing primary key from users table...');
    
    await queryRunner.query(`
      ALTER TABLE spaceengineers.users 
      DROP CONSTRAINT IF EXISTS users_pkey;
    `);
    
    console.log('✅ Primary key removed from users table');
  }
}
