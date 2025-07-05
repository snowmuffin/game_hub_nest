import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MuffinCraftInventory } from '../entities/muffincraft-inventory.entity';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(MuffinCraftInventory)
    private inventoryRepository: Repository<MuffinCraftInventory>,
  ) {}

  /**
   * 플레이어 정보 기반으로 인벤토리 동기화 (연동 여부 무관)
   */
  async syncPlayerInventory(user: any, itemData: any) {
    this.logger.log(`플레이어 인벤토리 동기화: ${JSON.stringify(user)}, 아이템: ${JSON.stringify(itemData)}`);
    
    let targetUserId: number;
    
    if (user.type === 'minecraft_player') {
      // 마인크래프트 플레이어인 경우
      if (user.isLinked && user.userId) {
        // 연동된 플레이어는 웹 사이트 유저 ID 사용
        targetUserId = user.userId;
      } else {
        // 연동되지 않은 플레이어는 마인크래프트 플레이어 ID를 가상 유저 ID로 사용
        targetUserId = user.playerId + 100000; // 충돌 방지를 위해 큰 수 더함
      }
    } else {
      // 웹 사이트 유저인 경우
      targetUserId = user.id;
    }

    const inventoryItem = await this.inventoryRepository.findOne({
      where: { 
        user: { id: targetUserId }, 
        itemId: itemData.itemId 
      }
    });

    if (inventoryItem) {
      return await this.inventoryRepository.save({
        ...inventoryItem,
        quantity: itemData.quantity,
        metadata: { ...inventoryItem.metadata, ...itemData.metadata }
      });
    }

    return await this.inventoryRepository.save({
      user: { id: targetUserId } as any,
      itemId: itemData.itemId,
      itemName: itemData.itemName || 'Unknown Item',
      quantity: itemData.quantity,
      metadata: itemData.metadata
    });
  }

  /**
   * 플레이어 정보 기반으로 인벤토리 조회 (연동 여부 무관)
   */
  async getPlayerInventory(user: any) {
    this.logger.log(`플레이어 인벤토리 조회: ${JSON.stringify(user)}`);
    
    let targetUserId: number;
    
    if (user.type === 'minecraft_player') {
      // 마인크래프트 플레이어인 경우
      if (user.isLinked && user.userId) {
        // 연동된 플레이어는 웹 사이트 유저 ID 사용
        targetUserId = user.userId;
      } else {
        // 연동되지 않은 플레이어는 마인크래프트 플레이어 ID를 가상 유저 ID로 사용
        targetUserId = user.playerId + 100000; // 충돌 방지를 위해 큰 수 더함
      }
    } else {
      // 웹 사이트 유저인 경우
      targetUserId = user.id;
    }

    return await this.inventoryRepository.find({
      where: { user: { id: targetUserId } },
      relations: ['user']
    });
  }

  /**
   * 기존 syncInventory 메서드 (호환성 유지)
   */
  async syncInventory(userId: string, itemData: any) {
    const inventoryItem = await this.inventoryRepository.findOne({
      where: { 
        user: { id: parseInt(userId) }, 
        itemId: itemData.itemId 
      }
    });

    if (inventoryItem) {
      return await this.inventoryRepository.save({
        ...inventoryItem,
        quantity: itemData.quantity,
        metadata: { ...inventoryItem.metadata, ...itemData.metadata }
      });
    }

    return await this.inventoryRepository.save({
      user: { id: parseInt(userId) } as any,
      itemId: itemData.itemId,
      itemName: itemData.itemName || 'Unknown Item',
      quantity: itemData.quantity,
      metadata: itemData.metadata
    });
  }

  /**
   * 기존 getUserInventory 메서드 (호환성 유지)
   */
  async getUserInventory(userId: string) {
    return await this.inventoryRepository.find({
      where: { user: { id: parseInt(userId) } },
      relations: ['user']
    });
  }
}
