import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DamageLogsController } from './damage-logs.controller';
import { User } from '@entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [DamageLogsController],
})
export class DamageLogsModule {}