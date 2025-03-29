import { Controller, Get, Post, Body, Req, Logger } from '@nestjs/common';
import { ItemService } from './item.service';

@Controller('space-engineers/item') // 네임스페이스 추가
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
    const { steamid, identifier, quantity } = body;

    // 요청 데이터 로그 출력
    this.logger.log(`Received upload request: ${JSON.stringify(body)}`);

    if (!identifier) {
      this.logger.error(`Identifier is missing in the request body: ${JSON.stringify(body)}`);
    }

    return this.itemService.uploadItem(steamid, identifier, quantity);
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