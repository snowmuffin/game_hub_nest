import { Controller, Get, Param } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  // Get all games
  @Get()
  async getAllGames() {
    return await this.gameService.getAllGames();
  }

  // Get a specific game by ID
  @Get(':id')
  async getGameById(@Param('id') id: number) {
    return await this.gameService.getGameById(id);
  }

  // Get a game by code
  @Get('code/:code')
  async getGameByCode(@Param('code') code: string) {
    return await this.gameService.getGameByCode(code);
  }

  // Get servers for a game
  @Get(':id/servers')
  async getGameServers(@Param('id') gameId: number) {
    return await this.gameService.getGameServers(gameId);
  }

  // Get currencies for a game
  @Get(':id/currencies')
  async getGameCurrencies(@Param('id') gameId: number) {
    return await this.gameService.getGameCurrencies(gameId);
  }
}

@Controller('servers')
export class ServerController {
  constructor(private readonly gameService: GameService) {}

  // Get a specific server by ID
  @Get(':id')
  async getServerById(@Param('id') id: number) {
    return await this.gameService.getServerById(id);
  }
}

@Controller('currencies')
export class CurrencyController {
  constructor(private readonly gameService: GameService) {}

  // Get all currencies
  @Get()
  async getAllCurrencies() {
    return await this.gameService.getAllCurrencies();
  }

  // Get only global currencies
  @Get('global')
  async getGlobalCurrencies() {
    return await this.gameService.getGlobalCurrencies();
  }
}
