import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Game } from '../../entities/shared/game.entity';
import { GameServer } from '../../entities/shared/game-server.entity';
import { ServerHealthEvent } from '../../entities/shared/server-health-event.entity';
import { ServerHealthSnapshot } from '../../entities/shared/server-health-snapshot.entity';
import { ServerOutage } from '../../entities/shared/server-outage.entity';

type Status = 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';

@Injectable()
export class HealthService {
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
    // Find Space Engineers game to scope server codes
    const game = await this.gameRepo.findOne({
      where: { code: 'space_engineers' },
    });
    if (!game)
      throw new NotFoundException('Space Engineers game not configured');

    let server = await this.serverRepo.findOne({
      where: { game_id: game.id, code },
    });
    if (!server) {
      // Optional auto-registration flow
      const allowAuto =
        (process.env.SE_AUTO_REGISTER_SERVERS ?? 'false').toLowerCase() ===
        'true';
      if (!allowAuto) {
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
          throw new UnauthorizedException('Invalid ingest API key');
        }
      }

      // Minimal identity
      const host = body.host ?? undefined;
      const port = body.port ?? undefined;
      if (!host || typeof port !== 'number') {
        throw new BadRequestException(
          'Auto-registration requires host (string) and port (number) in payload',
        );
      }

      const toCreate: Partial<GameServer> = {
        game_id: game.id,
        code,
        name: body.displayName || code,
        server_url: host,
        port,
        is_active: true, // since it’s reporting health
        metadata: {
          source: 'se.auto-registered',
          firstSeenAt: new Date().toISOString(),
        },
      };
      server = await this.serverRepo.save(this.serverRepo.create(toCreate));
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
