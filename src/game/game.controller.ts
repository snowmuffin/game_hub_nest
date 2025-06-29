import { Controller, Get, Param } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  // 모든 게임 조회
  @Get()
  async getAllGames() {
    return await this.gameService.getAllGames();
  }

  // 특정 게임 조회
  @Get(':id')
  async getGameById(@Param('id') id: number) {
    return await this.gameService.getGameById(id);
  }

  // 게임 코드로 조회
  @Get('code/:code')
  async getGameByCode(@Param('code') code: string) {
    return await this.gameService.getGameByCode(code);
  }

  // 게임의 서버들 조회
  @Get(':id/servers')
  async getGameServers(@Param('id') gameId: number) {
    return await this.gameService.getGameServers(gameId);
  }

  // 게임의 화폐들 조회
  @Get(':id/currencies')
  async getGameCurrencies(@Param('id') gameId: number) {
    return await this.gameService.getGameCurrencies(gameId);
  }
}

@Controller('servers')
export class ServerController {
  constructor(private readonly gameService: GameService) {}

  // 특정 서버 조회
  @Get(':id')
  async getServerById(@Param('id') id: number) {
    return await this.gameService.getServerById(id);
  }
}

@Controller('currencies')
export class CurrencyController {
  constructor(private readonly gameService: GameService) {}

  // 모든 화폐 조회
  @Get()
  async getAllCurrencies() {
    return await this.gameService.getAllCurrencies();
  }

  // 글로벌 화폐들만 조회
  @Get('global')
  async getGlobalCurrencies() {
    return await this.gameService.getGlobalCurrencies();
  }
}
