import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIndexNameColumnToItemsTable20250329000300 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'items',
      new TableColumn({
        name: 'index_name',
        type: 'varchar',
        isNullable: false,
        isUnique: true, // 고유 값 설정
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('items', 'index_name');
  }
}