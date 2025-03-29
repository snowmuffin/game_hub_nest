import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUserProfile(steamId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { steamId } });
    if (!user) {
      throw new Error(`User with steamId ${steamId} not found`);
    }
    return user;
  }

  async updateUserProfile(steamId: string, nickname: string): Promise<User> {
    await this.userRepository.update({ steamId }, { nickname });
    return this.getUserProfile(steamId);
  }

  async createUser(steamId: string, nickname: string): Promise<User> {
    const user = this.userRepository.create({ steamId, nickname });
    return await this.userRepository.save(user);
  }
}