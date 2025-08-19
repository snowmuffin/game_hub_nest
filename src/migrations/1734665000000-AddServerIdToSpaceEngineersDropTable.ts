import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

/**
 * Adds nullable server_id column to space_engineers.drop_table and links to game_servers.id
 */
export class AddServerIdToSpaceEngineersDropTable1734665000000
  implements MigrationInterface
{
  private tableName = 'space_engineers.drop_table';
  private columnName = 'server_id';
  private fkName = 'FK_drop_table_server_id_game_servers_id';
  private indexName = 'IDX_drop_table_server_id';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn(
      this.tableName,
      this.columnName,
    );
    if (!hasColumn) {
      await queryRunner.addColumn(
        this.tableName,
        new TableColumn({
          name: this.columnName,
          type: 'int',
          isNullable: true,
        }),
      );

      // Create index for faster lookups when filtering by server
      await queryRunner.createIndex(
        this.tableName,
        new TableIndex({
          name: this.indexName,
          columnNames: [this.columnName],
        }),
      );

      // Add foreign key constraint to game_servers(id)
      await queryRunner.createForeignKey(
        this.tableName,
        new TableForeignKey({
          name: this.fkName,
          columnNames: [this.columnName],
          referencedTableName: 'game_servers',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn(
      this.tableName,
      this.columnName,
    );
    if (hasColumn) {
      // Drop foreign key if it exists
      const table = await queryRunner.getTable(this.tableName);
      const fk = table?.foreignKeys.find((f) =>
        f.columnNames.includes(this.columnName),
      );
      if (fk) {
        await queryRunner.dropForeignKey(this.tableName, fk);
      }

      // Drop index if exists
      const index = table?.indices.find((i) =>
        i.columnNames.includes(this.columnName),
      );
      if (index) {
        await queryRunner.dropIndex(this.tableName, index);
      }

      await queryRunner.dropColumn(this.tableName, this.columnName);
    }
  }
}
