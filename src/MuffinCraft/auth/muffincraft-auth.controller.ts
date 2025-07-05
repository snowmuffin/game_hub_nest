import { Controller, Post, Body, Get, Param, Put, UseGuards, Req, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(MuffinCraftAuthController.name);
  
  constructor(private readonly authService: MuffinCraftAuthService) {}

  /**
   * 마인크래프트 서버에서 호출하는 인증 코드 생성 API
   * POST /muffincraft/auth/generate-code
   */
  @Post('generate-code')
  async generateAuthCode(@Body() dto: GenerateAuthCodeDto) {
    // 입력 검증
    if (!dto.minecraftUsername || dto.minecraftUsername.trim().length === 0) {
      this.logger.warn('인증 코드 생성 시도 - 잘못된 사용자명');
      throw new Error('마인크래프트 사용자명이 필요합니다.');
    }

    // 사용자명 길이 제한 (마인크래프트 기준)
    if (dto.minecraftUsername.length < 3 || dto.minecraftUsername.length > 16) {
      this.logger.warn(`인증 코드 생성 시도 - 잘못된 사용자명 길이: ${dto.minecraftUsername}`);
      throw new Error('마인크래프트 사용자명은 3-16자여야 합니다.');
    }

    // 사용자명 형식 검증 (영문, 숫자, 언더스코어만 허용)
    if (!/^[a-zA-Z0-9_]+$/.test(dto.minecraftUsername)) {
      this.logger.warn(`인증 코드 생성 시도 - 잘못된 사용자명 형식: ${dto.minecraftUsername}`);
      throw new Error('마인크래프트 사용자명은 영문, 숫자, 언더스코어만 사용 가능합니다.');
    }

    this.logger.log(`인증 코드 생성 요청: ${dto.minecraftUsername}`);
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
