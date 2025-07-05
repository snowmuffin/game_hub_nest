import { Controller, Get, Post, Body, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { MuffinCraftPlayerGuard } from '../auth/muffincraft-player.guard';

@Controller('muffincraft/warehouse')
@UseGuards(MuffinCraftPlayerGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('deposit')
  async depositItem(
    @Request() req,
    @Body() itemData: any
  ) {
    return await this.inventoryService.depositItem(req.user, itemData);
  }

  @Post('withdraw')
  async withdrawItem(
    @Request() req,
    @Body() itemData: { itemId: string; quantity: number }
  ) {
    return await this.inventoryService.withdrawItem(req.user, itemData);
  }

  @Get('my-warehouse')
  async getUserWarehouse(@Request() req) {
    return await this.inventoryService.getPlayerWarehouse(req.user);
  }

  /**
   * 기존 API 호환성 유지 (구 버전 클라이언트용) - 더 이상 사용하지 않음
   * @deprecated 외부 창고 시스템으로 변경됨
   */
  // @Post('user/:userId/sync')
  // async syncInventoryById(
  //   @Param('userId') userId: string,
  //   @Body() itemData: any
  // ) {
  //   return await this.inventoryService.syncInventory(userId, itemData);
  // }

  // @Get('user/:userId')
  // async getUserInventoryById(@Param('userId') userId: string) {
  //   return await this.inventoryService.getUserInventory(userId);
  // }
}

/**
 * 기존 인벤토리 API 호환성을 위한 별도 컨트롤러
 */
@Controller('muffincraft/inventory')
@UseGuards(MuffinCraftPlayerGuard)
export class LegacyInventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('sync')
  async syncInventory(
    @Request() req,
    @Body() itemData: any
  ) {
    // 기존 인벤토리 동기화를 창고 입금으로 처리
    return await this.inventoryService.depositItem(req.user, itemData);
  }

  @Get('my-inventory')
  async getUserInventory(@Request() req) {
    // 기존 인벤토리 조회를 창고 조회로 처리
    return await this.inventoryService.getPlayerWarehouse(req.user);
  }

  /**
   * @deprecated 더 이상 사용하지 않음 - minecraftUuid 기반으로 변경됨
   * 기존 API 호환성 유지 (구 버전 클라이언트용)
   */
  // @Post('user/:userId/sync')
  // async syncInventoryById(
  //   @Param('userId') userId: string,
  //   @Body() itemData: any
  // ) {
  //   return await this.inventoryService.syncInventory(userId, itemData);
  // }

  // @Get('user/:userId')
  // async getUserInventoryById(@Param('userId') userId: string) {
  //   return await this.inventoryService.getUserInventory(userId);
  // }
}
