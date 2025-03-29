import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIconsColumnToItemsTable20250329000200 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'items',
      new TableColumn({
        name: 'icons',
        type: 'json',
        isNullable: true, // 아이콘이 없는 경우를 허용
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('items', 'icons');
  }
}