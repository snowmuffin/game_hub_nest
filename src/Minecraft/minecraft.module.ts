import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { User } from 'src/user/user.entity';
import { ItemModule } from './item/item.module';
import { PlayerStatsModule } from './player-stats/player-stats.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({}),
    ConfigModule,
    ItemModule,
    PlayerStatsModule,
  ],
  exports: [ItemModule, PlayerStatsModule, JwtModule, ConfigModule],
})
export class MinecraftModule {}
