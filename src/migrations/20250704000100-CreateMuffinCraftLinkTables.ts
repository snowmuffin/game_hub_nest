import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateMuffinCraftLinkTables20250704000100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // MuffinCraft Characters 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'muffincraft_characters',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'minecraft_username',
            type: 'varchar',
            length: '16',
            isUnique: true,
          },
          {
            name: 'minecraft_uuid',
            type: 'varchar',
            length: '36',
            isUnique: true,
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'is_linked',
            type: 'boolean',
            default: false,
          },
          {
            name: 'character_data',
            type: 'json',
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
          },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
      true,
    );

    // MuffinCraft Link Codes 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'muffincraft_link_codes',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '8',
            isUnique: true,
          },
          {
            name: 'user_id',
            type: 'int',
          },
          {
            name: 'minecraft_username',
            type: 'varchar',
            length: '16',
            isNullable: true,
          },
          {
            name: 'is_used',
            type: 'boolean',
            default: false,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // 인덱스 생성
    await queryRunner.createIndex(
      'muffincraft_characters',
      new TableIndex({
        name: 'idx_muffincraft_characters_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'muffincraft_characters',
      new TableIndex({
        name: 'idx_muffincraft_characters_uuid',
        columnNames: ['minecraft_uuid'],
      }),
    );

    await queryRunner.createIndex(
      'muffincraft_link_codes',
      new TableIndex({
        name: 'idx_muffincraft_link_codes_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'muffincraft_link_codes',
      new TableIndex({
        name: 'idx_muffincraft_link_codes_code',
        columnNames: ['code'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('muffincraft_link_codes');
    await queryRunner.dropTable('muffincraft_characters');
  }
}
