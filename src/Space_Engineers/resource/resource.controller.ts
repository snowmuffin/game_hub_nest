import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Get(':steamid')
  @UseGuards(AuthGuard('jwt'))
  async getResources(@Param('steamid') steamId: string) {
    return this.resourceService.getResources(steamId);
  }

  @Post('download')
  @UseGuards(AuthGuard('jwt'))
  async download(@Body() body: { steamid: string; itemName: string; quantity: number }) {
    return this.resourceService.download(body.steamid, body.itemName, body.quantity);
  }

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  async upload(@Body() body: { steamid: string; itemName: string; quantity: number }) {
    return this.resourceService.upload(body.steamid, body.itemName, body.quantity);
  }
}