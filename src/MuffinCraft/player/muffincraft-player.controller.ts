import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  MuffinCraftPlayerService,
  RegisterPlayerDto,
} from './muffincraft-player.service';

@Controller('muffincraft/player')
export class MuffinCraftPlayerController {
  private readonly logger = new Logger(MuffinCraftPlayerController.name);

  constructor(private readonly playerService: MuffinCraftPlayerService) {}

  /**
   * Player registration API called from Minecraft server (no authentication required)
   * POST /muffincraft/player/register
   */
  @Post('register')
  async registerPlayer(@Body() dto: RegisterPlayerDto) {
    try {
      this.logger.log(`Player registration request: ${dto.minecraftUsername}`);

      if (!dto.minecraftUsername) {
        throw new BadRequestException('Minecraft username is required.');
      }

      return await this.playerService.registerPlayer(dto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Player registration failed: ${dto.minecraftUsername}, error: ${errorMessage}`,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      return {
        success: false,
        error: errorMessage || 'Failed to register player.',
      };
    }
  }

  /**
   * Player information retrieval API (no authentication required)
   * GET /muffincraft/player/info/:username
   */
  @Get('info/:username')
  async getPlayerInfo(@Param('username') username: string) {
    try {
      this.logger.log(`Player info request: ${username}`);
      return await this.playerService.getPlayerInfo(username);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Player info retrieval failed: ${username}, error: ${errorMessage}`,
      );
      return {
        success: false,
        error: errorMessage || 'Failed to retrieve player information.',
      };
    }
  }

  /**
   * Unlinked players list retrieval API (for administration)
   * GET /muffincraft/player/unlinked
   */
  @Get('unlinked')
  async getUnlinkedPlayers() {
    try {
      this.logger.log('Retrieving unlinked players list');
      return await this.playerService.getUnlinkedPlayers();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Unlinked players list retrieval failed: ${errorMessage}`,
      );
      return {
        success: false,
        error: errorMessage || 'Failed to retrieve players list.',
      };
    }
  }

  /**
   * Player statistics retrieval API (for administration)
   * GET /muffincraft/player/stats
   */
  @Get('stats')
  async getPlayerStats() {
    try {
      this.logger.log('Retrieving player statistics');
      return await this.playerService.getPlayerStats();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Player statistics retrieval failed: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage || 'Failed to retrieve player statistics.',
      };
    }
  }

  /**
   * Player online status update API (for Minecraft server)
   * POST /muffincraft/player/update-status
   */
  @Post('update-status')
  async updatePlayerStatus(
    @Body()
    body: {
      minecraftUsername: string;
      status: 'online' | 'offline';
      lastSeen?: Date;
      serverInfo?: any;
    },
  ) {
    try {
      this.logger.log(
        `Player status update: ${body.minecraftUsername} - ${body.status}`,
      );

      // Retrieve player information
      const playerInfo = await this.playerService.getPlayerInfo(
        body.minecraftUsername,
      );

      if (!playerInfo.success) {
        // Auto-register player if not found
        this.logger.log(`Auto-registering player: ${body.minecraftUsername}`);
        await this.playerService.registerPlayer({
          minecraftUsername: body.minecraftUsername,
        });
      }

      return {
        success: true,
        message: `Player status updated to ${body.status}.`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Player status update failed: ${body.minecraftUsername}, error: ${errorMessage}`,
      );
      return {
        success: false,
        error: errorMessage || 'Failed to update player status.',
      };
    }
  }

  /**
   * Minecraft player token generation API (regardless of account linking status)
   * POST /muffincraft/player/token
   */
  @Post('token')
  async generatePlayerToken(
    @Body()
    dto: {
      minecraftUsername: string;
      minecraftUuid?: string;
      serverInfo?: any;
    },
  ) {
    try {
      this.logger.log(
        `Player token generation request: ${dto.minecraftUsername}`,
      );

      if (!dto.minecraftUsername) {
        throw new BadRequestException('Minecraft username is required.');
      }

      return await this.playerService.generatePlayerToken(
        dto.minecraftUsername,
        dto.minecraftUuid,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Player token generation failed: ${dto.minecraftUsername}, error: ${errorMessage}`,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      return {
        success: false,
        error: errorMessage || 'Failed to generate player token.',
      };
    }
  }
}
