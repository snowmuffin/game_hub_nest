import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateGamesAndServersTable20250629000100
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // games 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'games',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'code', type: 'varchar', length: '50', isUnique: true },
          { name: 'name', type: 'varchar', length: '100' },
          {
            name: 'description',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'icon_url',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    // game_servers 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'game_servers',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'game_id', type: 'int', isNullable: false },
          { name: 'code', type: 'varchar', length: '50' },
          { name: 'name', type: 'varchar', length: '100' },
          {
            name: 'description',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'server_url',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          { name: 'port', type: 'int', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'metadata', type: 'json', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    // 외래 키 추가: game_servers.game_id -> games.id
    await queryRunner.createForeignKey(
      'game_servers',
      new TableForeignKey({
        columnNames: ['game_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'games',
        onDelete: 'CASCADE',
      }),
    );

    // 인덱스 추가
    await queryRunner.createIndex(
      'game_servers',
      new TableIndex({
        name: 'IDX_game_servers_game_id',
        columnNames: ['game_id'],
      }),
    );

    await queryRunner.createIndex(
      'game_servers',
      new TableIndex({
        name: 'IDX_game_servers_code',
        columnNames: ['game_id', 'code'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 외래 키 및 인덱스 삭제
    const gameServersTable = await queryRunner.getTable('game_servers');
    if (gameServersTable) {
      const foreignKey = gameServersTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('game_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('game_servers', foreignKey);
      }
    }

    await queryRunner.dropTable('game_servers');
    await queryRunner.dropTable('games');
  }
}
