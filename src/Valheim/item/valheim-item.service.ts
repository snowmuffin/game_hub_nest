import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ValheimItem,
  ValheimItemType,
  ValheimItemQuality,
} from '../../entities/valheim/valheim-item.entity';

export interface CreateValheimItemDto {
  name: string;
  item_code: string;
  description?: string;
  type: ValheimItemType;
  max_quality?: ValheimItemQuality;
  max_stack?: number;
  weight?: number;
  value?: number;
  crafting_recipe?: any;
  stats?: any;
  icon_url?: string;
  is_tradeable?: boolean;
  is_teleportable?: boolean;
  biome?: string;
}

export interface UpdateValheimItemDto {
  name?: string;
  description?: string;
  type?: ValheimItemType;
  max_quality?: ValheimItemQuality;
  max_stack?: number;
  weight?: number;
  value?: number;
  crafting_recipe?: any;
  stats?: any;
  icon_url?: string;
  is_tradeable?: boolean;
  is_teleportable?: boolean;
  biome?: string;
}

export interface ValheimItemSearchDto {
  type?: ValheimItemType;
  biome?: string;
  is_tradeable?: boolean;
  is_teleportable?: boolean;
  name?: string;
}

export interface ItemStatsDto {
  total_items: number;
  items_by_type: Array<{ type: string; count: string }>;
  tradeable_items: number;
  teleportable_items: number;
}

@Injectable()
export class ValheimItemService {
  private readonly logger = new Logger(ValheimItemService.name);

  constructor(
    @InjectRepository(ValheimItem)
    private readonly valheimItemRepository: Repository<ValheimItem>,
  ) {}

  /**
   * Get all Valheim items
   */
  async findAll(searchDto?: ValheimItemSearchDto): Promise<ValheimItem[]> {
    const queryBuilder = this.valheimItemRepository.createQueryBuilder('item');

    if (searchDto?.type) {
      queryBuilder.andWhere('item.type = :type', { type: searchDto.type });
    }

    if (searchDto?.biome) {
      queryBuilder.andWhere('item.biome ILIKE :biome', {
        biome: `%${searchDto.biome}%`,
      });
    }

    if (searchDto?.is_tradeable !== undefined) {
      queryBuilder.andWhere('item.is_tradeable = :is_tradeable', {
        is_tradeable: searchDto.is_tradeable,
      });
    }

    if (searchDto?.is_teleportable !== undefined) {
      queryBuilder.andWhere('item.is_teleportable = :is_teleportable', {
        is_teleportable: searchDto.is_teleportable,
      });
    }

    if (searchDto?.name) {
      queryBuilder.andWhere('item.name ILIKE :name', {
        name: `%${searchDto.name}%`,
      });
    }

    queryBuilder.orderBy('item.name', 'ASC');

    return await queryBuilder.getMany();
  }

  /**
   * ID로 특정 아이템 조회
   */
  async findById(id: number): Promise<ValheimItem> {
    const item = await this.valheimItemRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Valheim item with ID ${id} not found`);
    }

    return item;
  }

  /**
   * Get item by code
   */
  async findByItemCode(itemCode: string): Promise<ValheimItem> {
    const item = await this.valheimItemRepository.findOne({
      where: { item_code: itemCode },
    });

    if (!item) {
      throw new NotFoundException(
        `Valheim item with code ${itemCode} not found`,
      );
    }

    return item;
  }

  /**
   * Get items by type
   */
  async findByType(type: ValheimItemType): Promise<ValheimItem[]> {
    return await this.valheimItemRepository.find({
      where: { type },
      order: { name: 'ASC' },
    });
  }

  /**
   * Get items by biome
   */
  async findByBiome(biome: string): Promise<ValheimItem[]> {
    return await this.valheimItemRepository
      .createQueryBuilder('item')
      .where('item.biome ILIKE :biome', { biome: `%${biome}%` })
      .orderBy('item.name', 'ASC')
      .getMany();
  }

  /**
   * Get tradeable items
   */
  async findTradeableItems(): Promise<ValheimItem[]> {
    return await this.valheimItemRepository.find({
      where: { is_tradeable: true },
      order: { value: 'DESC' },
    });
  }

  /**
   * Get teleportable items
   */
  async findTeleportableItems(): Promise<ValheimItem[]> {
    return await this.valheimItemRepository.find({
      where: { is_teleportable: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Create new item
   */
  async create(createDto: CreateValheimItemDto): Promise<ValheimItem> {
    const existingItem = await this.valheimItemRepository.findOne({
      where: { item_code: createDto.item_code },
    });

    if (existingItem) {
      throw new Error(`Item with code ${createDto.item_code} already exists`);
    }

    const item = this.valheimItemRepository.create(createDto);
    const savedItem = await this.valheimItemRepository.save(item);

    this.logger.log(
      `Created new Valheim item: ${savedItem.name} (${savedItem.item_code})`,
    );
    return savedItem;
  }

  /**
   * Update item information
   */
  async update(
    id: number,
    updateDto: UpdateValheimItemDto,
  ): Promise<ValheimItem> {
    const item = await this.findById(id);

    Object.assign(item, updateDto);
    const updatedItem = await this.valheimItemRepository.save(item);

    this.logger.log(`Updated Valheim item: ${updatedItem.name} (ID: ${id})`);
    return updatedItem;
  }

  /**
   * Delete item
   */
  async delete(id: number): Promise<void> {
    const item = await this.findById(id);
    await this.valheimItemRepository.remove(item);

    this.logger.log(`Deleted Valheim item: ${item.name} (ID: ${id})`);
  }

  /**
   * Item statistics
   */
  async getItemStats(): Promise<ItemStatsDto> {
    const totalItems = await this.valheimItemRepository.count();

    const itemsByType = await this.valheimItemRepository
      .createQueryBuilder('item')
      .select('item.type, COUNT(*) as count')
      .groupBy('item.type')
      .getRawMany();

    const tradeableCount = await this.valheimItemRepository.count({
      where: { is_tradeable: true },
    });

    const teleportableCount = await this.valheimItemRepository.count({
      where: { is_teleportable: true },
    });

    return {
      total_items: totalItems,
      items_by_type: itemsByType as Array<{ type: string; count: string }>,
      tradeable_items: tradeableCount,
      teleportable_items: teleportableCount,
    };
  }
}
