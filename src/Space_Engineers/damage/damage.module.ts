import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DamageLog } from './damage-log.entity';
import { DamageService } from './damage.service';

@Module({
  imports: [TypeOrmModule.forFeature([DamageLog])],
  providers: [DamageService],
  exports: [DamageService],
})
export class DamageModule {}