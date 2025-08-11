import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  ValheimItemService,
  CreateValheimItemDto,
  UpdateValheimItemDto,
  ValheimItemSearchDto,
} from './valheim-item.service';
import { ValheimItemType } from '../../entities/valheim/valheim-item.entity';

@Controller('valheim/item')
export class ValheimItemController {
  constructor(private readonly valheimItemService: ValheimItemService) {}

  /**
   * 모든 Valheim 아이템 조회
   */
  @Get()
  async getAllItems(@Query() searchDto: ValheimItemSearchDto) {
    return await this.valheimItemService.findAll(searchDto);
  }

  /**
   * 특정 아이템 조회 (ID)
   */
  @Get(':id')
  async getItemById(@Param('id', ParseIntPipe) id: number) {
    return await this.valheimItemService.findById(id);
  }

  /**
   * 아이템 코드로 조회
   */
  @Get('code/:itemCode')
  async getItemByCode(@Param('itemCode') itemCode: string) {
    return await this.valheimItemService.findByItemCode(itemCode);
  }

  /**
   * 타입별 아이템 조회
   */
  @Get('type/:type')
  async getItemsByType(@Param('type') type: ValheimItemType) {
    return await this.valheimItemService.findByType(type);
  }

  /**
   * 바이옴별 아이템 조회
   */
  @Get('biome/:biome')
  async getItemsByBiome(@Param('biome') biome: string) {
    return await this.valheimItemService.findByBiome(biome);
  }

  /**
   * 거래 가능한 아이템 조회
   */
  @Get('filter/tradeable')
  async getTradeableItems() {
    return await this.valheimItemService.findTradeableItems();
  }

  /**
   * 포탈 이동 가능한 아이템 조회
   */
  @Get('filter/teleportable')
  async getTeleportableItems() {
    return await this.valheimItemService.findTeleportableItems();
  }

  /**
   * 아이템 통계
   */
  @Get('stats/overview')
  async getItemStats() {
    return await this.valheimItemService.getItemStats();
  }

  /**
   * 새 아이템 생성 (관리자 전용)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async createItem(@Body() createDto: CreateValheimItemDto) {
    return await this.valheimItemService.create(createDto);
  }

  /**
   * 아이템 정보 업데이트 (관리자 전용)
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateValheimItemDto,
  ) {
    return await this.valheimItemService.update(id, updateDto);
  }

  /**
   * 아이템 삭제 (관리자 전용)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteItem(@Param('id', ParseIntPipe) id: number) {
    await this.valheimItemService.delete(id);
    return { message: 'Item deleted successfully' };
  }
}
