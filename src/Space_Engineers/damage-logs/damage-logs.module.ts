import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DamageLogsController } from './damage-logs.controller';
import { DamageLogsService } from './damage-logs.service';
import { User } from 'src/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [DamageLogsController],
  providers: [DamageLogsService],
})
export class DamageLogsModule {}