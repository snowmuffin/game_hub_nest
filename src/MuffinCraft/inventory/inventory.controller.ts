import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { MuffinCraftPlayerGuard } from '../auth/muffincraft-player.guard';

interface AuthenticatedRequest {
  user: any;
}

@Controller('muffincraft/warehouse')
@UseGuards(MuffinCraftPlayerGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('deposit')
  async depositItem(
    @Request() req: AuthenticatedRequest,
    @Body() itemData: any,
  ) {
    return await this.inventoryService.depositItem(req.user, itemData);
  }

  @Post('withdraw')
  async withdrawItem(
    @Request() req: AuthenticatedRequest,
    @Body() itemData: { itemId: string; quantity: number },
  ) {
    return await this.inventoryService.withdrawItem(req.user, itemData);
  }

  @Get('my-warehouse')
  async getUserWarehouse(@Request() req: AuthenticatedRequest) {
    return await this.inventoryService.getPlayerWarehouse(req.user);
  }

  /**
   * Maintain API compatibility for legacy clients - no longer used
   * @deprecated Changed to external warehouse system
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
 * Separate controller for legacy inventory API compatibility
 */
@Controller('muffincraft/inventory')
@UseGuards(MuffinCraftPlayerGuard)
export class LegacyInventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('sync')
  async syncInventory(
    @Request() req: AuthenticatedRequest,
    @Body() itemData: any,
  ) {
    // Process legacy inventory sync as warehouse deposit
    return await this.inventoryService.depositItem(req.user, itemData);
  }

  @Get('my-inventory')
  async getUserInventory(@Request() req: AuthenticatedRequest) {
    // Process legacy inventory query as warehouse query
    return await this.inventoryService.getPlayerWarehouse(req.user);
  }

  /**
   * @deprecated No longer used - changed to minecraftUuid based
   * Maintain API compatibility for legacy clients
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
