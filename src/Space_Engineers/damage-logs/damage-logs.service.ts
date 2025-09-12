import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/shared/user.entity';
import { createuser } from '../../utils/createuser';
import {
  SPACE_ENGINEERS_CONFIG,
  SpaceEngineersConfig,
} from '../space-engineers.config';

@Injectable()
export class DamageLogsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(SPACE_ENGINEERS_CONFIG)
    private readonly seConfig: SpaceEngineersConfig,
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
    // Example: resolve server settings (default or per-log in future)
    const defaultServer = this.seConfig.get();
    void defaultServer; // currently unused but ensures provider is wired and ready
    for (const raw of logs) {
      // Explicit server_id presence check (fail fast if missing or invalid)
      const candidate = raw as Record<string, unknown> | null;
      const candidateServerId = candidate?.['server_id'];
      if (
        typeof candidateServerId !== 'number' ||
        Number.isNaN(candidateServerId)
      ) {
        console.error(
          `Missing or invalid server_id on damage log, skipping: ${JSON.stringify(raw)}`,
        );
        continue;
      }

      if (!this.isValidDamageLog(raw)) {
        console.error(
          `Invalid log entry (shape mismatch): ${JSON.stringify(raw)}`,
        );
        continue;
      }

      const { steam_id, damage } = raw; // server_id validated above

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
        //await this.userRepository.increment({ steam_id }, 'score', damage);
      } catch (error) {
        console.error(`Error updating score for steam_id=${steam_id}:`, error);
      }
    }
  }
}
