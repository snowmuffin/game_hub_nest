import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ServersService } from './servers.service';

@Controller('space-engineers/servers')
export class ServersController {
  constructor(private readonly service: ServersService) {}

  /**
   * Sync servers.yaml into shared GameServer table for Space Engineers game.
   * - Creates/updates records, leaves extras untouched
   */
  @Post('sync')
  @HttpCode(200)
  async sync(@Body() body?: { activeOnly?: boolean }) {
    const result = await this.service.syncFromConfig({
      activeOnly: body?.activeOnly,
    });
    return {
      success: true,
      ...result,
    };
  }
}
