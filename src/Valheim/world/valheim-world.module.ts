import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValheimWorld, ValheimBiome, ValheimBossEncounter } from './valheim-world.entity';
import { ValheimWorldService } from './valheim-world.service';
import { ValheimWorldController } from './valheim-world.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ValheimWorld, ValheimBiome, ValheimBossEncounter])],
  controllers: [ValheimWorldController],
  providers: [ValheimWorldService],
  exports: [ValheimWorldService],
})
export class ValheimWorldModule {}
