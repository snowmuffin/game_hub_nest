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
      user = this.userRepository.create({
        steam_id: steamid,
        username: nickname,
        created_at: new Date(), // Set created_at to the current timestamp
        updated_at: new Date(), // Set updated_at to the current timestamp
      });
      await this.userRepository.save(user);
      this.logger.log(`New user created: ${JSON.stringify(user)}`);
    } else {
      this.logger.log(`User found for steamid=${steamid}, updating nickname...`);
      user.username = nickname;
      user.updated_at = new Date(); // Update the updated_at timestamp
      await this.userRepository.save(user);
      this.logger.log(`User updated: ${JSON.stringify(user)}`);
    }
    const userIdQuery = `
      SELECT id FROM spaceengineers.user WHERE steam_id = $1
    `;
    const userId = await this.userRepository.query(userIdQuery, [steamid]);
    const storageQuery = `
      SELECT id FROM spaceengineers.online_storage WHERE id = $1
    `;
    const storageResults = await this.userRepository.query(storageQuery, [
      userId,
    ]);
    if (storageResults.length === 0) {
      const insertStorageQuery = `
        INSERT INTO spaceengineers.online_storage (id) VALUES ($1) RETURNING id
      `;
      const newStorage = await this.userRepository.query(insertStorageQuery, [
        userId,
      ]);
      this.logger.log(`Created new storage for User ID=${userId}`);
      return ;
    }
  }

  async getRankings(): Promise<User[]> {
    this.logger.log('Fetching user rankings sorted by score...');
    return this.userRepository.find({
      order: { score: 'DESC' },
    });
  }
}
