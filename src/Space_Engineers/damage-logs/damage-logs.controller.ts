import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { DamageLogsService } from './damage-logs.service';
import { DamageLogsPasswordGuard } from './damage-logs-password.guard';

@Controller('damage_logs')
export class DamageLogsController {
  constructor(private readonly damageLogsService: DamageLogsService) {}

  @UseGuards(DamageLogsPasswordGuard)
  @Get()
  logGetRequest(@Req() req: Request): string {
    console.log('GET Request received at /damage_logs:', req.query);
    return 'GET request logged';
  }

  @UseGuards(DamageLogsPasswordGuard)
  @Post()
  async logPostRequest(@Body() body: unknown): Promise<string> {
    if (!Array.isArray(body)) {
      throw new Error('Body must be an array of damage log objects');
    }
    await this.damageLogsService.processDamageLogs(body);
    return 'POST request logged';
  }
}
