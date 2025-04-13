import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class RefactorOnlineStorageTable20250329000600 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 기존 online_storage 테이블에서 items 컬럼 제거
    await queryRunner.query(`
      ALTER TABLE online_storage
      DROP COLUMN IF EXISTS items
    `);

    // 2. online_storage_items 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'online_storage_items',
        columns: [
          { name: 'id', type: 'bigserial', isPrimary: true },
          { name: 'storage_id', type: 'bigint', isNullable: false }, // Updated to bigint
          { name: 'item_id', type: 'bigint', isNullable: false }, // Updated to bigint
          { name: 'quantity', type: 'int', default: '0', isNullable: false },
        ],
      }),
      true,
    );

    // 3. storage_id 외래 키 추가
    await queryRunner.createForeignKey(
      'online_storage_items',
      new TableForeignKey({
        columnNames: ['storage_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'online_storage',
        onDelete: 'CASCADE', // online_storage가 삭제되면 관련 아이템도 삭제
      }),
    );

    // 4. item_id 외래 키 추가
    await queryRunner.createForeignKey(
      'online_storage_items',
      new TableForeignKey({
        columnNames: ['item_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'items',
        onDelete: 'CASCADE', // items가 삭제되면 관련 데이터도 삭제
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. 외래 키 제거 (item_id)
    const table = await queryRunner.getTable('online_storage_items');
    const itemForeignKey = table?.foreignKeys.find((fk) => fk.columnNames.indexOf('item_id') !== -1);
    if (itemForeignKey) {
      await queryRunner.dropForeignKey('online_storage_items', itemForeignKey);
    }

    // 2. 외래 키 제거 (storage_id)
    const storageForeignKey = table?.foreignKeys.find((fk) => fk.columnNames.indexOf('storage_id') !== -1);
    if (storageForeignKey) {
      await queryRunner.dropForeignKey('online_storage_items', storageForeignKey);
    }

    // 3. online_storage_items 테이블 삭제
    await queryRunner.dropTable('online_storage_items');

    // 4. 기존 items 컬럼 복원
    await queryRunner.query(`
      ALTER TABLE online_storage
      ADD COLUMN items jsonb DEFAULT '{}'
    `);
  }
}