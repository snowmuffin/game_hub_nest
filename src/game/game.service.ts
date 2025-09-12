import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../entities/shared/game.entity';
import { GameServer } from '../entities/shared/game-server.entity';
import { Currency } from '../entities/shared/currency.entity';

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

  // Get all active games
  async getAllGames(): Promise<Game[]> {
    return await this.gameRepository.find({
      where: { is_active: true },
      relations: ['servers', 'currencies'],
      order: { name: 'ASC' },
    });
  }

  // Get a specific game by ID
  async getGameById(id: number): Promise<Game | null> {
    return await this.gameRepository.findOne({
      where: { id, is_active: true },
      relations: ['servers', 'currencies'],
    });
  }

  // Get a game by code
  async getGameByCode(code: string): Promise<Game | null> {
    return await this.gameRepository.findOne({
      where: { code, is_active: true },
      relations: ['servers', 'currencies'],
    });
  }

  // Get servers for a game
  async getGameServers(gameId: number): Promise<GameServer[]> {
    return await this.serverRepository.find({
      where: { game_id: gameId, is_active: true },
      relations: ['game'],
      order: { name: 'ASC' },
    });
  }

  // Get a specific server by ID
  async getServerById(id: number): Promise<GameServer | null> {
    return await this.serverRepository.findOne({
      where: { id, is_active: true },
      relations: ['game'],
    });
  }

  // Get currencies for a game
  async getGameCurrencies(gameId: number): Promise<Currency[]> {
    return await this.currencyRepository.find({
      where: { game_id: gameId, is_active: true },
      relations: ['game'],
      order: { name: 'ASC' },
    });
  }

  // Get all currencies (global + per game)
  async getAllCurrencies(): Promise<Currency[]> {
    return await this.currencyRepository.find({
      where: { is_active: true },
      relations: ['game'],
      order: { type: 'ASC', name: 'ASC' },
    });
  }

  // Get only global currencies
  async getGlobalCurrencies(): Promise<Currency[]> {
    return await this.currencyRepository.find({
      where: { type: 'GLOBAL', is_active: true },
      order: { name: 'ASC' },
    });
  }
}
