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
  ItemStatsDto,
} from './valheim-item.service';
import { ValheimItemType } from '../../entities/valheim/valheim-item.entity';

@Controller('valheim/item')
export class ValheimItemController {
  constructor(private readonly valheimItemService: ValheimItemService) {}

  /**
   * Get all Valheim items
   */
  @Get()
  async getAllItems(@Query() searchDto: ValheimItemSearchDto) {
    return await this.valheimItemService.findAll(searchDto);
  }

  /**
   * Get specific item (ID)
   */
  @Get(':id')
  async getItemById(@Param('id', ParseIntPipe) id: number) {
    return await this.valheimItemService.findById(id);
  }

  /**
   * Get item by code
   */
  @Get('code/:itemCode')
  async getItemByCode(@Param('itemCode') itemCode: string) {
    return await this.valheimItemService.findByItemCode(itemCode);
  }

  /**
   * Get items by type
   */
  @Get('type/:type')
  async getItemsByType(@Param('type') type: ValheimItemType) {
    return await this.valheimItemService.findByType(type);
  }

  /**
   * Get items by biome
   */
  @Get('biome/:biome')
  async getItemsByBiome(@Param('biome') biome: string) {
    return await this.valheimItemService.findByBiome(biome);
  }

  /**
   * Get tradeable items
   */
  @Get('filter/tradeable')
  async getTradeableItems() {
    return await this.valheimItemService.findTradeableItems();
  }

  /**
   * Get teleportable items
   */
  @Get('filter/teleportable')
  async getTeleportableItems() {
    return await this.valheimItemService.findTeleportableItems();
  }

  /**
   * Item statistics
   */
  @Get('stats/overview')
  async getItemStats(): Promise<ItemStatsDto> {
    return await this.valheimItemService.getItemStats();
  }

  /**
   * Create new item (admin only)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async createItem(@Body() createDto: CreateValheimItemDto) {
    return await this.valheimItemService.create(createDto);
  }

  /**
   * Update item information (admin only)
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
   * Delete item (admin only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteItem(@Param('id', ParseIntPipe) id: number) {
    await this.valheimItemService.delete(id);
    return { message: 'Item deleted successfully' };
  }
}
