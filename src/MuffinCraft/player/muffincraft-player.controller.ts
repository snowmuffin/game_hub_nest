import { Controller, Post, Get, Body, Param, Logger, BadRequestException } from '@nestjs/common';
import { MuffinCraftPlayerService, RegisterPlayerDto } from './muffincraft-player.service';

@Controller('muffincraft/player')
export class MuffinCraftPlayerController {
  private readonly logger = new Logger(MuffinCraftPlayerController.name);

  constructor(private readonly playerService: MuffinCraftPlayerService) {}

  /**
   * 마인크래프트 서버에서 호출하는 플레이어 등록 API (인증 불필요)
   * POST /muffincraft/player/register
   */
  @Post('register')
  async registerPlayer(@Body() dto: RegisterPlayerDto) {
    try {
      this.logger.log(`플레이어 등록 요청: ${dto.minecraftUsername}`);
      
      if (!dto.minecraftUsername) {
        throw new BadRequestException('마인크래프트 사용자명이 필요합니다.');
      }

      return await this.playerService.registerPlayer(dto);
    } catch (error) {
      this.logger.error(`플레이어 등록 실패: ${dto.minecraftUsername}, 오류: ${error.message}`);
      
      if (error instanceof BadRequestException) {
        throw error;
      }

      return {
        success: false,
        error: error.message || '플레이어 등록에 실패했습니다.'
      };
    }
  }

  /**
   * 플레이어 정보 조회 API (인증 불필요)
   * GET /muffincraft/player/info/:username
   */
  @Get('info/:username')
  async getPlayerInfo(@Param('username') username: string) {
    try {
      this.logger.log(`플레이어 정보 조회: ${username}`);
      return await this.playerService.getPlayerInfo(username);
    } catch (error) {
      this.logger.error(`플레이어 정보 조회 실패: ${username}, 오류: ${error.message}`);
      return {
        success: false,
        error: error.message || '플레이어 정보 조회에 실패했습니다.'
      };
    }
  }

  /**
   * 연동되지 않은 플레이어 목록 조회 API (관리용)
   * GET /muffincraft/player/unlinked
   */
  @Get('unlinked')
  async getUnlinkedPlayers() {
    try {
      this.logger.log('연동되지 않은 플레이어 목록 조회');
      return await this.playerService.getUnlinkedPlayers();
    } catch (error) {
      this.logger.error(`연동되지 않은 플레이어 목록 조회 실패: ${error.message}`);
      return {
        success: false,
        error: error.message || '플레이어 목록 조회에 실패했습니다.'
      };
    }
  }

  /**
   * 플레이어 통계 조회 API (관리용)
   * GET /muffincraft/player/stats
   */
  @Get('stats')
  async getPlayerStats() {
    try {
      this.logger.log('플레이어 통계 조회');
      return await this.playerService.getPlayerStats();
    } catch (error) {
      this.logger.error(`플레이어 통계 조회 실패: ${error.message}`);
      return {
        success: false,
        error: error.message || '플레이어 통계 조회에 실패했습니다.'
      };
    }
  }

  /**
   * 플레이어 온라인 상태 업데이트 API (마인크래프트 서버용)
   * POST /muffincraft/player/update-status
   */
  @Post('update-status')
  async updatePlayerStatus(@Body() body: { 
    minecraftUsername: string; 
    status: 'online' | 'offline';
    lastSeen?: Date;
    serverInfo?: any;
  }) {
    try {
      this.logger.log(`플레이어 상태 업데이트: ${body.minecraftUsername} - ${body.status}`);
      
      // 플레이어 정보 조회
      const playerInfo = await this.playerService.getPlayerInfo(body.minecraftUsername);
      
      if (!playerInfo.success) {
        // 플레이어가 없으면 자동 등록
        this.logger.log(`플레이어 자동 등록: ${body.minecraftUsername}`);
        await this.playerService.registerPlayer({
          minecraftUsername: body.minecraftUsername
        });
      }

      return {
        success: true,
        message: `플레이어 상태가 ${body.status}로 업데이트되었습니다.`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`플레이어 상태 업데이트 실패: ${body.minecraftUsername}, 오류: ${error.message}`);
      return {
        success: false,
        error: error.message || '플레이어 상태 업데이트에 실패했습니다.'
      };
    }
  }

  /**
   * 마인크래프트 플레이어 토큰 발급 API (연동 여부 무관)
   * POST /muffincraft/player/token
   */
  @Post('token')
  async generatePlayerToken(@Body() dto: { 
    minecraftUsername: string; 
    minecraftUuid?: string;
    serverInfo?: any;
  }) {
    try {
      this.logger.log(`플레이어 토큰 발급 요청: ${dto.minecraftUsername}`);
      
      if (!dto.minecraftUsername) {
        throw new BadRequestException('마인크래프트 사용자명이 필요합니다.');
      }

      return await this.playerService.generatePlayerToken(dto.minecraftUsername, dto.minecraftUuid);
    } catch (error) {
      this.logger.error(`플레이어 토큰 발급 실패: ${dto.minecraftUsername}, 오류: ${error.message}`);
      
      if (error instanceof BadRequestException) {
        throw error;
      }

      return {
        success: false,
        error: error.message || '플레이어 토큰 발급에 실패했습니다.'
      };
    }
  }
}
