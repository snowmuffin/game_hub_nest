import { Controller, Post, Body, Get, Param, Put, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { MuffinCraftAuthService } from './muffincraft-auth.service';

export interface GenerateAuthCodeDto {
  minecraftUsername: string;
  minecraftUuid?: string;
}

export interface LinkAccountDto {
  authCode: string;
}

@Controller('muffincraft/auth')
export class MuffinCraftAuthController {
  constructor(private readonly authService: MuffinCraftAuthService) {}

  /**
   * 마인크래프트 서버에서 호출하는 인증 코드 생성 API
   * POST /muffincraft/auth/generate-code
   */
  @Post('generate-code')
  async generateAuthCode(@Body() dto: GenerateAuthCodeDto) {
    return await this.authService.generateAuthCode(dto.minecraftUsername, dto.minecraftUuid);
  }

  /**
   * 웹에서 호출하는 계정 연동 API (JWT 토큰 필요)
   * POST /muffincraft/auth/link-account
   */
  @UseGuards(JwtAuthGuard)
  @Post('link-account')
  async linkAccount(@Body() dto: LinkAccountDto, @Req() req: any) {
    const userId = req.user.id;
    return await this.authService.linkAccount(dto.authCode, userId);
  }

  /**
   * 인증 코드 상태 확인 API
   * GET /muffincraft/auth/code/:authCode
   */
  @Get('code/:authCode')
  async getAuthCodeStatus(@Param('authCode') authCode: string) {
    return await this.authService.getAuthCodeStatus(authCode);
  }

  /**
   * 플레이어 정보 조회 API
   * GET /muffincraft/auth/player/:username
   */
  @Get('player/:username')
  async getPlayerInfo(@Param('username') username: string) {
    return await this.authService.getPlayerInfo(username);
  }

  /**
   * 연동된 계정 해제 API (JWT 토큰 필요)
   * PUT /muffincraft/auth/unlink
   */
  @UseGuards(JwtAuthGuard)
  @Put('unlink')
  async unlinkAccount(@Req() req: any) {
    const userId = req.user.id;
    return await this.authService.unlinkAccount(userId);
  }
}
