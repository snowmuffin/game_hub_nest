import {
  Controller,
  Post,
  Body,
  Logger,
  Get,
  Options,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/entities/shared/user.entity';
import { Response } from 'express';

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

  @Options('rankings')
  rankingsOptions(@Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL;
    res.header('Access-Control-Allow-Origin', frontendUrl);
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Accept, Accept-Language, Content-Language, Content-Type, Authorization, Cookie, X-Requested-With',
    );
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(HttpStatus.OK).send();
  }

  @Get('rankings')
  async getRankings(): Promise<User[]> {
    this.logger.log('[HTTP] Fetching user rankings...');
    return this.userService.getRankings();
  }
}
