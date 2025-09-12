import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { Game } from '../../entities/shared/game.entity';
import { GameServer } from '../../entities/shared/game-server.entity';
import { ServerHealthEvent } from '../../entities/shared/server-health-event.entity';
import { ServerHealthSnapshot } from '../../entities/shared/server-health-snapshot.entity';
import { ServerOutage } from '../../entities/shared/server-outage.entity';

type Status = 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  constructor(
    @InjectRepository(Game) private readonly gameRepo: Repository<Game>,
    @InjectRepository(GameServer)
    private readonly serverRepo: Repository<GameServer>,
    @InjectRepository(ServerHealthEvent)
    private readonly eventRepo: Repository<ServerHealthEvent>,
    @InjectRepository(ServerHealthSnapshot)
    private readonly snapRepo: Repository<ServerHealthSnapshot>,
    @InjectRepository(ServerOutage)
    private readonly outageRepo: Repository<ServerOutage>,
  ) {}

  private toUtcDate(iso?: string): Date {
    return iso ? new Date(iso) : new Date();
  }

  private floorToMinute(d: Date): Date {
    const t = new Date(d);
    t.setSeconds(0, 0);
    return t;
  }

  private parseIsoOr(input: string | undefined, fallback: Date): Date {
    if (!input) return fallback;
    const d = new Date(input);
    return isNaN(d.getTime()) ? fallback : d;
  }

  private async getServerOrThrow(
    code: string,
  ): Promise<{ game: Game; server: GameServer }> {
    const game = await this.gameRepo.findOne({
      where: { code: 'space_engineers' },
    });
    if (!game)
      throw new NotFoundException('Space Engineers game not configured');
    const server = await this.serverRepo.findOne({
      where: { game_id: game.id, code },
    });
    if (!server)
      throw new NotFoundException(`Server not found for code=${code}`);
    return { game, server };
  }

  async getEvents(
    code: string,
    params: {
      from?: string;
      to?: string;
      metricName?: string;
      limit?: number;
      order?: 'asc' | 'desc';
    },
  ): Promise<
    Array<{
      observedAt: string;
      status: Status;
      method: 'http' | 'tcp';
      metricName?: string | null;
      metricValue?: number | null;
      metricUnit?: string | null;
      httpStatus?: number | null;
      detail?: string | null;
    }>
  > {
    const { server } = await this.getServerOrThrow(code);
    const now = new Date();
    const from = this.parseIsoOr(
      params.from,
      new Date(now.getTime() - 60 * 60 * 1000),
    ); // default 1h
    const to = this.parseIsoOr(params.to, now);
    const order = params.order ?? 'asc';
    const limit =
      params.limit && params.limit > 0 ? Math.min(params.limit, 5000) : 1000;

    const rows = await this.eventRepo.find({
      where: {
        server_id: server.id,
        observed_at: Between(from, to),
        ...(params.metricName ? { metric_name: params.metricName } : {}),
      } as unknown as FindOptionsWhere<ServerHealthEvent>,
      order: { observed_at: order.toUpperCase() as 'ASC' | 'DESC' },
      take: limit,
    });
    return rows.map((r) => ({
      observedAt: r.observed_at.toISOString(),
      status: r.status as Status,
      method: r.method,
      metricName: r.metric_name ?? null,
      metricValue: r.metric_value ?? null,
      metricUnit: r.metric_unit ?? null,
      httpStatus: r.http_status ?? null,
      detail: r.detail ?? null,
    }));
  }

  async getSnapshots(
    code: string,
    params: { from?: string; to?: string; window?: '1m' | '5m' | '1h' },
  ): Promise<
    Array<{
      windowStart: string;
      windowSize: '1m' | '5m' | '1h';
      checksTotal: number;
      checksUp: number;
      uptimeRatio: number;
      metricAvg?: number | null;
      metricP50?: number | null;
      metricP95?: number | null;
      metricName?: string | null;
      metricUnit?: string | null;
      lastStatus?: Status | null;
      lastChangeAt?: string | null;
    }>
  > {
    const { server } = await this.getServerOrThrow(code);
    const now = new Date();
    const from = this.parseIsoOr(
      params.from,
      new Date(now.getTime() - 24 * 60 * 60 * 1000),
    ); // default 24h
    const to = this.parseIsoOr(params.to, now);
    const window = params.window ?? '1m';

    const rows = await this.snapRepo.find({
      where: {
        server_id: server.id,
        window_size: window,
        window_start: Between(from, to),
      },
      order: { window_start: 'ASC' },
    });
    return rows.map((s) => ({
      windowStart: s.window_start.toISOString(),
      windowSize: s.window_size,
      checksTotal: s.checks_total,
      checksUp: s.checks_up,
      uptimeRatio: Number(s.uptime_ratio),
      metricAvg: s.metric_avg ?? null,
      metricP50: s.metric_p50 ?? null,
      metricP95: s.metric_p95 ?? null,
      metricName: s.metric_name ?? null,
      metricUnit: s.metric_unit ?? null,
      lastStatus: (s.last_status as Status) ?? null,
      lastChangeAt: s.last_change_at ? s.last_change_at.toISOString() : null,
    }));
  }

  async getCurrentStatus(code: string): Promise<{
    status: Status;
    observedAt?: string;
    metricName?: string | null;
    metricValue?: number | null;
    metricUnit?: string | null;
    method?: 'http' | 'tcp';
    httpStatus?: number | null;
    outageOpen: boolean;
    uptime1h?: number | null;
  }> {
    const { server } = await this.getServerOrThrow(code);
    const latest = await this.eventRepo.find({
      where: { server_id: server.id },
      order: { observed_at: 'DESC' },
      take: 1,
    });
    const last = latest[0];
    let status: Status = 'UNKNOWN';
    let observedAt: string | undefined = undefined;
    let metricName: string | null | undefined = undefined;
    let metricValue: number | null | undefined = undefined;
    let metricUnit: string | null | undefined = undefined;
    let method: 'http' | 'tcp' | undefined = undefined;
    let httpStatus: number | null | undefined = undefined;
    if (last) {
      status = last.status as Status;
      observedAt = last.observed_at.toISOString();
      metricName = last.metric_name ?? null;
      metricValue = last.metric_value ?? null;
      metricUnit = last.metric_unit ?? null;
      method = last.method;
      httpStatus = last.http_status ?? null;
    }

    const open = await this.outageRepo.findOne({
      where: { server_id: server.id, ended_at: IsNull() },
    });

    // Compute 1h uptime from 1m snapshots
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const snaps = await this.snapRepo.find({
      where: {
        server_id: server.id,
        window_size: '1m',
        window_start: Between(oneHourAgo, now),
      },
    });
    let uptime1h: number | null = null;
    if (snaps.length) {
      const total = snaps.reduce((a, s) => a + s.checks_total, 0);
      const up = snaps.reduce((a, s) => a + s.checks_up, 0);
      uptime1h = total > 0 ? up / total : null;
    }

    return {
      status,
      observedAt,
      metricName,
      metricValue,
      metricUnit,
      method,
      httpStatus,
      outageOpen: !!open,
      uptime1h,
    };
  }

  async ingest(
    code: string,
    body: {
      observedAt?: string;
      status: Status;
      method: 'http' | 'tcp';
      metricName?: string;
      metricValue?: number;
      metricUnit?: string;
      httpStatus?: number;
      detail?: string;
      meta?: Record<string, unknown>;
      host?: string;
      port?: number;
      displayName?: string;
    },
  ): Promise<void> {
    this.logger.debug(
      `Health ingest received for code=${code} status=${body.status} method=${body.method}`,
    );
    // Find or create Space Engineers game to scope server codes
    let game = await this.gameRepo.findOne({
      where: { code: 'space_engineers' },
    });
    if (!game) {
      game = this.gameRepo.create({
        code: 'space_engineers',
        name: 'Space Engineers',
        is_active: true,
      });
      game = await this.gameRepo.save(game);
      this.logger.log('Created Space Engineers game entry via health ingest');
    }

    let server = await this.serverRepo.findOne({
      where: { game_id: game.id, code },
    });
    if (!server) {
      // Optional auto-registration flow
      const allowAuto = ['true', '1', 'yes', 'y'].includes(
        (process.env.SE_AUTO_REGISTER_SERVERS ?? 'false').toLowerCase(),
      );
      this.logger.debug(`Auto-register missing server? allowAuto=${allowAuto}`);
      if (!allowAuto) {
        this.logger.warn(
          `Server not found for code=${code} and auto-register disabled`,
        );
        throw new NotFoundException(`Server not found for code=${code}`);
      }

      // Optional API key gate
      const requiredKey = process.env.SE_INGEST_API_KEY?.trim();
      if (requiredKey) {
        // In a real app, you'd read from an auth header; for simplicity, allow meta.apiKey
        let provided: unknown = undefined;
        if (body.meta && typeof body.meta === 'object') {
          const metaObj: Record<string, unknown> = body.meta;
          provided = metaObj.apiKey;
        }
        if (provided !== requiredKey) {
          this.logger.warn(`Invalid ingest API key for code=${code}`);
          throw new UnauthorizedException('Invalid ingest API key');
        }
        this.logger.debug(`Ingest API key verified for code=${code}`);
      }

      // Minimal identity (host/port optional)
      const host =
        typeof body.host === 'string' && body.host.trim() !== ''
          ? body.host.trim()
          : undefined;
      const port =
        typeof body.port === 'number' && body.port > 0 ? body.port : undefined;

      const toCreate: Partial<GameServer> = {
        game_id: game.id,
        code,
        name: body.displayName || code,
        is_active: true, // since it’s reporting health
        metadata: {
          source: 'se.auto-registered',
          firstSeenAt: new Date().toISOString(),
        },
      };
      if (host) toCreate.host = host;
      if (typeof port === 'number') toCreate.port = port;
      server = await this.serverRepo.save(this.serverRepo.create(toCreate));
      this.logger.log(
        `Auto-registered server code=${code} host=${host ?? '-'} port=${port ?? '-'}`,
      );
    } else {
      // Update existing server with incoming host/port if valid and changed
      const incomingHost =
        typeof body.host === 'string' && body.host.trim() !== ''
          ? body.host.trim()
          : undefined;
      const incomingPort =
        typeof body.port === 'number' && body.port > 0 ? body.port : undefined;
      let changed = false;
      if (incomingHost && server.host !== incomingHost) {
        server.host = incomingHost;
        changed = true;
      }
      if (typeof incomingPort === 'number' && server.port !== incomingPort) {
        server.port = incomingPort;
        changed = true;
      }
      if (changed) {
        await this.serverRepo.save(server);
        this.logger.log(
          `Updated server code=${code} with host/port from ingest`,
        );
      }
    }

    const observed_at = this.toUtcDate(body.observedAt);

    // 1) Store raw event
    const event = this.eventRepo.create({
      server_id: server.id,
      observed_at,
      status: body.status,
      method: body.method,
      metric_name: body.metricName ?? null,
      metric_value:
        typeof body.metricValue === 'number' ? body.metricValue : null,
      metric_unit: body.metricUnit ?? null,
      http_status: body.httpStatus ?? null,
      detail: body.detail ?? null,
      meta: body.meta ?? null,
    });
    const saved = await this.eventRepo.save(event);

    // 2) Outage tracking (DOWN creates/extends; UP ends)
    if (body.status === 'DOWN') {
      let open = await this.outageRepo.findOne({
        where: { server_id: server.id, ended_at: IsNull() },
      });
      if (!open) {
        open = this.outageRepo.create({
          server_id: server.id,
          started_at: observed_at,
          sample_event_id: saved.id,
        });
        await this.outageRepo.save(open);
      }
    } else if (body.status === 'UP') {
      const open = await this.outageRepo.findOne({
        where: { server_id: server.id, ended_at: IsNull() },
      });
      if (open) {
        open.ended_at = observed_at;
        open.duration_sec = Math.max(
          0,
          Math.floor(
            (open.ended_at.getTime() - open.started_at.getTime()) / 1000,
          ),
        );
        await this.outageRepo.save(open);
      }
    }

    // 3) 1-minute snapshot upsert
    const window_start = this.floorToMinute(observed_at);
    let snap = await this.snapRepo.findOne({
      where: { server_id: server.id, window_start, window_size: '1m' },
    });
    if (!snap) {
      snap = this.snapRepo.create({
        server_id: server.id,
        window_start,
        window_size: '1m',
        checks_total: 0,
        checks_up: 0,
        uptime_ratio: '0.0000',
        metric_avg: null,
        metric_p50: null,
        metric_p95: null,
        metric_name: null,
        metric_unit: null,
        last_status: null,
        last_change_at: null,
      });
    }

    const prevTotal = snap.checks_total;
    const prevUp = snap.checks_up;
    const prevAvg = snap.metric_avg ?? null;

    snap.checks_total = prevTotal + 1;
    if (body.status === 'UP') snap.checks_up = prevUp + 1;

    // avg metric (incremental, no percentiles yet)
    if (typeof body.metricValue === 'number') {
      if (prevAvg === null) snap.metric_avg = body.metricValue;
      else
        snap.metric_avg =
          (prevAvg * prevTotal + body.metricValue) / (prevTotal + 1);
      if (!snap.metric_name && body.metricName) {
        snap.metric_name = body.metricName;
      }
      if (!snap.metric_unit && body.metricUnit) {
        snap.metric_unit = body.metricUnit;
      }
    }

    // rudimentary uptime ratio
    snap.uptime_ratio = (snap.checks_up / snap.checks_total).toFixed(4);

    // last status/change
    if (snap.last_status !== body.status) {
      snap.last_change_at = observed_at;
    }
    snap.last_status = body.status;

    await this.snapRepo.save(snap);
  }
}
