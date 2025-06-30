import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateDropTable20250630000100 implements MigrationInterface {
  name = 'CreateDropTable20250630000100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // space_engineers 스키마가 없다면 생성
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "space_engineers"`);

    // drop_table 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'drop_table',
        schema: 'space_engineers',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'item_id',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'item_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'rarity',
            type: 'int',
          },
          {
            name: 'drop_rate_multiplier',
            type: 'decimal',
            precision: 10,
            scale: 6,
            default: 1.0,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // 인덱스 생성
    await queryRunner.createIndex(
      'space_engineers.drop_table',
      new TableIndex({
        name: 'IDX_DROP_TABLE_ITEM_ID',
        columnNames: ['item_id'],
      }),
    );

    await queryRunner.createIndex(
      'space_engineers.drop_table',
      new TableIndex({
        name: 'IDX_DROP_TABLE_RARITY',
        columnNames: ['rarity'],
      }),
    );

    await queryRunner.createIndex(
      'space_engineers.drop_table',
      new TableIndex({
        name: 'IDX_DROP_TABLE_IS_ACTIVE',
        columnNames: ['is_active'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('space_engineers.drop_table');
  }
}
