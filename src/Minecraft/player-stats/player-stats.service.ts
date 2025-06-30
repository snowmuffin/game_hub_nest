import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';

@Injectable()
export class PlayerStatsService {
  private readonly logger = new Logger(PlayerStatsService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getPlayerStats(userId: string): Promise<any> {
    this.logger.log(`Fetching player stats for User ID: ${userId}`);

    const statsQuery = `
      SELECT * FROM minecraft.player_stats WHERE user_id = $1
    `;
    const stats = await this.userRepository.query(statsQuery, [userId]);

    if (stats.length === 0) {
      return this.createDefaultStats(userId);
    }

    return stats[0];
  }

  async updatePlayerStats(userId: string, minecraftUuid: string, stats: any): Promise<any> {
    this.logger.log(`Updating player stats for User ID: ${userId}, Minecraft UUID: ${minecraftUuid}`);

    // Create table if not exists
    try {
      await this.userRepository.query(`
        CREATE TABLE IF NOT EXISTS minecraft.player_stats (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          minecraft_uuid TEXT NOT NULL,
          play_time_minutes INTEGER DEFAULT 0,
          blocks_broken INTEGER DEFAULT 0,
          blocks_placed INTEGER DEFAULT 0,
          items_crafted INTEGER DEFAULT 0,
          mobs_killed INTEGER DEFAULT 0,
          deaths INTEGER DEFAULT 0,
          distance_walked INTEGER DEFAULT 0,
          distance_flown INTEGER DEFAULT 0,
          distance_swum INTEGER DEFAULT 0,
          level INTEGER DEFAULT 0,
          experience INTEGER DEFAULT 0,
          food_level INTEGER DEFAULT 20,
          health DECIMAL(5,2) DEFAULT 20.0,
          last_login TIMESTAMP,
          last_logout TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          UNIQUE(user_id, minecraft_uuid)
        )
      `);
    } catch (e) {
      this.logger.error(`Failed to create 'player_stats' table: ${e.message}`);
    }

    const updateQuery = `
      INSERT INTO minecraft.player_stats (
        user_id, minecraft_uuid, play_time_minutes, blocks_broken, blocks_placed,
        items_crafted, mobs_killed, deaths, distance_walked, distance_flown,
        distance_swum, level, experience, food_level, health, last_login,
        last_logout, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
      ON CONFLICT (user_id, minecraft_uuid)
      DO UPDATE SET
        play_time_minutes = EXCLUDED.play_time_minutes,
        blocks_broken = EXCLUDED.blocks_broken,
        blocks_placed = EXCLUDED.blocks_placed,
        items_crafted = EXCLUDED.items_crafted,
        mobs_killed = EXCLUDED.mobs_killed,
        deaths = EXCLUDED.deaths,
        distance_walked = EXCLUDED.distance_walked,
        distance_flown = EXCLUDED.distance_flown,
        distance_swum = EXCLUDED.distance_swum,
        level = EXCLUDED.level,
        experience = EXCLUDED.experience,
        food_level = EXCLUDED.food_level,
        health = EXCLUDED.health,
        last_login = EXCLUDED.last_login,
        last_logout = EXCLUDED.last_logout,
        updated_at = NOW()
      RETURNING *
    `;

    const values = [
      userId,
      minecraftUuid,
      stats.playTimeMinutes || 0,
      stats.blocksBroken || 0,
      stats.blocksPlaced || 0,
      stats.itemsCrafted || 0,
      stats.mobsKilled || 0,
      stats.deaths || 0,
      stats.distanceWalked || 0,
      stats.distanceFlown || 0,
      stats.distanceSwum || 0,
      stats.level || 0,
      stats.experience || 0,
      stats.foodLevel || 20,
      stats.health || 20.0,
      stats.lastLogin || null,
      stats.lastLogout || null,
    ];

    const result = await this.userRepository.query(updateQuery, values);
    return result[0];
  }

  async getLeaderboard(stat: string, limit: number = 10): Promise<any> {
    const validStats = [
      'play_time_minutes', 'blocks_broken', 'blocks_placed', 'items_crafted',
      'mobs_killed', 'distance_walked', 'level', 'experience'
    ];

    if (!validStats.includes(stat)) {
      throw new Error(`Invalid stat: ${stat}`);
    }

    const leaderboardQuery = `
      SELECT 
        ps.minecraft_uuid,
        ps.${stat} as value,
        u.username,
        ps.updated_at
      FROM minecraft.player_stats ps
      LEFT JOIN users u ON ps.user_id = u.id
      WHERE ps.${stat} > 0
      ORDER BY ps.${stat} DESC
      LIMIT $1
    `;

    return await this.userRepository.query(leaderboardQuery, [limit]);
  }

  async getAchievements(userId: string): Promise<any> {
    this.logger.log(`Fetching achievements for User ID: ${userId}`);

    try {
      await this.userRepository.query(`
        CREATE TABLE IF NOT EXISTS minecraft.player_achievements (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          achievement_id TEXT NOT NULL,
          achievement_name TEXT NOT NULL,
          description TEXT,
          unlocked_at TIMESTAMP NOT NULL DEFAULT NOW(),
          UNIQUE(user_id, achievement_id)
        )
      `);
    } catch (e) {
      this.logger.error(`Failed to create 'player_achievements' table: ${e.message}`);
    }

    const achievementsQuery = `
      SELECT * FROM minecraft.player_achievements WHERE user_id = $1 ORDER BY unlocked_at DESC
    `;

    return await this.userRepository.query(achievementsQuery, [userId]);
  }

  private async createDefaultStats(userId: string): Promise<any> {
    const defaultStats = {
      user_id: userId,
      minecraft_uuid: null,
      play_time_minutes: 0,
      blocks_broken: 0,
      blocks_placed: 0,
      items_crafted: 0,
      mobs_killed: 0,
      deaths: 0,
      distance_walked: 0,
      distance_flown: 0,
      distance_swum: 0,
      level: 0,
      experience: 0,
      food_level: 20,
      health: 20.0,
      last_login: null,
      last_logout: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    return defaultStats;
  }
}
