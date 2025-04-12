import { Module } from '@nestjs/common';
import { DamageLogsController } from './damage-logs.controller';

@Module({
  controllers: [DamageLogsController],
})
export class DamageLogsModule {}