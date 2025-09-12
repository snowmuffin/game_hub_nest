import fs from 'node:fs';
import path from 'node:path';
import { load as yamlLoad } from 'js-yaml';

export interface SeServerLimits {
  maxStorageSlots?: number;
  maxItemStack?: number;
}

export interface SeServer {
  id: string;
  host: string;
  port: number;
  dropRateMultiplier?: number;
  marketplaceEnabled?: boolean;
  limits?: SeServerLimits;
  // You can extend with custom fields as needed
  [key: string]: unknown;
}

export interface SeRegistry {
  servers: SeServer[];
}

export class SpaceEngineersConfig {
  private byId = new Map<string, SeServer>();
  private defaultId?: string;

  constructor(registryPath?: string, defaultId?: string) {
    const filePath = registryPath
      ? this.resolvePath(registryPath)
      : path.resolve(process.cwd(), 'config/space-engineers/servers.yaml');

    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const yamlLoadFn = yamlLoad as unknown as (src: string) => unknown;
      const parsedUnknown: unknown = yamlLoadFn(raw);

      if (!parsedUnknown || typeof parsedUnknown !== 'object') {
        throw new Error('servers.yaml: root must be an object');
      }

      const servers = (parsedUnknown as { servers?: unknown }).servers;
      if (!Array.isArray(servers) || servers.length === 0) {
        throw new Error('servers.yaml: "servers" is missing or empty');
      }

      for (const s of servers) {
        this.validateServer(s as SeServer);
        const id = (s as SeServer).id;
        if (this.byId.has(id)) {
          throw new Error(`servers.yaml: duplicated id "${id}"`);
        }
        this.byId.set(id, s as SeServer);
      }
    } else {
      // Fallback: single-server from env
      const host = process.env.SE_SERVER_HOST;
      const port = process.env.SE_SERVER_PORT
        ? Number(process.env.SE_SERVER_PORT)
        : undefined;

      if (host && port) {
        const fallback: SeServer = {
          id: 'default',
          host,
          port,
          dropRateMultiplier: process.env.SE_DROP_RATE_MULTIPLIER
            ? Number(process.env.SE_DROP_RATE_MULTIPLIER)
            : undefined,
          marketplaceEnabled:
            typeof process.env.SE_MARKETPLACE_ENABLED === 'string'
              ? process.env.SE_MARKETPLACE_ENABLED.toLowerCase() === 'true'
              : undefined,
          limits: {
            maxStorageSlots: process.env.SE_MAX_STORAGE_SLOTS
              ? Number(process.env.SE_MAX_STORAGE_SLOTS)
              : undefined,
            maxItemStack: process.env.SE_MAX_ITEM_STACK
              ? Number(process.env.SE_MAX_ITEM_STACK)
              : undefined,
          },
        };
        this.byId.set(fallback.id, fallback);
      } else {
        throw new Error(
          `No servers.yaml found at ${filePath} and no single-server env (SE_SERVER_HOST/SE_SERVER_PORT) provided.`,
        );
      }
    }

    this.defaultId =
      defaultId || process.env.SE_DEFAULT_SERVER_ID || this.firstId();
  }

  private resolvePath(p: string): string {
    if (p.startsWith('.') || p.startsWith('/')) {
      return path.resolve(process.cwd(), p);
    }
    return path.resolve(process.cwd(), p);
  }

  private firstId(): string {
    const first = Array.from(this.byId.keys())[0];
    if (!first) throw new Error('No servers configured');
    return first;
  }

  private validateServer(s: SeServer) {
    if (!s || typeof s !== 'object') throw new Error('Invalid server entry');
    if (!s.id || !s.host || typeof s.port !== 'number') {
      throw new Error(`Invalid server entry: ${JSON.stringify(s)}`);
    }
  }

  list(): SeServer[] {
    return Array.from(this.byId.values());
  }

  get(id?: string): SeServer {
    const key = id || this.defaultId || this.firstId();
    const s = this.byId.get(key);
    if (!s) throw new Error(`Unknown server id: ${key}`);
    return s;
  }
}

export const SPACE_ENGINEERS_CONFIG = Symbol('SPACE_ENGINEERS_CONFIG');
export const SpaceEngineersConfigProvider = {
  provide: SPACE_ENGINEERS_CONFIG,
  useFactory: () =>
    new SpaceEngineersConfig(
      process.env.SE_SERVERS_CONFIG,
      process.env.SE_DEFAULT_SERVER_ID,
    ),
};
