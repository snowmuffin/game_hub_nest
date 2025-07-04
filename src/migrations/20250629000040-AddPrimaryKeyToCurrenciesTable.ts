import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPrimaryKeyToCurrenciesTable20250629000040 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔧 Adding primary key to currencies table...');
    
    // currencies 테이블에 PRIMARY KEY 추가
    await queryRunner.query(`
      ALTER TABLE currencies 
      ADD CONSTRAINT currencies_pkey PRIMARY KEY (id);
    `);
    
    console.log('✅ Primary key added to currencies table successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔧 Removing primary key from currencies table...');
    
    // PRIMARY KEY 제거
    await queryRunner.query(`
      ALTER TABLE currencies 
      DROP CONSTRAINT currencies_pkey;
    `);
    
    console.log('✅ Primary key removed from currencies table successfully!');
  }
}
