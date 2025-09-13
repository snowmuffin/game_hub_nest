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

export interface InventoryStats {
  total_items: number;
  items_by_type: { type: string; count: number }[];
  storage_distribution: { storage_type: string; count: number }[];
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
   * 사용자의 전체 인벤토리 조회
   */
  async getUserInventory(userId: number): Promise<ValheimInventory[]> {
    return await this.inventoryRepository.find({
      where: { user_id: userId },
      relations: ['item'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * 특정 보관 타입의 아이템들 조회
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
   * 특정 아이템의 총 수량 조회
   */
  async getItemQuantity(userId: number, itemId: number): Promise<number> {
    const result = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .select('SUM(inventory.quantity)', 'total')
      .where('inventory.user_id = :userId', { userId })
      .andWhere('inventory.item_id = :itemId', { itemId })
      .getRawOne<{ total: string | null }>();
    return parseInt(result?.total ?? '0') || 0;
  }

  /**
   * 인벤토리에 아이템 추가
   */
  async addItem(addDto: AddItemToInventoryDto): Promise<ValheimInventory> {
    // 사용자 및 아이템 존재 확인
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

    // 스택 제한 확인
    if (addDto.quantity > item.max_stack) {
      throw new BadRequestException(
        `Quantity ${addDto.quantity} exceeds max stack size ${item.max_stack}`,
      );
    }

    // 기존 동일한 아이템이 있는지 확인 (품질, 내구도 등이 같으면 스택 가능)
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
      // 기존 아이템에 수량 추가
      existingItem.quantity += addDto.quantity;
      const updatedItem = await this.inventoryRepository.save(existingItem);

      this.logger.log(
        `Added ${addDto.quantity} ${item.name} to user ${addDto.user_id}'s inventory (total: ${updatedItem.quantity})`,
      );
      return updatedItem;
    } else {
      // 새로운 인벤토리 항목 생성
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
   * 인벤토리 아이템 수량 감소
   */
  async removeItem(
    userId: number,
    itemId: number,
    quantity: number,
  ): Promise<void> {
    const inventoryItems = await this.inventoryRepository.find({
      where: { user_id: userId, item_id: itemId },
      order: { created_at: 'ASC' }, // 오래된 것부터 제거
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
        // 전체 스택 제거
        remainingToRemove -= inventoryItem.quantity;
        await this.inventoryRepository.remove(inventoryItem);
      } else {
        // 일부만 제거
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
   * 인벤토리 아이템 업데이트
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

    // 수량 제한 확인
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
   * 아이템 이동 (보관소 변경)
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
   * 사용자의 인벤토리 통계
   */
  async getInventoryStats(userId: number): Promise<InventoryStats> {
    const totalItems = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .select('SUM(inventory.quantity)', 'total')
      .where('inventory.user_id = :userId', { userId })
      .getRawOne<{ total: string | null }>();

    const itemTypesRaw = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoin('inventory.item', 'item')
      .select('item.type', 'type')
      .addSelect('SUM(inventory.quantity)', 'count')
      .where('inventory.user_id = :userId', { userId })
      .groupBy('item.type')
      .getRawMany<{ type: string | null; count: string | null }>();

    const storageDistributionRaw = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .select('inventory.storage_type, COUNT(*) as count')
      .where('inventory.user_id = :userId', { userId })
      .groupBy('inventory.storage_type')
      .getRawMany<{ storage_type: string | null; count: string | null }>();

    const items_by_type = itemTypesRaw.map((r) => ({
      type: r.type ?? '',
      count: parseInt(r.count ?? '0') || 0,
    }));

    const storage_distribution = storageDistributionRaw.map((r) => ({
      storage_type: r.storage_type ?? '',
      count: parseInt(r.count ?? '0') || 0,
    }));

    return {
      total_items: parseInt(totalItems?.total ?? '0') || 0,
      items_by_type,
      storage_distribution,
    };
  }

  /**
   * 인벤토리 초기화 (모든 아이템 삭제)
   */
  async clearInventory(userId: number): Promise<void> {
    await this.inventoryRepository.delete({ user_id: userId });
    this.logger.log(`Cleared inventory for user ${userId}`);
  }
}
