import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../entities/game.entity';
import { GameServer } from '../entities/game-server.entity';
import { Currency } from '../entities/currency.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @InjectRepository(GameServer)
    private serverRepository: Repository<GameServer>,
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,
  ) {}

  // 모든 활성 게임 조회
  async getAllGames(): Promise<Game[]> {
    return await this.gameRepository.find({
      where: { is_active: true },
      relations: ['servers', 'currencies'],
      order: { name: 'ASC' },
    });
  }

  // 특정 게임 조회
  async getGameById(id: number): Promise<Game | null> {
    return await this.gameRepository.findOne({
      where: { id, is_active: true },
      relations: ['servers', 'currencies'],
    });
  }

  // 게임 코드로 조회
  async getGameByCode(code: string): Promise<Game | null> {
    return await this.gameRepository.findOne({
      where: { code, is_active: true },
      relations: ['servers', 'currencies'],
    });
  }

  // 게임의 서버들 조회
  async getGameServers(gameId: number): Promise<GameServer[]> {
    return await this.serverRepository.find({
      where: { game_id: gameId, is_active: true },
      relations: ['game'],
      order: { name: 'ASC' },
    });
  }

  // 특정 서버 조회
  async getServerById(id: number): Promise<GameServer | null> {
    return await this.serverRepository.findOne({
      where: { id, is_active: true },
      relations: ['game'],
    });
  }

  // 게임의 화폐들 조회
  async getGameCurrencies(gameId: number): Promise<Currency[]> {
    return await this.currencyRepository.find({
      where: { game_id: gameId, is_active: true },
      relations: ['game'],
      order: { name: 'ASC' },
    });
  }

  // 모든 화폐 조회 (글로벌 + 게임별)
  async getAllCurrencies(): Promise<Currency[]> {
    return await this.currencyRepository.find({
      where: { is_active: true },
      relations: ['game'],
      order: { type: 'ASC', name: 'ASC' },
    });
  }

  // 글로벌 화폐들만 조회
  async getGlobalCurrencies(): Promise<Currency[]> {
    return await this.currencyRepository.find({
      where: { type: 'GLOBAL', is_active: true },
      order: { name: 'ASC' },
    });
  }
}
