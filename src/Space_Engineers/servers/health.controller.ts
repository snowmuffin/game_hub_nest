import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
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
}
