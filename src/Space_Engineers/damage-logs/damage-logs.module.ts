import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DamageLogsController } from './damage-logs.controller';
import { DamageLogsService } from './damage-logs.service';
import { DamageLogsPasswordGuard } from './damage-logs-password.guard';
import { User } from 'src/entities/shared/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [DamageLogsController],
  providers: [DamageLogsService, DamageLogsPasswordGuard],
})
export class DamageLogsModule {}
