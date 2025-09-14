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
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  ValheimInventoryService,
  AddItemToInventoryDto,
  UpdateInventoryItemDto,
} from './valheim-inventory.service';
import { ValheimInventory } from '../../entities/valheim/valheim-inventory.entity';

type AuthenticatedRequest = { user: { id: number } };

@Controller('valheim/inventory')
@UseGuards(JwtAuthGuard)
export class ValheimInventoryController {
  constructor(private readonly inventoryService: ValheimInventoryService) {}

  /**
   * Get current user's complete inventory
   */
  @Get()
  async getMyInventory(
    @Req() req: AuthenticatedRequest,
  ): Promise<ValheimInventory[]> {
    const userId = Number(req.user.id);
    return await this.inventoryService.getUserInventory(userId);
  }

  /**
   * Get specific user's inventory (for administrators)
   */
  @Get('user/:userId')
  async getUserInventory(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<ValheimInventory[]> {
    return await this.inventoryService.getUserInventory(userId);
  }

  /**
   * Get inventory by storage type
   */
  @Get('storage/:storageType')
  async getInventoryByStorageType(
    @Req() req: AuthenticatedRequest,
    @Param('storageType') storageType: string,
  ): Promise<ValheimInventory[]> {
    const userId = Number(req.user.id);
    return await this.inventoryService.getUserInventoryByStorageType(
      userId,
      storageType,
    );
  }

  /**
   * Get item quantity owned
   */
  @Get('item/:itemId/quantity')
  async getItemQuantity(
    @Req() req: AuthenticatedRequest,
    @Param('itemId', ParseIntPipe) itemId: number,
  ): Promise<{ item_id: number; quantity: number }> {
    const userId = Number(req.user.id);
    const quantity = await this.inventoryService.getItemQuantity(
      userId,
      itemId,
    );
    return { item_id: itemId, quantity };
  }

  /**
   * 인벤토리 통계
   */
  @Get('stats')
  async getInventoryStats(@Req() req: AuthenticatedRequest): Promise<{
    total_items: number;
    items_by_type: { type: string; count: number }[];
    storage_distribution: { storage_type: string; count: number }[];
  }> {
    const userId = Number(req.user.id);
    return await this.inventoryService.getInventoryStats(userId);
  }

  /**
   * 인벤토리에 아이템 추가
   */
  @Post('add')
  async addItem(
    @Req() req: AuthenticatedRequest,
    @Body() addDto: AddItemToInventoryDto,
  ): Promise<ValheimInventory> {
    // 사용자 ID를 토큰에서 설정
    addDto.user_id = Number(req.user.id);
    return await this.inventoryService.addItem(addDto);
  }

  /**
   * 인벤토리에서 아이템 제거
   */
  @Delete('remove')
  async removeItem(
    @Req() req: AuthenticatedRequest,
    @Body() body: { item_id: number; quantity: number },
  ): Promise<{ message: string }> {
    const userId = Number(req.user.id);
    await this.inventoryService.removeItem(userId, body.item_id, body.quantity);
    return { message: 'Item removed successfully' };
  }

  /**
   * 인벤토리 아이템 업데이트
   */
  @Put(':inventoryId')
  async updateInventoryItem(
    @Param('inventoryId', ParseIntPipe) inventoryId: number,
    @Body() updateDto: UpdateInventoryItemDto,
  ): Promise<ValheimInventory> {
    return await this.inventoryService.updateInventoryItem(
      inventoryId,
      updateDto,
    );
  }

  /**
   * 아이템 이동 (보관소 변경)
   */
  @Put(':inventoryId/move')
  async moveItem(
    @Param('inventoryId', ParseIntPipe) inventoryId: number,
    @Body() body: { storage_type: string; storage_location?: string },
  ): Promise<ValheimInventory> {
    return await this.inventoryService.moveItem(
      inventoryId,
      body.storage_type,
      body.storage_location,
    );
  }

  /**
   * 인벤토리 초기화
   */
  @Delete('clear')
  async clearInventory(
    @Req() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    const userId = Number(req.user.id);
    await this.inventoryService.clearInventory(userId);
    return { message: 'Inventory cleared successfully' };
  }
}
