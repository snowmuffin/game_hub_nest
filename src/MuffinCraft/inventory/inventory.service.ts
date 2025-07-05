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
   * 외부 창고에 아이템 저장 (플레이어가 수동으로 입금)
   */
  async depositItem(user: any, itemData: any) {
    this.logger.log(`외부 창고 입금: ${JSON.stringify(user)}, 아이템: ${JSON.stringify(itemData)}`);
    
    // 마인크래프트 UUID 사용
    const minecraftUuid = user.minecraftUuid;
    if (!minecraftUuid) {
      throw new Error('MinecraftUuid가 없습니다.');
    }

    this.logger.log(`사용할 minecraftUuid: ${minecraftUuid}`);

    const inventoryItem = await this.inventoryRepository.findOne({
      where: { 
        minecraftUuid: minecraftUuid, 
        itemId: itemData.itemId 
      }
    });

    this.logger.log(`기존 아이템 조회 결과: ${inventoryItem ? 'FOUND' : 'NOT_FOUND'}`);

    if (inventoryItem) {
      // 기존 아이템이 있으면 수량 추가
      const updatedItem = await this.inventoryRepository.save({
        ...inventoryItem,
        quantity: inventoryItem.quantity + itemData.quantity,
        metadata: { ...inventoryItem.metadata, ...itemData.metadata }
      });
      this.logger.log(`기존 아이템 수량 업데이트 완료: ${JSON.stringify(updatedItem)}`);
      return updatedItem;
    }

    const newItem = await this.inventoryRepository.save({
      minecraftUuid: minecraftUuid,
      itemId: itemData.itemId,
      itemName: itemData.itemName || 'Unknown Item',
      quantity: itemData.quantity,
      metadata: itemData.metadata
    });
    this.logger.log(`새로운 아이템 생성 완료: ${JSON.stringify(newItem)}`);
    return newItem;
  }

  /**
   * 플레이어 정보 기반으로 외부 창고 조회 (연동 여부 무관)
   */
  async getPlayerWarehouse(user: any) {
    this.logger.log(`외부 창고 조회: ${JSON.stringify(user)}`);
    
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
      where: { minecraftUuid: user.minecraftUuid },
      order: { itemName: 'ASC' }
    });
  }

  /**
   * @deprecated 더 이상 사용하지 않음 - minecraftUuid 기반으로 변경됨
   * 기존 syncInventory 메서드 (호환성 유지)
   */
  // async syncInventory(userId: string, itemData: any) {
  //   // 레거시 메서드 - 사용 중단
  //   throw new Error('This method is deprecated. Use minecraftUuid-based methods instead.');
  // }

  /**
   * @deprecated 더 이상 사용하지 않음 - minecraftUuid 기반으로 변경됨
   * 기존 getUserInventory 메서드 (호환성 유지)
   */
  // async getUserInventory(userId: string) {
  //   // 레거시 메서드 - 사용 중단
  //   throw new Error('This method is deprecated. Use minecraftUuid-based methods instead.');
  // }

  /**
   * 외부 창고에서 아이템 출금 (플레이어가 수동으로 출금)
   */
  async withdrawItem(user: any, itemData: { itemId: string; quantity: number }) {
    this.logger.log(`외부 창고 출금: ${JSON.stringify(user)}, 아이템: ${JSON.stringify(itemData)}`);
    
    // 마인크래프트 UUID 사용
    const minecraftUuid = user.minecraftUuid;
    if (!minecraftUuid) {
      throw new Error('MinecraftUuid가 없습니다.');
    }

    const inventoryItem = await this.inventoryRepository.findOne({
      where: { 
        minecraftUuid: minecraftUuid, 
        itemId: itemData.itemId 
      }
    });

    if (!inventoryItem) {
      throw new Error('창고에 해당 아이템이 없습니다.');
    }

    if (inventoryItem.quantity < itemData.quantity) {
      throw new Error(`창고에 충분한 아이템이 없습니다. (보유: ${inventoryItem.quantity}, 요청: ${itemData.quantity})`);
    }

    const newQuantity = inventoryItem.quantity - itemData.quantity;
    
    if (newQuantity === 0) {
      // 수량이 0이 되면 아이템 삭제
      await this.inventoryRepository.remove(inventoryItem);
      return { message: '아이템이 모두 출금되어 창고에서 제거되었습니다.', remainingQuantity: 0 };
    } else {
      // 수량 감소
      await this.inventoryRepository.save({
        ...inventoryItem,
        quantity: newQuantity
      });
      return { message: '아이템이 성공적으로 출금되었습니다.', remainingQuantity: newQuantity };
    }
  }
}
