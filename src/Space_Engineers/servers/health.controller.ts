import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { HealthService } from '@Space_Engineers/servers/health.service';

@Controller('space-engineers/servers')
export class HealthController {
  constructor(private readonly service: HealthService) {}

  // Server-side listener will call this
  @Post(':code/health')
  @HttpCode(202)
  async ingest(
    @Param('code') code: string,
    @Body()
    body: {
      observedAt?: string;
      status: 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';
      method: 'http' | 'tcp';
      metricName?: string; // e.g., 'latency', 'sim_speed'
      metricValue?: number;
      metricUnit?: string; // e.g., 'ms', '%'
      httpStatus?: number;
      detail?: string;
      meta?: Record<string, unknown>;
      // optional identity fields for auto-registration
      host?: string;
      port?: number;
      displayName?: string;
    },
  ) {
    await this.service.ingest(code, body);
    return { accepted: true };
  }

  // Frontend: fetch raw health events for charting
  @Get(':code/health/events')
  async getEvents(
    @Param('code') code: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('metricName') metricName?: string,
    @Query('limit') limit?: string,
    @Query('order') order?: 'asc' | 'desc',
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.service.getEvents(code, {
      from,
      to,
      metricName,
      limit: Number.isFinite(parsedLimit) ? parsedLimit : undefined,
      order,
    });
  }

  // Frontend: fetch aggregated snapshots for charting
  @Get(':code/health/snapshots')
  async getSnapshots(
    @Param('code') code: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('window') window?: '1m' | '5m' | '1h',
  ) {
    return this.service.getSnapshots(code, { from, to, window });
  }

  // Frontend: get current status summary
  @Get(':code/health/status')
  async getCurrentStatus(@Param('code') code: string) {
    return this.service.getCurrentStatus(code);
  }
}
