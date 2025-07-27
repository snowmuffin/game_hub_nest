import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { MuffinCraftPlayer } from '../entities/muffincraft-player.entity';

export interface RegisterPlayerDto {
  minecraftUsername: string;
  minecraftUuid?: string;
  serverInfo?: {
    serverName?: string;
    version?: string;
    firstJoin?: Date;
  };
}

@Injectable()
export class MuffinCraftPlayerService {
  private readonly logger = new Logger(MuffinCraftPlayerService.name);

  constructor(
    @InjectRepository(MuffinCraftPlayer)
    private readonly playerRepository: Repository<MuffinCraftPlayer>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register player without account linking (called from Minecraft server)
   */
  async registerPlayer(dto: RegisterPlayerDto) {
    this.logger.log(
      `Player registration request: ${dto.minecraftUsername}, UUID: ${dto.minecraftUuid || 'N/A'}`,
    );

    // Input validation
    if (!dto.minecraftUsername || dto.minecraftUsername.trim().length === 0) {
      throw new Error('Minecraft username is required.');
    }

    // Username length limit (Minecraft standard)
    if (dto.minecraftUsername.length < 3 || dto.minecraftUsername.length > 16) {
      throw new Error('Minecraft username must be 3-16 characters long.');
    }

    // Username format validation (alphanumeric and underscore only)
    if (!/^[a-zA-Z0-9_]+$/.test(dto.minecraftUsername)) {
      throw new Error(
        'Minecraft username can only contain alphanumeric characters and underscores.',
      );
    }

    // Check existing player
    const existingPlayer = await this.playerRepository.findOne({
      where: { minecraftUsername: dto.minecraftUsername },
    });

    if (existingPlayer) {
      // Update UUID if existing player found
      if (
        dto.minecraftUuid &&
        existingPlayer.minecraftUuid !== dto.minecraftUuid
      ) {
        this.logger.log(
          `Player UUID update: ${dto.minecraftUsername}, ${existingPlayer.minecraftUuid} -> ${dto.minecraftUuid}`,
        );
        existingPlayer.minecraftUuid = dto.minecraftUuid;
        await this.playerRepository.save(existingPlayer);
      }

      this.logger.log(`Returning existing player: ${dto.minecraftUsername}`);
      return {
        success: true,
        isNew: false,
        player: {
          id: existingPlayer.id,
          minecraftUsername: existingPlayer.minecraftUsername,
          minecraftUuid: existingPlayer.minecraftUuid,
          isLinked: existingPlayer.isLinked,
          userId: existingPlayer.userId,
          createdAt: existingPlayer.createdAt,
          updatedAt: existingPlayer.updatedAt,
        },
        message: 'Returning existing player information.',
      };
    }

    // Check UUID duplication (if UUID is provided)
    if (dto.minecraftUuid) {
      const existingUuid = await this.playerRepository.findOne({
        where: { minecraftUuid: dto.minecraftUuid },
      });

      if (existingUuid) {
        throw new ConflictException(
          'This UUID is already being used by another player.',
        );
      }
    }

    // Create new player
    const newPlayer = this.playerRepository.create({
      minecraftUsername: dto.minecraftUsername,
      minecraftUuid: dto.minecraftUuid,
      userId: null, // Account not linked yet
      isLinked: false,
    });

    const savedPlayer = await this.playerRepository.save(newPlayer);
    this.logger.log(
      `New player registration completed: ${dto.minecraftUsername}, ID: ${savedPlayer.id}`,
    );

    return {
      success: true,
      isNew: true,
      player: {
        id: savedPlayer.id,
        minecraftUsername: savedPlayer.minecraftUsername,
        minecraftUuid: savedPlayer.minecraftUuid,
        isLinked: savedPlayer.isLinked,
        userId: savedPlayer.userId,
        createdAt: savedPlayer.createdAt,
        updatedAt: savedPlayer.updatedAt,
      },
      message:
        'New player has been registered. You can link your account on the website.',
    };
  }

  /**
   * Retrieve player information
   */
  async getPlayerInfo(minecraftUsername: string) {
    const player = await this.playerRepository.findOne({
      where: { minecraftUsername },
    });

    if (!player) {
      return {
        success: false,
        message: 'Player not found.',
      };
    }

    return {
      success: true,
      player: {
        id: player.id,
        minecraftUsername: player.minecraftUsername,
        minecraftUuid: player.minecraftUuid,
        isLinked: player.isLinked,
        userId: player.userId,
        createdAt: player.createdAt,
        updatedAt: player.updatedAt,
      },
    };
  }

  /**
   * Retrieve unlinked players list
   */
  async getUnlinkedPlayers() {
    const unlinkedPlayers = await this.playerRepository.find({
      where: { isLinked: false },
    });

    return {
      success: true,
      count: unlinkedPlayers.length,
      players: unlinkedPlayers.map((player) => ({
        id: player.id,
        minecraftUsername: player.minecraftUsername,
        minecraftUuid: player.minecraftUuid,
        createdAt: player.createdAt,
      })),
    };
  }

  /**
   * Retrieve player statistics
   */
  async getPlayerStats() {
    const totalPlayers = await this.playerRepository.count();
    const linkedPlayers = await this.playerRepository.count({
      where: { isLinked: true },
    });
    const unlinkedPlayers = totalPlayers - linkedPlayers;

    return {
      success: true,
      stats: {
        total: totalPlayers,
        linked: linkedPlayers,
        unlinked: unlinkedPlayers,
        linkRate:
          totalPlayers > 0
            ? ((linkedPlayers / totalPlayers) * 100).toFixed(2)
            : '0.00',
      },
    };
  }

  /**
   * Generate temporary token for unlinked players
   */
  async generatePlayerToken(minecraftUsername: string, minecraftUuid?: string) {
    this.logger.log(
      `Player token generation request: ${minecraftUsername}, UUID: ${minecraftUuid || 'N/A'}`,
    );

    // Input validation
    if (!minecraftUsername || minecraftUsername.trim().length === 0) {
      throw new Error('Minecraft username is required.');
    }

    // Username length limit (Minecraft standard)
    if (minecraftUsername.length < 3 || minecraftUsername.length > 16) {
      throw new Error('Minecraft username must be 3-16 characters long.');
    }

    // Username format validation (alphanumeric and underscore only)
    if (!/^[a-zA-Z0-9_]+$/.test(minecraftUsername)) {
      throw new Error(
        'Minecraft username can only contain alphanumeric characters and underscores.',
      );
    }

    // Check player or auto-register
    let player = await this.playerRepository.findOne({
      where: { minecraftUsername },
    });

    if (!player) {
      // Auto-register player if not found
      this.logger.log(`Auto-registering player: ${minecraftUsername}`);
      const registrationResult = await this.registerPlayer({
        minecraftUsername,
        minecraftUuid,
      });

      if (!registrationResult.success) {
        throw new Error('Failed to register player.');
      }

      player = await this.playerRepository.findOne({
        where: { minecraftUsername },
      });

      if (!player) {
        throw new Error('Failed to retrieve player after registration.');
      }
    } else {
      // Update UUID (if provided)
      if (minecraftUuid && player.minecraftUuid !== minecraftUuid) {
        this.logger.log(
          `Player UUID update: ${minecraftUsername}, ${player.minecraftUuid} -> ${minecraftUuid}`,
        );
        player.minecraftUuid = minecraftUuid;
        await this.playerRepository.save(player);
      }
    }

    // Generate JWT token
    const payload = {
      type: 'minecraft_player',
      playerId: player.id,
      minecraftUsername: player.minecraftUsername,
      minecraftUuid: player.minecraftUuid,
      isLinked: player.isLinked,
      userId: player.userId,
      sub: player.isLinked ? player.userId : `minecraft_${player.id}`,
      iat: Math.floor(Date.now() / 1000),
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: player.isLinked ? '24h' : '6h', // 24 hours for linked players, 6 hours for unlinked
    });

    this.logger.log(
      `Player token generation completed: ${minecraftUsername}, linking status: ${player.isLinked}`,
    );

    return {
      success: true,
      token,
      tokenType: 'Bearer',
      expiresIn: player.isLinked ? '24h' : '6h',
      player: {
        id: player.id,
        minecraftUsername: player.minecraftUsername,
        minecraftUuid: player.minecraftUuid,
        isLinked: player.isLinked,
        userId: player.userId,
      },
      message: player.isLinked
        ? 'Linked player token has been issued.'
        : 'Temporary player token has been issued. You can access more features by linking your account.',
    };
  }
}
