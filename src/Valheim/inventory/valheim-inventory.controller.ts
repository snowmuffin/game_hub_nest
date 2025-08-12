import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  ValheimInventoryService,
  AddItemToInventoryDto,
  UpdateInventoryItemDto,
  InventoryStatsDto,
} from './valheim-inventory.service';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    steamId: string;
    username: string;
  };
}

@Controller('valheim/inventory')
@UseGuards(JwtAuthGuard)
export class ValheimInventoryController {
  constructor(private readonly inventoryService: ValheimInventoryService) {}

  /**
   * Get current user's full inventory
   */
  @Get()
  async getMyInventory(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return await this.inventoryService.getUserInventory(userId);
  }

  /**
   * Get specific user's inventory (admin only)
   */
  @Get('user/:userId')
  async getUserInventory(@Param('userId', ParseIntPipe) userId: number) {
    return await this.inventoryService.getUserInventory(userId);
  }

  /**
   * Get inventory by storage type
   */
  @Get('storage/:storageType')
  async getInventoryByStorageType(
    @Req() req: AuthenticatedRequest,
    @Param('storageType') storageType: string,
  ) {
    const userId = req.user.id;
    return await this.inventoryService.getUserInventoryByStorageType(
      userId,
      storageType,
    );
  }

  /**
   * Get item quantity
   */
  @Get('item/:itemId/quantity')
  async getItemQuantity(
    @Req() req: AuthenticatedRequest,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    const userId = req.user.id;
    const quantity = await this.inventoryService.getItemQuantity(
      userId,
      itemId,
    );
    return { item_id: itemId, quantity };
  }

  /**
   * Inventory statistics
   */
  @Get('stats')
  async getInventoryStats(
    @Req() req: AuthenticatedRequest,
  ): Promise<InventoryStatsDto> {
    const userId = req.user.id;
    return await this.inventoryService.getInventoryStats(userId);
  }

  /**
   * Add item to inventory
   */
  @Post('add')
  async addItem(
    @Req() req: AuthenticatedRequest,
    @Body() addDto: AddItemToInventoryDto,
  ) {
    // Set user ID from token
    addDto.user_id = req.user.id;
    return await this.inventoryService.addItem(addDto);
  }

  /**
   * Remove item from inventory
   */
  @Delete('remove')
  async removeItem(
    @Req() req: AuthenticatedRequest,
    @Body() body: { item_id: number; quantity: number },
  ) {
    const userId = req.user.id;
    await this.inventoryService.removeItem(userId, body.item_id, body.quantity);
    return { message: 'Item removed successfully' };
  }

  /**
   * Update inventory item
   */
  @Put(':inventoryId')
  async updateInventoryItem(
    @Param('inventoryId', ParseIntPipe) inventoryId: number,
    @Body() updateDto: UpdateInventoryItemDto,
  ) {
    return await this.inventoryService.updateInventoryItem(
      inventoryId,
      updateDto,
    );
  }

  /**
   * Move item (change storage)
   */
  @Put(':inventoryId/move')
  async moveItem(
    @Param('inventoryId', ParseIntPipe) inventoryId: number,
    @Body() body: { storage_type: string; storage_location?: string },
  ) {
    return await this.inventoryService.moveItem(
      inventoryId,
      body.storage_type,
      body.storage_location,
    );
  }

  /**
   * Clear inventory
   */
  @Delete('clear')
  async clearInventory(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    await this.inventoryService.clearInventory(userId);
    return { message: 'Inventory cleared successfully' };
  }
}
