import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateUsersTableStructure20250414000150 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add primary key if it doesn't exist
    const table = await queryRunner.getTable('users');
    if (table && !table.primaryColumns.length) {
      await queryRunner.query(`
        ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id)
      `);
    }

    // Add score column as float
    const scoreColumn = table?.findColumnByName('score');
    if (!scoreColumn) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'score',
          type: 'float',
          default: 0,
          isNullable: false,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop score column
    await queryRunner.dropColumn('users', 'score');

    // Drop primary key constraint
    await queryRunner.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey
    `);
  }
}
