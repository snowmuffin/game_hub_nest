import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { createuser } from '../../utils/createuser';

@Injectable()
export class DamageLogsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async processDamageLogs(logs: any[]): Promise<void> {
    for (const log of logs) {
      const { steam_id, damage,server_id } = log;

      if (!steam_id || damage == null) {
        console.error(`Invalid log entry: ${JSON.stringify(log)}`);
        continue; // Skip invalid entries
      }

      let user = await this.userRepository.findOne({ where: { steam_id } });

      if (!user) {
        console.log(`User not found for steam_id=${steam_id}, creating user...`);
        try {
          user = await createuser(
            { steam_id, username:'', email:'' },
            this.userRepository
          );
        } catch (error) {
          console.error(`Error creating user for steam_id=${steam_id}:`, error);
          continue; // Skip if user creation fails
        }
      }

      try {
        await this.userRepository.increment({ steam_id }, 'score', damage);
        console.log(`Updated score for steam_id=${steam_id} by ${damage}`);
      } catch (error) {
        console.error(`Error updating score for steam_id=${steam_id}:`, error);
      }
    }
  }
}
