import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateWalletsAndCurrenciesTables20250329000100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // currencies 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'currencies',
        columns: [
          { name: 'id', type: 'bigint', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'code', type: 'varchar', length: '10', isUnique: true }, // 화폐 코드 (예: USD, EUR)
          { name: 'name', type: 'varchar', length: '50' }, // 화폐 이름 (예: US Dollar, Euro)
          { name: 'symbol', type: 'varchar', length: '5', isNullable: true }, // 화폐 기호 (예: $, €)
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true
    );

    // wallets 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'wallets',
        columns: [
          { name: 'id', type: 'bigint', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'user_id', type: 'int', isNullable: false },
          { name: 'balance', type: 'decimal', precision: 10, scale: 2, default: 0 }, // 소수점 2자리까지 지원
          { name: 'currency_id', type: 'int', isNullable: false }, // currencies 테이블 참조
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true
    );

    // 외래 키 추가: user_id -> users.id
    await queryRunner.createForeignKey(
      'wallets',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE', // 유저 삭제 시 지갑도 삭제
      })
    );

    // 외래 키 추가: currency_id -> currencies.id
    await queryRunner.createForeignKey(
      'wallets',
      new TableForeignKey({
        columnNames: ['currency_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'currencies',
        onDelete: 'RESTRICT', // 화폐 삭제 제한
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // wallets 테이블의 외래 키 삭제
    const walletsTable = await queryRunner.getTable('wallets');
    if (walletsTable) {
      const userForeignKey = walletsTable.foreignKeys.find(fk => fk.columnNames.indexOf('user_id') !== -1);
      const currencyForeignKey = walletsTable.foreignKeys.find(fk => fk.columnNames.indexOf('currency_id') !== -1);
      if (userForeignKey) {
        await queryRunner.dropForeignKey('wallets', userForeignKey);
      }
      if (currencyForeignKey) {
        await queryRunner.dropForeignKey('wallets', currencyForeignKey);
      }
    }

    // wallets 테이블 삭제
    await queryRunner.dropTable('wallets');

    // currencies 테이블 삭제
    await queryRunner.dropTable('currencies');
  }
}