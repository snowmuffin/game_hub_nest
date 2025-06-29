import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex, TableColumn } from 'typeorm';

export class UpdateCurrenciesTable20250629000200 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 기존 currencies 테이블 수정
    // game_id 컬럼 추가
    await queryRunner.addColumn(
      'currencies',
      new TableColumn({
        name: 'game_id',
        type: 'int',
        isNullable: true,
      })
    );

    // type 컬럼 추가
    await queryRunner.addColumn(
      'currencies',
      new TableColumn({
        name: 'type',
        type: 'enum',
        enum: ['GLOBAL', 'GAME_SPECIFIC'],
        default: "'GAME_SPECIFIC'",
      })
    );

    // decimal_places 컬럼 추가
    await queryRunner.addColumn(
      'currencies',
      new TableColumn({
        name: 'decimal_places',
        type: 'int',
        default: 2,
      })
    );

    // is_active 컬럼 추가
    await queryRunner.addColumn(
      'currencies',
      new TableColumn({
        name: 'is_active',
        type: 'boolean',
        default: true,
      })
    );

    // metadata 컬럼 추가
    await queryRunner.addColumn(
      'currencies',
      new TableColumn({
        name: 'metadata',
        type: 'json',
        isNullable: true,
      })
    );

    // 외래 키 추가: currencies.game_id -> games.id
    await queryRunner.createForeignKey(
      'currencies',
      new TableForeignKey({
        columnNames: ['game_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'games',
        
        onDelete: 'SET NULL',
      })
    );

    // 인덱스 추가
    await queryRunner.createIndex(
      'currencies',
      new TableIndex({
        name: 'IDX_currencies_game_id',
        columnNames: ['game_id'],
      })
    );

    await queryRunner.createIndex(
      'currencies',
      new TableIndex({
        name: 'IDX_currencies_type',
        columnNames: ['type'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 외래 키 삭제
    const currenciesTable = await queryRunner.getTable('currencies');
    if (currenciesTable) {
      const foreignKey = currenciesTable.foreignKeys.find(fk => fk.columnNames.indexOf('game_id') !== -1);
      if (foreignKey) {
        await queryRunner.dropForeignKey('currencies', foreignKey);
      }
    }

    // 컬럼 삭제
    await queryRunner.dropColumn('currencies', 'metadata');
    await queryRunner.dropColumn('currencies', 'is_active');
    await queryRunner.dropColumn('currencies', 'decimal_places');
    await queryRunner.dropColumn('currencies', 'type');
    await queryRunner.dropColumn('currencies', 'game_id');
  }
}
