import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('damage_logs')
export class DamageLogsController {
  @Get()
  logGetRequest(@Req() req: Request): string {
    console.log('GET Request received at /api/damage_logs:', req.query);
    return 'GET request logged';
  }

  @Post()
  logPostRequest(@Req() req: Request, @Body() body: any): string {
    console.log('POST Request received at /api/damage_logs:', {
      headers: req.headers,
      body: body,
    });
    return 'POST request logged';
  }
}