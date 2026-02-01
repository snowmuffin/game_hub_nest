import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPngCdnUrlToIconFiles1738540000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add png_cdn_url column to icon_files table
    await queryRunner.addColumn(
      'space_engineers.icon_files',
      new TableColumn({
        name: 'png_cdn_url',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop png_cdn_url column
    await queryRunner.dropColumn('space_engineers.icon_files', 'png_cdn_url');
  }
}
