import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DamageLog } from './damage-log.entity';
import { UserData } from '../user/user-data.entity';
import { getDrop } from '../utils/dropUtils';

@Injectable()
export class DamageService {
  constructor(
    @InjectRepository(DamageLog)
    private damageLogRepository: Repository<DamageLog>,
    @InjectRepository(UserData)
    private userDataRepository: Repository<UserData>,
  ) {}

  async postDamageLogs(damageLogs: any[]): Promise<void> {
    if (!Array.isArray(damageLogs) || damageLogs.length === 0) {
      throw new Error('Invalid data');
    }

    await Promise.all(damageLogs.map(async (log) => {
      const { steam_id, damage, server_id } = log;

      if (!steam_id || damage === undefined) {
        return;
      }

      const steamId = steam_id.toString();
      const maxRarity = this.getMaxRarity(server_id);
      const mult = this.getMultiplier(server_id);
      const droppedItem = getDrop(damage, mult, maxRarity);

      const sekCoinToAdd = damage * mult;

      await this.damageLogRepository.save({
        steamId,
        damage,
        sekCoin: sekCoinToAdd,
      });

      if (droppedItem) {
        await this.updateOnlineStorage(steamId, droppedItem);
      }
    }));
  }

  private getMaxRarity(serverId: string): number {
    switch (serverId) {
      case 'S': return 21;
      case 'A': return 17;
      case 'B': return 14;
      case 'C': return 10;
      default: return 4;
    }
  }

  private getMultiplier(serverId: string): number {
    switch (serverId) {
      case 'S': return 0.8;
      case 'A': return 0.7;
      case 'B': return 0.5;
      case 'C': return 0.4;
      default: return 1;
    }
  }

  private async updateOnlineStorage(steamId: string, droppedItem: string): Promise<void> {
    // Logic to update online storage with the dropped item
  }
}