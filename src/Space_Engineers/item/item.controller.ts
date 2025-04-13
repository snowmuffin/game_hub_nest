import { Controller, Get, Post, Body, Req, Logger, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ItemService } from './item.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'; // Guard 경로

@Controller('space-engineers/item') // 엔드포인트에 space_engineers 추가
export class ItemController {
  private readonly logger = new Logger(ItemController.name);

  constructor(private readonly itemService: ItemService) {}

  @Get()
  @UseGuards(JwtAuthGuard) // 인증 Guard 적용
  async getItems(@Req() req) {
    const userId = req.user?.id; // steamId 대신 id 사용
    if (!userId) {
      this.logger.error(`Authorization header is missing or invalid.`);
      throw new UnauthorizedException('Authorization header is missing or invalid.');
    }
    this.logger.log(`User ID from request: ${userId}`);
    return this.itemService.getItems(userId);
  }

  @Post('upload')
  async uploadItem(@Body() body: any) {
    const { userId, itemName, quantity } = body;
    this.logger.log(`POST /space_engineers/item/upload: User ID=${userId}, Item=${itemName}, Quantity=${quantity}`);
    return this.itemService.uploadItem(userId, itemName, quantity);
  }

  @Post('download')
  async downloadItem(@Body() body: any) {
    const { userId, itemName, quantity } = body;
    this.logger.log(`POST /space_engineers/item/download: User ID=${userId}, Item=${itemName}, Quantity=${quantity}`);
    return this.itemService.downloadItem(userId, itemName, quantity);
  }

  @Post('update-items')
  async updateItems(@Body() itemList: any[]) {
    this.logger.log(`POST /space_engineers/item/update-items`);
    return this.itemService.updateItems(itemList);
  }

  @Post('upgrade')
  @UseGuards(JwtAuthGuard) // 인증 Guard 적용
  async upgradeItem(@Body() body: any, @Req() req) {
    const userId = req.user.id; // steamId 대신 id 사용
    const { targetItem } = body;
    this.logger.log(`POST /space_engineers/item/upgrade: User ID=${userId}, Target Item=${targetItem}`);
    return this.itemService.upgradeItem(userId, targetItem);
  }

  @Get('blueprints')
  async getBlueprints() {
    this.logger.log(`GET /space_engineers/item/blueprints`);
    return this.itemService.getBlueprints();
  }
}