import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { MuffinCraftAuthService } from './muffincraft-auth.service';

export interface GenerateAuthCodeDto {
  minecraftUsername: string;
  minecraftUuid?: string;
}

export interface LinkAccountDto {
  authCode: string;
}

interface AuthenticatedRequest {
  user: {
    id: number;
    [key: string]: any;
  };
}

@Controller('muffincraft/auth')
export class MuffinCraftAuthController {
  private readonly logger = new Logger(MuffinCraftAuthController.name);

  constructor(private readonly authService: MuffinCraftAuthService) {}

  /**
   * Authentication code generation API called from Minecraft server
   * POST /muffincraft/auth/generate-code
   */
  @Post('generate-code')
  async generateAuthCode(@Body() dto: GenerateAuthCodeDto) {
    // Input validation
    if (!dto.minecraftUsername || dto.minecraftUsername.trim().length === 0) {
      this.logger.warn('Auth code generation attempt - invalid username');
      throw new Error('Minecraft username is required.');
    }

    // Username length limit (Minecraft standard)
    if (dto.minecraftUsername.length < 3 || dto.minecraftUsername.length > 16) {
      this.logger.warn(
        `Auth code generation attempt - invalid username length: ${dto.minecraftUsername}`,
      );
      throw new Error('Minecraft username must be 3-16 characters long.');
    }

    // Username format validation (alphanumeric and underscore only)
    if (!/^[a-zA-Z0-9_]+$/.test(dto.minecraftUsername)) {
      this.logger.warn(
        `Auth code generation attempt - invalid username format: ${dto.minecraftUsername}`,
      );
      throw new Error(
        'Minecraft username can only contain alphanumeric characters and underscores.',
      );
    }

    this.logger.log(`Auth code generation request: ${dto.minecraftUsername}`);
    return await this.authService.generateAuthCode(
      dto.minecraftUsername,
      dto.minecraftUuid,
    );
  }

  /**
   * Account linking API called from web (JWT token required)
   * POST /muffincraft/auth/link-account
   */
  @UseGuards(JwtAuthGuard)
  @Post('link-account')
  async linkAccount(
    @Body() dto: LinkAccountDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    return await this.authService.linkAccount(dto.authCode, userId);
  }

  /**
   * Authentication code status check API
   * GET /muffincraft/auth/code/:authCode
   */
  @Get('code/:authCode')
  async getAuthCodeStatus(@Param('authCode') authCode: string) {
    return await this.authService.getAuthCodeStatus(authCode);
  }

  /**
   * Player information retrieval API
   * GET /muffincraft/auth/player/:username
   */
  @Get('player/:username')
  async getPlayerInfo(@Param('username') username: string) {
    return await this.authService.getPlayerInfo(username);
  }

  /**
   * Linked account unlinking API (JWT token required)
   * PUT /muffincraft/auth/unlink
   */
  @UseGuards(JwtAuthGuard)
  @Put('unlink')
  async unlinkAccount(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return await this.authService.unlinkAccount(userId);
  }
}
