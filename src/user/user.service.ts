import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@entities/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async updateOrCreateUser(steamid: string, nickname: string): Promise<void> {
    let user = await this.userRepository.findOne({ where: { steam_id: steamid } });

    if (!user) {
      this.logger.log(`User not found for steamid=${steamid}, creating new user...`);
      user = this.userRepository.create({ steam_id: steamid, username: nickname });
      await this.userRepository.save(user);
      this.logger.log(`New user created: ${JSON.stringify(user)}`);
    } else {
      this.logger.log(`User found for steamid=${steamid}, updating nickname...`);
      user.username = nickname;
      await this.userRepository.save(user);
      this.logger.log(`User updated: ${JSON.stringify(user)}`);
    }
  }

  async getRankings(): Promise<User[]> {
    this.logger.log('Fetching user rankings sorted by score...');
    return this.userRepository.find({
      order: { score: 'DESC' },
    });
  }
}
