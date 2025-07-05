import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { MinecraftAuthGuard } from '../../auth/minecraft-auth.guard';

@Controller('muffincraft/inventory')
@UseGuards(MinecraftAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('sync')
  async syncInventory(
    @Request() req,
    @Body() itemData: any
  ) {
    const userId = req.user.id; // 마인크래프트 가드에서 id 필드 추가했으므로 통일
    return await this.inventoryService.syncInventory(userId, itemData);
  }

  @Get('my-inventory')
  async getUserInventory(@Request() req) {
    const userId = req.user.id; // 마인크래프트 가드에서 id 필드 추가했으므로 통일
    return await this.inventoryService.getUserInventory(userId);
  }
}
