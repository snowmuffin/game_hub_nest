import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('muffincraft/inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('sync/:userId')
  async syncInventory(
    @Param('userId') userId: string,
    @Body() itemData: any
  ) {
    return await this.inventoryService.syncInventory(userId, itemData);
  }

  @Get(':userId')
  async getUserInventory(@Param('userId') userId: string) {
    return await this.inventoryService.getUserInventory(userId);
  }
}
