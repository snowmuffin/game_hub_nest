import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MuffinCraftCurrency } from './entities/muffincraft-currency.entity';

@Injectable()
export class MuffinCraftService {
  constructor(
    @InjectRepository(MuffinCraftCurrency)
    private currencyRepository: Repository<MuffinCraftCurrency>,
  ) {}

  getStatus() {
    return {
      status: 'active',
      message: 'MuffinCraft service is running',
      timestamp: new Date().toISOString()
    };
  }

  async getUserCurrency(userId: string) {
    return await this.currencyRepository.find({
      where: { user: { id: parseInt(userId) } },
      relations: ['user']
    });
  }

  async updateUserCurrency(userId: string, currencyData: any) {
    const existingCurrency = await this.currencyRepository.findOne({
      where: { 
        user: { id: parseInt(userId) }, 
        currencyType: currencyData.currencyType 
      }
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
            reason: currencyData.reason || 'Manual update'
          }
        }
      });
    }

    return await this.currencyRepository.save({
      user: { id: parseInt(userId) } as any,
      amount: currencyData.amount,
      currencyType: currencyData.currencyType,
      transactionHistory: {
        [`${Date.now()}`]: {
          initialAmount: currencyData.amount,
          reason: 'Initial currency creation'
        }
      }
    });
  }
}
