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
   * 계정 연결 없이 플레이어 등록 (마인크래프트 서버에서 호출)
   */
  async registerPlayer(dto: RegisterPlayerDto) {
    this.logger.log(`플레이어 등록 요청: ${dto.minecraftUsername}, UUID: ${dto.minecraftUuid || 'N/A'}`);

    // 입력 검증
    if (!dto.minecraftUsername || dto.minecraftUsername.trim().length === 0) {
      throw new Error('마인크래프트 사용자명이 필요합니다.');
    }

    // 사용자명 길이 제한 (마인크래프트 기준)
    if (dto.minecraftUsername.length < 3 || dto.minecraftUsername.length > 16) {
      throw new Error('마인크래프트 사용자명은 3-16자여야 합니다.');
    }

    // 사용자명 형식 검증 (영문, 숫자, 언더스코어만 허용)
    if (!/^[a-zA-Z0-9_]+$/.test(dto.minecraftUsername)) {
      throw new Error('마인크래프트 사용자명은 영문, 숫자, 언더스코어만 사용 가능합니다.');
    }

    // 기존 플레이어 확인
    let existingPlayer = await this.playerRepository.findOne({
      where: { minecraftUsername: dto.minecraftUsername }
    });

    if (existingPlayer) {
      // 기존 플레이어가 있는 경우 UUID 업데이트
      if (dto.minecraftUuid && existingPlayer.minecraftUuid !== dto.minecraftUuid) {
        this.logger.log(`플레이어 UUID 업데이트: ${dto.minecraftUsername}, ${existingPlayer.minecraftUuid} -> ${dto.minecraftUuid}`);
        existingPlayer.minecraftUuid = dto.minecraftUuid;
        await this.playerRepository.save(existingPlayer);
      }

      this.logger.log(`기존 플레이어 반환: ${dto.minecraftUsername}`);
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
          updatedAt: existingPlayer.updatedAt
        },
        message: '기존 플레이어 정보를 반환합니다.'
      };
    }

    // UUID 중복 확인 (UUID가 제공된 경우)
    if (dto.minecraftUuid) {
      const existingUuid = await this.playerRepository.findOne({
        where: { minecraftUuid: dto.minecraftUuid }
      });

      if (existingUuid) {
        throw new ConflictException('해당 UUID는 이미 다른 플레이어가 사용 중입니다.');
      }
    }

    // 새 플레이어 생성
    const newPlayer = this.playerRepository.create({
      minecraftUsername: dto.minecraftUsername,
      minecraftUuid: dto.minecraftUuid,
      userId: null, // 아직 계정 연동 안됨
      isLinked: false
    });

    const savedPlayer = await this.playerRepository.save(newPlayer);
    this.logger.log(`새 플레이어 등록 완료: ${dto.minecraftUsername}, ID: ${savedPlayer.id}`);

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
        updatedAt: savedPlayer.updatedAt
      },
      message: '새 플레이어가 등록되었습니다. 웹사이트에서 계정을 연동할 수 있습니다.'
    };
  }

  /**
   * 플레이어 정보 조회
   */
  async getPlayerInfo(minecraftUsername: string) {
    const player = await this.playerRepository.findOne({
      where: { minecraftUsername }
    });

    if (!player) {
      return {
        success: false,
        message: '플레이어를 찾을 수 없습니다.'
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
        updatedAt: player.updatedAt
      }
    };
  }

  /**
   * 연동되지 않은 플레이어 목록 조회
   */
  async getUnlinkedPlayers() {
    const unlinkedPlayers = await this.playerRepository.find({
      where: { isLinked: false }
    });

    return {
      success: true,
      count: unlinkedPlayers.length,
      players: unlinkedPlayers.map(player => ({
        id: player.id,
        minecraftUsername: player.minecraftUsername,
        minecraftUuid: player.minecraftUuid,
        createdAt: player.createdAt
      }))
    };
  }

  /**
   * 플레이어 통계 조회
   */
  async getPlayerStats() {
    const totalPlayers = await this.playerRepository.count();
    const linkedPlayers = await this.playerRepository.count({
      where: { isLinked: true }
    });
    const unlinkedPlayers = totalPlayers - linkedPlayers;

    return {
      success: true,
      stats: {
        total: totalPlayers,
        linked: linkedPlayers,
        unlinked: unlinkedPlayers,
        linkRate: totalPlayers > 0 ? ((linkedPlayers / totalPlayers) * 100).toFixed(2) : '0.00'
      }
    };
  }

  /**
   * 연동되지 않은 플레이어용 임시 토큰 발급
   */
  async generatePlayerToken(minecraftUsername: string, minecraftUuid?: string) {
    this.logger.log(`플레이어 토큰 발급 요청: ${minecraftUsername}, UUID: ${minecraftUuid || 'N/A'}`);

    // 입력 검증
    if (!minecraftUsername || minecraftUsername.trim().length === 0) {
      throw new Error('마인크래프트 사용자명이 필요합니다.');
    }

    // 사용자명 길이 제한 (마인크래프트 기준)
    if (minecraftUsername.length < 3 || minecraftUsername.length > 16) {
      throw new Error('마인크래프트 사용자명은 3-16자여야 합니다.');
    }

    // 사용자명 형식 검증 (영문, 숫자, 언더스코어만 허용)
    if (!/^[a-zA-Z0-9_]+$/.test(minecraftUsername)) {
      throw new Error('마인크래프트 사용자명은 영문, 숫자, 언더스코어만 사용 가능합니다.');
    }

    // 플레이어 확인 또는 자동 등록
    let player = await this.playerRepository.findOne({
      where: { minecraftUsername }
    });

    if (!player) {
      // 플레이어가 없으면 자동 등록
      this.logger.log(`플레이어 자동 등록: ${minecraftUsername}`);
      const registrationResult = await this.registerPlayer({
        minecraftUsername,
        minecraftUuid
      });
      
      if (!registrationResult.success) {
        throw new Error('플레이어 등록에 실패했습니다.');
      }
      
      player = await this.playerRepository.findOne({
        where: { minecraftUsername }
      });
      
      if (!player) {
        throw new Error('플레이어 등록 후 조회에 실패했습니다.');
      }
    } else {
      // UUID 업데이트 (제공된 경우)
      if (minecraftUuid && player.minecraftUuid !== minecraftUuid) {
        this.logger.log(`플레이어 UUID 업데이트: ${minecraftUsername}, ${player.minecraftUuid} -> ${minecraftUuid}`);
        player.minecraftUuid = minecraftUuid;
        await this.playerRepository.save(player);
      }
    }

    // JWT 토큰 생성
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
      expiresIn: player.isLinked ? '24h' : '6h' // 연동된 플레이어는 24시간, 비연동은 6시간
    });

    this.logger.log(`플레이어 토큰 발급 완료: ${minecraftUsername}, 연동 상태: ${player.isLinked}`);

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
        userId: player.userId
      },
      message: player.isLinked 
        ? '연동된 플레이어 토큰이 발급되었습니다.' 
        : '임시 플레이어 토큰이 발급되었습니다. 계정을 연동하면 더 많은 기능을 사용할 수 있습니다.'
    };
  }
}
