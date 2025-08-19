import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameServer } from '../entities/shared/game-server.entity';
import { Game } from '../entities/shared/game.entity';
import { Currency } from '../entities/shared/currency.entity';
import { ServerService } from './server.service';
import { ServerController } from './server.controller';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([GameServer, Game, Currency])],
  providers: [ServerService, JwtAuthGuard],
  controllers: [ServerController],
  exports: [ServerService],
})
export class ServerModule {}
