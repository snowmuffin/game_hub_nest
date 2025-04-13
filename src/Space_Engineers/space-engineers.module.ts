import { Module } from '@nestjs/common';
import { ItemModule } from './item/item.module';
import { DamageLogsModule } from './damage-logs/damage-logs.module';

@Module({
  imports: [ItemModule, DamageLogsModule],
})
export class SpaceEngineersModule {}
