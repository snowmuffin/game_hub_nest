import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Adds last_active_at column to users table
 */
export class AddLastActiveAtToUsers1734660000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('users', 'last_active_at');
    if (!hasColumn) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'last_active_at',
          type: 'timestamptz',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('users', 'last_active_at');
    if (hasColumn) {
      await queryRunner.dropColumn('users', 'last_active_at');
    }
  }
}
