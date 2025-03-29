import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnlineStorage } from '../entities/online-storage.entity'; // Adjust the import based on your entity structure
import { ItemsInfo } from '../entities/items-info.entity'; // Adjust the import based on your entity structure

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(OnlineStorage)
    private readonly onlineStorageRepository: Repository<OnlineStorage>,
    @InjectRepository(ItemsInfo)
    private readonly itemsInfoRepository: Repository<ItemsInfo>,
  ) {}

  async getResources(steamId: string) {
    const resources = await this.onlineStorageRepository.findOne({ where: { steamId } });
    if (!resources) {
      await this.onlineStorageRepository.save({ steamId });
      return { message: 'New row added successfully', items: [] };
    }
    return resources;
  }

  async downloadItem(steamId: string, itemName: string, quantity: number) {
    const storage = await this.onlineStorageRepository.findOne({ where: { steamId } });
    if (!storage || storage[itemName] < quantity) {
      throw new Error('Insufficient quantity or item not found');
    }
    storage[itemName] -= quantity;
    await this.onlineStorageRepository.save(storage);
    return { message: `${quantity}x '${itemName}' deducted from storage.` };
  }

  async uploadItem(steamId: string, itemName: string, quantity: number) {
    const storage = await this.onlineStorageRepository.findOne({ where: { steamId } });
    if (!storage) {
      throw new Error('Storage not found');
    }
    storage[itemName] = (storage[itemName] || 0) + quantity;
    await this.onlineStorageRepository.save(storage);
    return { message: `${quantity}x '${itemName}' added to storage.` };
  }
}