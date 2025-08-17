import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { DamageLogsService } from './damage-logs.service';

@Controller('damage_logs')
export class DamageLogsController {
  constructor(private readonly damageLogsService: DamageLogsService) {}

  @Get()
  logGetRequest(@Req() req: Request): string {
    console.log('GET Request received at /damage_logs:', req.query);
    return 'GET request logged';
  }

  @Post()
  async logPostRequest(@Body() body: any): Promise<string> {
    await this.damageLogsService.processDamageLogs(body);
    return 'POST request logged';
  }
}
