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
   * 현재 사용자의 전체 인벤토리 조회
   */
  @Get()
  async getMyInventory(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return await this.inventoryService.getUserInventory(userId);
  }

  /**
   * 특정 사용자의 인벤토리 조회 (관리자용)
   */
  @Get('user/:userId')
  async getUserInventory(@Param('userId', ParseIntPipe) userId: number) {
    return await this.inventoryService.getUserInventory(userId);
  }

  /**
   * 보관 타입별 인벤토리 조회
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
   * 특정 아이템의 보유 수량 조회
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
   * 인벤토리 통계
   */
  @Get('stats')
  async getInventoryStats(
    @Req() req: AuthenticatedRequest,
  ): Promise<InventoryStatsDto> {
    const userId = req.user.id;
    return await this.inventoryService.getInventoryStats(userId);
  }

  /**
   * 인벤토리에 아이템 추가
   */
  @Post('add')
  async addItem(
    @Req() req: AuthenticatedRequest,
    @Body() addDto: AddItemToInventoryDto,
  ) {
    // 사용자 ID를 토큰에서 설정
    addDto.user_id = req.user.id;
    return await this.inventoryService.addItem(addDto);
  }

  /**
   * 인벤토리에서 아이템 제거
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
   * 인벤토리 아이템 업데이트
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
   * 아이템 이동 (보관소 변경)
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
   * 인벤토리 초기화
   */
  @Delete('clear')
  async clearInventory(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    await this.inventoryService.clearInventory(userId);
    return { message: 'Inventory cleared successfully' };
  }
}
