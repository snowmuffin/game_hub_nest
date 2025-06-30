import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ItemModule } from './item/item.module';
import { DamageLogsModule } from './damage-logs/damage-logs.module';

@Module({
  imports: [
    JwtModule.register({}),
    ConfigModule,
    ItemModule, 
    DamageLogsModule
  ],
  exports: [JwtModule, ConfigModule, ItemModule, DamageLogsModule],
})
export class SpaceEngineersModule {}
