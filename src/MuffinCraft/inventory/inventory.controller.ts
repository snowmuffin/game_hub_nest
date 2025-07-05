import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { MuffinCraftPlayerGuard } from '../auth/muffincraft-player.guard';

@Controller('muffincraft/inventory')
@UseGuards(MuffinCraftPlayerGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('sync')
  async syncInventory(
    @Request() req,
    @Body() itemData: any
  ) {
    return await this.inventoryService.syncPlayerInventory(req.user, itemData);
  }

  @Get('my-inventory')
  async getUserInventory(@Request() req) {
    return await this.inventoryService.getPlayerInventory(req.user);
  }

  /**
   * 기존 API 호환성 유지 (구 버전 클라이언트용)
   */
  @Post('user/:userId/sync')
  async syncInventoryById(
    @Param('userId') userId: string,
    @Body() itemData: any
  ) {
    return await this.inventoryService.syncInventory(userId, itemData);
  }

  @Get('user/:userId')
  async getUserInventoryById(@Param('userId') userId: string) {
    return await this.inventoryService.getUserInventory(userId);
  }
}
