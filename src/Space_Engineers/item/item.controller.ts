import { Controller, Get, Post, Body, Req, Logger } from '@nestjs/common';
import { ItemService } from './item.service';

@Controller('items')
export class ItemController {
  private readonly logger = new Logger(ItemController.name);

  constructor(private readonly itemService: ItemService) {}

  @Get()
  async getItems(@Req() req) {
    const steamId = req.user.steamId;
    this.logger.log(`GET /items for Steam ID: ${steamId}`);
    return this.itemService.getItems(steamId);
  }

  @Post('upload')
  async uploadItem(@Body() body: any) {
    const { steamid, itemName, quantity } = body;
    this.logger.log(`POST /items/upload: Steam ID=${steamid}, Item=${itemName}, Quantity=${quantity}`);
    return this.itemService.uploadItem(steamid, itemName, quantity);
  }

  @Post('download')
  async downloadItem(@Body() body: any) {
    const { steamid, itemName, quantity } = body;
    this.logger.log(`POST /items/download: Steam ID=${steamid}, Item=${itemName}, Quantity=${quantity}`);
    return this.itemService.downloadItem(steamid, itemName, quantity);
  }

  @Post('update-items')
  async updateItems(@Body() itemList: any[]) {
    this.logger.log(`POST /items/update-items`);
    return this.itemService.updateItems(itemList);
  }

  @Post('upgrade')
  async upgradeItem(@Body() body: any, @Req() req) {
    const steamId = req.user.steamId;
    const { targetItem } = body;
    this.logger.log(`POST /items/upgrade: Steam ID=${steamId}, Target Item=${targetItem}`);
    return this.itemService.upgradeItem(steamId, targetItem);
  }

  @Get('blueprints')
  async getBlueprints() {
    this.logger.log(`GET /items/blueprints`);
    return this.itemService.getBlueprints();
  }
}