import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Adds protocol and host columns to game_servers and backfills from server_url if possible.
 */
export class AddProtocolHostToGameServers1734666000000
  implements MigrationInterface
{
  private table = 'game_servers';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasProtocol = await queryRunner.hasColumn(this.table, 'protocol');
    if (!hasProtocol) {
      await queryRunner.addColumn(
        this.table,
        new TableColumn({
          name: 'protocol',
          type: 'varchar',
          length: '20',
          isNullable: true,
        }),
      );
    }

    const hasHost = await queryRunner.hasColumn(this.table, 'host');
    if (!hasHost) {
      await queryRunner.addColumn(
        this.table,
        new TableColumn({
          name: 'host',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // Backfill protocol and host from existing server_url values
    // Attempt to parse rudimentary patterns: protocol://host:port/path
    const rows: Array<{
      id: number;
      server_url: string | null;
      port: number | null;
    }> = await queryRunner.query(
      `SELECT id, server_url, port FROM ${this.table}`,
    );

    for (const row of rows) {
      if (!row.server_url) continue;
      let protocol: string | null = null;
      let host: string | null = null;
      try {
        // Ensure URL has protocol; if missing, prepend http:// for parsing
        const hasScheme = /:\/\//.test(row.server_url);
        const candidate = hasScheme
          ? row.server_url
          : `http://${row.server_url}`;
        const url = new URL(candidate);
        protocol = url.protocol.replace(':', '');
        host = url.hostname;
      } catch {
        // Fallback regex parse
        const match = row.server_url.match(
          /^(?<proto>[a-zA-Z0-9+.-]+):\/\/(?<h>[^:/]+)(?::\d+)?/,
        );
        if (match?.groups) {
          protocol = match.groups.proto;
          host = match.groups.h;
        } else {
          // Maybe just host:port or host
          const hostOnly = row.server_url.split('/')[0];
          host = hostOnly.split(':')[0];
        }
      }

      if (protocol || host) {
        await queryRunner.query(
          `UPDATE ${this.table} SET protocol = $1, host = $2 WHERE id = $3`,
          [protocol, host, row.id],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasProtocol = await queryRunner.hasColumn(this.table, 'protocol');
    if (hasProtocol) {
      await queryRunner.dropColumn(this.table, 'protocol');
    }
    const hasHost = await queryRunner.hasColumn(this.table, 'host');
    if (hasHost) {
      await queryRunner.dropColumn(this.table, 'host');
    }
  }
}
