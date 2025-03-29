import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketplaceItem } from './entities/marketplace-item.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class TradeService {
  constructor(
    @InjectRepository(MarketplaceItem)
    private readonly marketplaceItemRepository: Repository<MarketplaceItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getMarketplaceItems(myMarket: boolean, buyerSteamId: string) {
    const query = myMarket
      ? this.marketplaceItemRepository.createQueryBuilder('mi')
          .leftJoinAndSelect('mi.itemInfo', 'ii')
          .where('mi.sellerSteamId = :steamId', { steamId: buyerSteamId })
      : this.marketplaceItemRepository.createQueryBuilder('mi')
          .leftJoinAndSelect('mi.itemInfo', 'ii')
          .where('mi.sellerSteamId != :steamId', { steamId: buyerSteamId });

    return await query.getMany();
  }

  async purchaseItem(itemsToPurchase: any[], buyerSteamId: string) {
    // Implement purchase logic here
  }

  async registerItem(sellerSteamId: string, itemName: string, price: number, quantity: number) {
    // Implement item registration logic here
  }

  async cancelMarketplaceItem(sellerSteamId: string, itemId: number) {
    // Implement item cancellation logic here
  }
}