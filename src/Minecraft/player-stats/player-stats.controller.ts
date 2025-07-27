import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PlayerStatsService } from './player-stats.service';

@Controller('api/minecraft/player-stats')
@UseGuards(JwtAuthGuard)
export class PlayerStatsController {
  private readonly logger = new Logger(PlayerStatsController.name);

  constructor(private readonly playerStatsService: PlayerStatsService) {}

  @Get()
  async getPlayerStats(@Request() req) {
    const userId = req.user.id;
    this.logger.log(`Getting player stats for User ID: ${userId}`);
    return this.playerStatsService.getPlayerStats(userId);
  }

  @Post('update')
  async updatePlayerStats(
    @Request() req,
    @Body() body: { minecraftUuid: string; stats: any },
  ) {
    const userId = req.user.id;
    return this.playerStatsService.updatePlayerStats(
      userId,
      body.minecraftUuid,
      body.stats,
    );
  }

  @Get('leaderboard/:stat')
  async getLeaderboard(@Param('stat') stat: string) {
    return this.playerStatsService.getLeaderboard(stat);
  }

  @Get('achievements')
  async getAchievements(@Request() req) {
    const userId = req.user.id;
    return this.playerStatsService.getAchievements(userId);
  }
}
