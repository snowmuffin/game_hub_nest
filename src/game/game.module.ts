import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameController, ServerController, CurrencyController } from './game.controller';
import { GameService } from './game.service';
import { Game } from '../entities/game.entity';
import { GameServer } from '../entities/game-server.entity';
import { Currency } from '../entities/currency.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Game,
      GameServer,
      Currency,
    ]),
  ],
  controllers: [GameController, ServerController, CurrencyController],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
