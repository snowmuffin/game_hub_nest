import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/shared/user.entity';
import { createuser } from '../../utils/createuser';

@Injectable()
export class DamageLogsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Expected shape for a damage log entry.
   */
  private isValidDamageLog(entry: unknown): entry is {
    steam_id: string;
    damage: number;
    server_id: number;
  } {
    if (typeof entry !== 'object' || entry === null) return false;
    const e = entry as Record<string, unknown>;
    return (
      typeof e.steam_id === 'string' &&
      typeof e.damage === 'number' &&
      !Number.isNaN(e.damage) &&
      typeof e.server_id === 'number'
    );
  }

  async processDamageLogs(logs: unknown[]): Promise<void> {
    for (const raw of logs) {
      if (!this.isValidDamageLog(raw)) {
        console.error(`Invalid log entry: ${JSON.stringify(raw)}`);
        continue;
      }

      const { steam_id, damage /* server_id */ } = raw; // server_id reserved for future multi-server logic

      // Basic sanity check (damage should be finite & non-negative)
      if (!Number.isFinite(damage) || damage < 0) {
        console.error(`Skipping log with invalid damage value: ${damage}`);
        continue;
      }

      let user = await this.userRepository.findOne({ where: { steam_id } });

      if (!user) {
        console.log(
          `User not found for steam_id=${steam_id}, creating user...`,
        );
        try {
          // Provide a fallback username/email so createuser validation passes
          user = await createuser(
            {
              steam_id,
              username: `steam_${steam_id}`.slice(0, 100),
              email: `${steam_id}@placeholder.local`,
            },
            this.userRepository,
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
