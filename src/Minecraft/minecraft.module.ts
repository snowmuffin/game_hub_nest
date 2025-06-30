import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { ItemModule } from './item/item.module';
import { PlayerStatsModule } from './player-stats/player-stats.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ItemModule,
    PlayerStatsModule,
  ],
  exports: [ItemModule, PlayerStatsModule],
})
export class MinecraftModule {}
