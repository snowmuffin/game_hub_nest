import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/shared/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async updateOrCreateUser(steamid: string, nickname: string): Promise<void> {
    let user = await this.userRepository.findOne({
      where: { steam_id: steamid },
    });

    if (!user) {
      this.logger.log(
        `User not found for steamid=${steamid}, creating new user...`,
      );
      user = this.userRepository.create({
        steam_id: steamid,
        username: nickname,
        created_at: new Date(), // Set created_at to the current timestamp
        updated_at: new Date(), // Set updated_at to the current timestamp
      });
      await this.userRepository.save(user);
      this.logger.log(`New user created: ${JSON.stringify(user)}`);
    } else {
      this.logger.log(
        `User found for steamid=${steamid}, updating nickname...`,
      );
      user.username = nickname;
      user.updated_at = new Date(); // Update the updated_at timestamp
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

  /**
   * Steam ID로 사용자 조회
   */
  async findBySteamId(steamId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { steam_id: steamId } });
  }

  /**
   * 테스트 사용자 생성
   */
  async createTestUser(steamId: string, username: string): Promise<User> {
    this.logger.log(
      `Creating test user: steamId=${steamId}, username=${username}`,
    );

    const testUser = this.userRepository.create({
      steam_id: steamId,
      username: username,
      email: `${username.toLowerCase()}@test.com`,
      score: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const savedUser = await this.userRepository.save(testUser);
    this.logger.log(`Test user created: ${JSON.stringify(savedUser)}`);

    return savedUser;
  }

  /**
   * Delete test user (steam_id가 'test_'로 시작하는 사용자들)
   */
  async cleanupTestUsers(): Promise<void> {
    this.logger.log('Cleaning up test users...');

    const testUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.steam_id LIKE :pattern', { pattern: 'test_%' })
      .getMany();

    if (testUsers.length > 0) {
      await this.userRepository.remove(testUsers);
      this.logger.log(`Cleaned up ${testUsers.length} test users`);
    } else {
      this.logger.log('No test users to clean up');
    }
  }
}
