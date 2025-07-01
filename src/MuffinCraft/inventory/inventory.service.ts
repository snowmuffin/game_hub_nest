import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MuffinCraftInventory } from '../entities/muffincraft-inventory.entity';
import { ItemService } from '../../Minecraft/item/item.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(MuffinCraftInventory)
    private inventoryRepository: Repository<MuffinCraftInventory>,
    private itemService: ItemService,
  ) {}

  async syncInventory(userId: string, itemData: any) {
    // Minecraft의 기존 아이템 시스템과 연동
    const minecraftItem = await this.itemService.findOne(itemData.itemId);

    if (!minecraftItem) {
      throw new Error('Item not found in Minecraft system');
    }

    const inventoryItem = await this.inventoryRepository.findOne({
      where: { user: { id: userId }, itemId: itemData.itemId }
    });

    if (inventoryItem) {
      return await this.inventoryRepository.save({
        ...inventoryItem,
        quantity: itemData.quantity,
        metadata: { ...inventoryItem.metadata, ...itemData.metadata }
      });
    }

    return await this.inventoryRepository.save({
      user: { id: userId },
      itemId: itemData.itemId,
      itemName: minecraftItem.name,
      quantity: itemData.quantity,
      metadata: itemData.metadata
    });
  }

  async getUserInventory(userId: string) {
    return await this.inventoryRepository.find({
      where: { user: { id: userId } },
      relations: ['user']
    });
  }
}
