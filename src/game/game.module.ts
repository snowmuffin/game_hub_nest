import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  GameController,
  ServerController,
  CurrencyController,
} from './game.controller';
import { GameService } from './game.service';
import { Game } from '../entities/shared/game.entity';
import { GameServer } from '../entities/shared/game-server.entity';
import { Currency } from '../entities/shared/currency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Game, GameServer, Currency])],
  controllers: [GameController, ServerController, CurrencyController],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
