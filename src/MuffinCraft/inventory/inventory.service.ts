import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MuffinCraftInventory } from '../entities/muffincraft-inventory.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(MuffinCraftInventory)
    private inventoryRepository: Repository<MuffinCraftInventory>,
  ) {}

  async syncInventory(userId: string, itemData: any) {
    // For now, we'll validate the item exists in some way
    // You might want to implement a proper item validation service later
    
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

  async getUserInventory(userId: string) {
    return await this.inventoryRepository.find({
      where: { user: { id: parseInt(userId) } },
      relations: ['user']
    });
  }
}
