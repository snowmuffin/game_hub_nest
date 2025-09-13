import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueIndexBlocksTypeSubtype1726406000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_blocks_type_subtype" ON "space_engineers"."blocks" ("type_id", "subtype_id");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_blocks_type_subtype";`);
  }
}
