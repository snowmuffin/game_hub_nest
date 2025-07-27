import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MuffinCraftInventory } from '../entities/muffincraft-inventory.entity';

interface UserData {
  minecraftUuid: string;
  type?: string;
  isLinked?: boolean;
  userId?: number;
  playerId?: number;
  id?: number;
}

interface ItemData {
  itemId: string;
  itemName?: string;
  quantity: number;
  metadata?: Record<string, any>;
}

interface WithdrawItemData {
  itemId: string;
  quantity: number;
}

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(MuffinCraftInventory)
    private inventoryRepository: Repository<MuffinCraftInventory>,
  ) {}

  /**
   * Store items in external warehouse (when player manually deposits)
   */
  async depositItem(user: UserData, itemData: ItemData) {
    this.logger.log(
      `External warehouse deposit: ${JSON.stringify(user)}, item: ${JSON.stringify(itemData)}`,
    );

    // Use Minecraft UUID
    const minecraftUuid = user.minecraftUuid;
    if (!minecraftUuid) {
      throw new Error('MinecraftUuid is missing.');
    }

    this.logger.log(`Using minecraftUuid: ${minecraftUuid}`);

    const inventoryItem = await this.inventoryRepository.findOne({
      where: {
        minecraftUuid: minecraftUuid,
        itemId: itemData.itemId,
      },
    });

    this.logger.log(
      `Existing item search result: ${inventoryItem ? 'FOUND' : 'NOT_FOUND'}`,
    );

    if (inventoryItem) {
      // If existing item found, add quantity
      const updatedItem = await this.inventoryRepository.save({
        ...inventoryItem,
        quantity: inventoryItem.quantity + itemData.quantity,
        metadata: { ...inventoryItem.metadata, ...itemData.metadata },
      });
      this.logger.log(
        `Existing item quantity updated: ${JSON.stringify(updatedItem)}`,
      );
      return updatedItem;
    }

    const newItem = await this.inventoryRepository.save({
      minecraftUuid: minecraftUuid,
      itemId: itemData.itemId,
      itemName: itemData.itemName || 'Unknown Item',
      quantity: itemData.quantity,
      metadata: itemData.metadata,
    });
    this.logger.log(`New item created: ${JSON.stringify(newItem)}`);
    return newItem;
  }

  /**
   * Query external warehouse based on player information (regardless of link status)
   */
  async getPlayerWarehouse(user: UserData) {
    this.logger.log(`External warehouse query: ${JSON.stringify(user)}`);

    // Note: User ID calculation for potential future features
    // Currently using minecraftUuid for warehouse queries
    return await this.inventoryRepository.find({
      where: { minecraftUuid: user.minecraftUuid },
      order: { itemName: 'ASC' },
    });
  }

  /**
   * @deprecated No longer used - changed to minecraftUuid-based approach
   * Legacy syncInventory method (maintained for compatibility)
   */
  // async syncInventory(userId: string, itemData: any) {
  //   // Legacy method - discontinued
  //   throw new Error('This method is deprecated. Use minecraftUuid-based methods instead.');
  // }

  /**
   * @deprecated No longer used - changed to minecraftUuid-based approach
   * Legacy getUserInventory method (maintained for compatibility)
   */
  // async getUserInventory(userId: string) {
  //   // Legacy method - discontinued
  //   throw new Error('This method is deprecated. Use minecraftUuid-based methods instead.');
  // }

  /**
   * Withdraw items from external warehouse (when player manually withdraws)
   */
  async withdrawItem(user: UserData, itemData: WithdrawItemData) {
    this.logger.log(
      `External warehouse withdrawal: ${JSON.stringify(user)}, item: ${JSON.stringify(itemData)}`,
    );

    // Use Minecraft UUID
    const minecraftUuid = user.minecraftUuid;
    if (!minecraftUuid) {
      throw new Error('MinecraftUuid is missing.');
    }

    const inventoryItem = await this.inventoryRepository.findOne({
      where: {
        minecraftUuid: minecraftUuid,
        itemId: itemData.itemId,
      },
    });

    if (!inventoryItem) {
      throw new Error('Item not found in warehouse.');
    }

    if (inventoryItem.quantity < itemData.quantity) {
      throw new Error(
        `Insufficient items in warehouse. (Available: ${inventoryItem.quantity}, Requested: ${itemData.quantity})`,
      );
    }

    const newQuantity = inventoryItem.quantity - itemData.quantity;

    if (newQuantity === 0) {
      // Remove item when quantity becomes 0
      await this.inventoryRepository.remove(inventoryItem);
      return {
        message: 'All items have been withdrawn and removed from warehouse.',
        remainingQuantity: 0,
      };
    } else {
      // Decrease quantity
      await this.inventoryRepository.save({
        ...inventoryItem,
        quantity: newQuantity,
      });
      return {
        message: 'Items have been successfully withdrawn.',
        remainingQuantity: newQuantity,
      };
    }
  }
}
