import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import axios from 'axios';
import net from 'node:net';
import { SeServer } from '../space-engineers.config';
import { Game } from '../../entities/shared/game.entity';
import { GameServer } from '../../entities/shared/game-server.entity';
import {
  SPACE_ENGINEERS_CONFIG,
  SpaceEngineersConfig,
} from '../space-engineers.config';

@Injectable()
export class ServersService {
  private readonly logger = new Logger(ServersService.name);

  constructor(
    @InjectRepository(Game) private readonly gameRepo: Repository<Game>,
    @InjectRepository(GameServer)
    private readonly serverRepo: Repository<GameServer>,
    @Inject(SPACE_ENGINEERS_CONFIG)
    private readonly cfg: SpaceEngineersConfig,
  ) {}

  /** Ensures the Space Engineers game row exists and returns its id */
  private async ensureGame(): Promise<Game> {
    const code = 'space_engineers';
    let game = await this.gameRepo.findOne({ where: { code } });
    if (!game) {
      game = this.gameRepo.create({
        code,
        name: 'Space Engineers',
        is_active: true,
      });
      game = await this.gameRepo.save(game);
      this.logger.log(`Created game entry for code=${code}`);
    }
    return game;
  }

  private async checkOnline(s: SeServer): Promise<{
    online: boolean;
    metricName?: string; // e.g., 'latency'
    metricValue?: number;
    metricUnit?: string; // e.g., 'ms'
    method: 'http' | 'tcp';
    httpStatus?: number;
    detail?: string;
    checkedAt: string;
  }> {
    const started = Date.now();
    const checkedAt = new Date().toISOString();
    type HealthCheck = {
      type?: 'http' | 'tcp';
      url?: string;
      protocol?: 'http' | 'https';
      port?: number;
      path?: string;
      timeoutMs?: number;
      expectedStatus?: number | number[];
    };
    const maybeHealth = (s as Record<string, unknown>)['healthCheck'];
    const health: HealthCheck | undefined =
      maybeHealth && typeof maybeHealth === 'object'
        ? (maybeHealth as HealthCheck)
        : undefined;

    const timeoutMs = health?.timeoutMs ?? 2000;
    const method = health?.type ?? 'tcp';

    try {
      if (method === 'http') {
        // Build URL if not provided
        const proto = health?.protocol ?? 'http';
        const port = health?.port ?? s.port ?? 80;
        const path = health?.path ?? '/health';
        const url = health?.url ?? `${proto}://${s.host}:${port}${path}`;
        const start = Date.now();
        const res = await axios.get(url, {
          timeout: timeoutMs,
          validateStatus: () => true,
        });
        const latency = Date.now() - start;
        const okStatuses = Array.isArray(health?.expectedStatus)
          ? health?.expectedStatus
          : [health?.expectedStatus ?? 200];
        const online =
          okStatuses.includes(res.status) ||
          (res.status >= 200 && res.status < 300);
        return {
          online,
          metricName: 'latency',
          metricValue: latency,
          metricUnit: 'ms',
          method: 'http',
          httpStatus: res.status,
          checkedAt,
        };
      }

      // TCP fallback
      if (!s.host || !s.port) {
        return {
          online: false,
          method: 'tcp',
          detail: 'Missing host or port for TCP check',
          checkedAt,
        };
      }
      const host: string = s.host;
      const port: number = s.port;
      const socket = new net.Socket();
      await new Promise<void>((resolve, reject) => {
        socket.setTimeout(timeoutMs);
        socket.once('timeout', () => {
          socket.destroy();
          reject(new Error('timeout'));
        });
        socket.once('error', (err) => {
          socket.destroy();
          reject(err);
        });
        socket.connect(port, host, () => {
          socket.end();
          resolve();
        });
      });
      return {
        online: true,
        metricName: 'latency',
        metricValue: Date.now() - started,
        metricUnit: 'ms',
        method: 'tcp',
        checkedAt,
      };
    } catch (e: unknown) {
      let detail: string | undefined;
      if (
        typeof e === 'object' &&
        e !== null &&
        'message' in e &&
        typeof (e as { message?: unknown }).message === 'string'
      ) {
        detail = (e as { message?: string }).message;
      } else {
        detail = String(e);
      }
      return {
        online: false,
        metricName: 'latency',
        metricValue: Date.now() - started,
        metricUnit: 'ms',
        method,
        detail,
        checkedAt,
      };
    }
  }

  /**
   * Sync servers from servers.yaml into shared GameServer table.
   * - Creates new servers if missing
   * - Updates host/port/name/metadata when changed
   * - Leaves unknown servers (not present in yaml) untouched
   */
  async syncFromConfig(options?: { activeOnly?: boolean }): Promise<{
    created: number;
    updated: number;
    total: number;
    servers: GameServer[];
  }> {
    const game = await this.ensureGame();
    const configured = this.cfg.list();

    const existing = await this.serverRepo.find({
      where: { game_id: game.id },
    });
    const byCode = new Map(existing.map((s) => [s.code, s]));

    let created = 0;
    let updated = 0;
    const results: GameServer[] = [];

    for (const s of configured) {
      const code = s.id; // use config id as server code
      const name = s.id; // could prettify later
      const server_url: string | undefined = s.host ? `${s.host}` : undefined;
      const port: number | undefined =
        typeof s.port === 'number' ? s.port : undefined;

      // Online check first
      const status = await this.checkOnline(s);
      const isActive = status.online;

      const metadata: Record<string, unknown> = {
        dropRateMultiplier: s.dropRateMultiplier,
        marketplaceEnabled: s.marketplaceEnabled,
        limits: s.limits,
        source: 'se.servers.yaml',
        status,
      };

      const found = byCode.get(code);
      if (!found) {
        if (options?.activeOnly && !isActive) {
          // Skip creation when only active servers should be created
          continue;
        }
        const toCreate: DeepPartial<GameServer> = {
          game_id: game.id,
          code,
          name,
          is_active: isActive,
          metadata,
        };
        if (server_url !== undefined) {
          toCreate.server_url = server_url;
        }
        if (port !== undefined) {
          toCreate.port = port;
        }

        const entity = this.serverRepo.create(toCreate);
        const saved = await this.serverRepo.save(entity);
        created++;
        results.push(saved);
      } else {
        let change = false;
        if (found.name !== name) {
          found.name = name;
          change = true;
        }
        if (server_url !== undefined && found.server_url !== server_url) {
          // found.server_url is typed as string; assign only when value present
          (found as unknown as { server_url?: string }).server_url = server_url;
          change = true;
        }
        if (port !== undefined && found.port !== port) {
          (found as unknown as { port?: number }).port = port;
          change = true;
        }
        if (found.is_active !== isActive) {
          found.is_active = isActive;
          change = true;
        }
        // conservative metadata replace
        const newMeta = metadata as object;
        if (JSON.stringify(found.metadata ?? {}) !== JSON.stringify(newMeta)) {
          found.metadata = newMeta;
          change = true;
        }
        if (change) {
          const saved = await this.serverRepo.save(found);
          updated++;
          results.push(saved);
        } else {
          results.push(found);
        }
      }
    }

    return { created, updated, total: results.length, servers: results };
  }
}
