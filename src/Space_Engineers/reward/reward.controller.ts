import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { Controller, Get, Logger, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { RewardService } from './reward.service';

@Controller('space-engineers/reward')
export class RewardController {
    private readonly logger = new Logger(RewardController.name);
    RewardService: any;


  @Get()
  @UseGuards(JwtAuthGuard)
  async getItems(@Req() req) {
    const userId = req.user?.id;
    if (!userId) {
      this.logger.error(`Authorization header is missing or invalid.`);
      throw new UnauthorizedException('Authorization header is missing or invalid.');
    }
    this.logger.log(`User ID from request: ${userId}`);
    return this.RewardService.getRewards(userId);
  }
}
