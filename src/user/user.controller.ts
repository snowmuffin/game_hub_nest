import { Controller, Post, Body, Logger, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/entities/shared/user.entity';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Post('updateuserdb')
  async updateUserDb(
    @Body() body: { steamid: string; nickname: string },
  ): Promise<string> {
    this.logger.log(`[HTTP] Body: ${JSON.stringify(body)}`);
    const { steamid, nickname } = body;

    if (!steamid || !nickname) {
      this.logger.error('Invalid request body: Missing steamid or nickname');
      return 'Invalid request body';
    }

    await this.userService.updateOrCreateUser(steamid, nickname);
    return 'User database updated successfully';
  }

  @Get('rankings')
  async getRankings(): Promise<User[]> {
    this.logger.log('[HTTP] Fetching user rankings...');
    return this.userService.getRankings();
  }
}
