import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateSpaceEngineersDropTable1735516800000 implements MigrationInterface {
  name = 'CreateSpaceEngineersDropTable1735516800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
            isNullable: false,
            comment: 'Item identifier matching items.index_name',
          },
          {
            name: 'rarity',
            type: 'int',
            isNullable: false,
            comment: 'Drop rarity level (1-20)',
          },
          {
            name: 'weight_multiplier',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 1.0,
            comment: 'Drop weight multiplier',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            comment: 'Whether this item is active in drop table',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
            comment: 'Admin notes about this drop entry',
          },
          {
            name: 'modified_by',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Admin who added/modified this entry',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true
    );

    // 인덱스 생성
    await queryRunner.createIndex(
      'space_engineers.drop_table',
      new TableIndex({
        name: 'IDX_drop_table_item_id_rarity',
        columnNames: ['item_id', 'rarity']
      })
    );

    await queryRunner.createIndex(
      'space_engineers.drop_table',
      new TableIndex({
        name: 'IDX_drop_table_is_active',
        columnNames: ['is_active']
      })
    );

    await queryRunner.createIndex(
      'space_engineers.drop_table',
      new TableIndex({
        name: 'IDX_drop_table_rarity',
        columnNames: ['rarity']
      })
    );

    console.log('✅ Space Engineers drop_table created successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 인덱스 삭제
    await queryRunner.dropIndex('space_engineers.drop_table', 'IDX_drop_table_item_id_rarity');
    await queryRunner.dropIndex('space_engineers.drop_table', 'IDX_drop_table_is_active');
    await queryRunner.dropIndex('space_engineers.drop_table', 'IDX_drop_table_rarity');

    // 테이블 삭제
    await queryRunner.dropTable('space_engineers.drop_table');

    console.log('✅ Space Engineers drop_table dropped successfully');
  }
}
