import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MuffinCraftCurrency } from './entities/muffincraft-currency.entity';
import { MuffinCraftPlayer } from './entities/muffincraft-player.entity';

@Injectable()
export class MuffinCraftService {
  private readonly logger = new Logger(MuffinCraftService.name);

  constructor(
    @InjectRepository(MuffinCraftCurrency)
    private currencyRepository: Repository<MuffinCraftCurrency>,
    @InjectRepository(MuffinCraftPlayer)
    private playerRepository: Repository<MuffinCraftPlayer>,
  ) {}

  getStatus() {
    return {
      status: 'active',
      message: 'MuffinCraft service is running',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 플레이어 정보 기반으로 통화 조회 (연동 여부 무관)
   */
  async getPlayerCurrency(user: any) {
    this.logger.log(`플레이어 통화 조회: ${JSON.stringify(user)}`);

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

    return await this.currencyRepository.find({
      where: { user: { id: targetUserId } },
      relations: ['user'],
    });
  }

  /**
   * 기존 getUserCurrency 메서드 (호환성 유지)
   */
  async getUserCurrency(userId: string) {
    return await this.currencyRepository.find({
      where: { user: { id: parseInt(userId) } },
      relations: ['user'],
    });
  }

  /**
   * 플레이어 정보 기반으로 통화 업데이트 (연동 여부 무관)
   */
  async updatePlayerCurrency(user: any, currencyData: any) {
    this.logger.log(
      `플레이어 통화 업데이트: ${JSON.stringify(user)}, 데이터: ${JSON.stringify(currencyData)}`,
    );

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

    const existingCurrency = await this.currencyRepository.findOne({
      where: {
        user: { id: targetUserId },
        currencyType: currencyData.currencyType,
      },
    });

    if (existingCurrency) {
      return await this.currencyRepository.save({
        ...existingCurrency,
        amount: currencyData.amount,
        transactionHistory: {
          ...existingCurrency.transactionHistory,
          [`${Date.now()}`]: {
            previousAmount: existingCurrency.amount,
            newAmount: currencyData.amount,
            reason: currencyData.reason || 'Manual update',
          },
        },
      });
    }

    return await this.currencyRepository.save({
      user: { id: targetUserId } as any,
      amount: currencyData.amount,
      currencyType: currencyData.currencyType,
      transactionHistory: {
        [`${Date.now()}`]: {
          initialAmount: currencyData.amount,
          reason: 'Initial currency creation',
        },
      },
    });
  }

  /**
   * 기존 updateUserCurrency 메서드 (호환성 유지)
   */
  async updateUserCurrency(userId: string, currencyData: any) {
    const existingCurrency = await this.currencyRepository.findOne({
      where: {
        user: { id: parseInt(userId) },
        currencyType: currencyData.currencyType,
      },
    });

    if (existingCurrency) {
      return await this.currencyRepository.save({
        ...existingCurrency,
        amount: currencyData.amount,
        transactionHistory: {
          ...existingCurrency.transactionHistory,
          [`${Date.now()}`]: {
            previousAmount: existingCurrency.amount,
            newAmount: currencyData.amount,
            reason: currencyData.reason || 'Manual update',
          },
        },
      });
    }

    return await this.currencyRepository.save({
      user: { id: parseInt(userId) } as any,
      amount: currencyData.amount,
      currencyType: currencyData.currencyType,
      transactionHistory: {
        [`${Date.now()}`]: {
          initialAmount: currencyData.amount,
          reason: 'Initial currency creation',
        },
      },
    });
  }
}
