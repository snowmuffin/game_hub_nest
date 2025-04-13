import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable20250322010100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'bigint', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'username', type: 'varchar', isUnique: true },
          { name: 'email', type: 'varchar', isUnique: true, isNullable: true },
          { name: 'password', type: 'varchar', isNullable: true },
          { name: 'steam_id', type: 'varchar', isUnique: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
