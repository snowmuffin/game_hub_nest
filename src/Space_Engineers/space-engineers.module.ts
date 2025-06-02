import { Module } from '@nestjs/common';
import { ItemModule } from './item/item.module';
import { DamageLogsModule } from './damage-logs/damage-logs.module';
import { RewardModule } from './reward/reward.module';

@Module({
  imports: [ItemModule, DamageLogsModule, RewardModule],
})
export class SpaceEngineersModule {}
