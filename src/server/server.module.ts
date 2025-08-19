import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameServer } from '../entities/shared/game-server.entity';
import { Game } from '../entities/shared/game.entity';
import { Currency } from '../entities/shared/currency.entity';
import { ServerService } from './server.service';
import { ServerController } from './server.controller';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameServer, Game, Currency]),
    // Provide JwtService locally so JwtAuthGuard can resolve its dependency
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '6h' },
    }),
  ],
  providers: [ServerService, JwtAuthGuard],
  controllers: [ServerController],
  exports: [ServerService],
})
export class ServerModule {}
