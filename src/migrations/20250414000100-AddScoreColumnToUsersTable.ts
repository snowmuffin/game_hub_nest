import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddScoreColumnToUsersTable20250414000100
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'score',
        type: 'int',
        default: 0, // Default score value
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'score');
  }
}
