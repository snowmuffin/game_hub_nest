import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValheimInventory } from '../../entities/valheim/valheim-inventory.entity';
import {
  ValheimItem,
  ValheimItemQuality,
} from '../../entities/valheim/valheim-item.entity';
import { User } from '../../entities/shared/user.entity';

export interface AddItemToInventoryDto {
  user_id: number;
  item_id: number;
  quantity: number;
  quality?: ValheimItemQuality;
  durability?: number;
  storage_type?: string;
  storage_location?: string;
  enchantments?: any;
}

export interface UpdateInventoryItemDto {
  quantity?: number;
  quality?: ValheimItemQuality;
  durability?: number;
  storage_type?: string;
  storage_location?: string;
  enchantments?: any;
}

export interface InventoryStatsDto {
  total_items: number;
  items_by_type: Array<{ type: string; count: string }>;
  storage_distribution: Array<{ storage_type: string; count: string }>;
}

@Injectable()
export class ValheimInventoryService {
  private readonly logger = new Logger(ValheimInventoryService.name);

  constructor(
    @InjectRepository(ValheimInventory)
    private readonly inventoryRepository: Repository<ValheimInventory>,
    @InjectRepository(ValheimItem)
    private readonly itemRepository: Repository<ValheimItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Get user's full inventory
   */
  async getUserInventory(userId: number): Promise<ValheimInventory[]> {
    return await this.inventoryRepository.find({
      where: { user_id: userId },
      relations: ['item'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get items by storage type
   */
  async getUserInventoryByStorageType(
    userId: number,
    storageType: string,
  ): Promise<ValheimInventory[]> {
    return await this.inventoryRepository.find({
      where: {
        user_id: userId,
        storage_type: storageType,
      },
      relations: ['item'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get total quantity of specific item
   */
  async getItemQuantity(userId: number, itemId: number): Promise<number> {
    // TypeORM raw queries return 'any' by design - this is safe as we handle the result properly
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .select('SUM(inventory.quantity)', 'total')
      .where('inventory.user_id = :userId', { userId })
      .andWhere('inventory.item_id = :itemId', { itemId })
      .getRawOne();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return parseInt(String(result?.total || 0)) || 0;
  }

  /**
   * Add item to inventory
   */
  async addItem(addDto: AddItemToInventoryDto): Promise<ValheimInventory> {
    // Check user and item existence
    const user = await this.userRepository.findOne({
      where: { id: addDto.user_id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${addDto.user_id} not found`);
    }

    const item = await this.itemRepository.findOne({
      where: { id: addDto.item_id },
    });
    if (!item) {
      throw new NotFoundException(`Item with ID ${addDto.item_id} not found`);
    }

    // Check stack limit
    if (addDto.quantity > item.max_stack) {
      throw new BadRequestException(
        `Quantity ${addDto.quantity} exceeds max stack size ${item.max_stack}`,
      );
    }

    // Check if same item exists (stackable if quality, durability match)
    const existingItem = await this.inventoryRepository.findOne({
      where: {
        user_id: addDto.user_id,
        item_id: addDto.item_id,
        quality: addDto.quality || ValheimItemQuality.LEVEL_1,
        durability: addDto.durability || 100,
        storage_type: addDto.storage_type || 'inventory',
      },
    });

    if (
      existingItem &&
      existingItem.quantity + addDto.quantity <= item.max_stack
    ) {
      // Add quantity to existing item
      existingItem.quantity += addDto.quantity;
      const updatedItem = await this.inventoryRepository.save(existingItem);

      this.logger.log(
        `Added ${addDto.quantity} ${item.name} to user ${addDto.user_id}'s inventory (total: ${updatedItem.quantity})`,
      );
      return updatedItem;
    } else {
      // Create new inventory item
      const inventoryItem = this.inventoryRepository.create({
        ...addDto,
        quality: addDto.quality || ValheimItemQuality.LEVEL_1,
        durability: addDto.durability || 100,
        storage_type: addDto.storage_type || 'inventory',
      });

      const savedItem = await this.inventoryRepository.save(inventoryItem);
      this.logger.log(
        `Added ${addDto.quantity} ${item.name} to user ${addDto.user_id}'s inventory (new stack)`,
      );
      return savedItem;
    }
  }

  /**
   * Reduce inventory item quantity
   */
  async removeItem(
    userId: number,
    itemId: number,
    quantity: number,
  ): Promise<void> {
    const inventoryItems = await this.inventoryRepository.find({
      where: { user_id: userId, item_id: itemId },
      order: { created_at: 'ASC' }, // Remove oldest first
    });

    if (inventoryItems.length === 0) {
      throw new NotFoundException(
        `Item ${itemId} not found in user ${userId}'s inventory`,
      );
    }

    const totalQuantity = inventoryItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    if (totalQuantity < quantity) {
      throw new BadRequestException(
        `Not enough items. Have: ${totalQuantity}, Need: ${quantity}`,
      );
    }

    let remainingToRemove = quantity;
    for (const inventoryItem of inventoryItems) {
      if (remainingToRemove <= 0) break;

      if (inventoryItem.quantity <= remainingToRemove) {
        // Remove entire stack
        remainingToRemove -= inventoryItem.quantity;
        await this.inventoryRepository.remove(inventoryItem);
      } else {
        // Remove partial
        inventoryItem.quantity -= remainingToRemove;
        await this.inventoryRepository.save(inventoryItem);
        remainingToRemove = 0;
      }
    }

    this.logger.log(
      `Removed ${quantity} items (ID: ${itemId}) from user ${userId}'s inventory`,
    );
  }

  /**
   * Update inventory item
   */
  async updateInventoryItem(
    inventoryId: number,
    updateDto: UpdateInventoryItemDto,
  ): Promise<ValheimInventory> {
    const inventoryItem = await this.inventoryRepository.findOne({
      where: { id: inventoryId },
      relations: ['item'],
    });

    if (!inventoryItem) {
      throw new NotFoundException(
        `Inventory item with ID ${inventoryId} not found`,
      );
    }

    // Check quantity limit
    if (
      updateDto.quantity &&
      updateDto.quantity > inventoryItem.item.max_stack
    ) {
      throw new BadRequestException(
        `Quantity ${updateDto.quantity} exceeds max stack size ${inventoryItem.item.max_stack}`,
      );
    }

    Object.assign(inventoryItem, updateDto);
    const updatedItem = await this.inventoryRepository.save(inventoryItem);

    this.logger.log(`Updated inventory item ${inventoryId}`);
    return updatedItem;
  }

  /**
   * Move item (change storage)
   */
  async moveItem(
    inventoryId: number,
    newStorageType: string,
    newStorageLocation?: string,
  ): Promise<ValheimInventory> {
    return await this.updateInventoryItem(inventoryId, {
      storage_type: newStorageType,
      storage_location: newStorageLocation,
    });
  }

  /**
   * 사용자의 Inventory statistics
   */
  async getInventoryStats(userId: number): Promise<InventoryStatsDto> {
    // TypeORM raw queries return 'any' by design - this is safe as we handle the result properly
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const totalItems = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .select('SUM(inventory.quantity)', 'total')
      .where('inventory.user_id = :userId', { userId })
      .getRawOne();

    const itemTypes = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoin('inventory.item', 'item')
      .select('item.type, SUM(inventory.quantity) as count')
      .where('inventory.user_id = :userId', { userId })
      .groupBy('item.type')
      .getRawMany();

    const storageDistribution = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .select('inventory.storage_type, COUNT(*) as count')
      .where('inventory.user_id = :userId', { userId })
      .groupBy('inventory.storage_type')
      .getRawMany();

    return {
      total_items:
        parseInt(String((totalItems as { total?: number })?.total || 0)) || 0,
      items_by_type: itemTypes as Array<{ type: string; count: string }>,
      storage_distribution: storageDistribution as Array<{
        storage_type: string;
        count: string;
      }>,
    };
  }

  /**
   * Clear inventory (모든 Delete item)
   */
  async clearInventory(userId: number): Promise<void> {
    await this.inventoryRepository.delete({ user_id: userId });
    this.logger.log(`Cleared inventory for user ${userId}`);
  }
}
