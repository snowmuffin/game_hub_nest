import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateOnlineStorageTable20250322020300 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'online_storage',
        columns: [
          { name: 'id', type: 'bigserial', isPrimary: true },
          { name: 'steam_id', type: 'varchar', isUnique: true },
          { name: 'items', type: 'jsonb', default: "'{}'" },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('online_storage');
  }
}