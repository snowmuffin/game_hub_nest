import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import {
  ValheimWorld,
  ValheimBiome,
  ValheimBossEncounter,
} from './valheim-world.entity';
import { ValheimWorldService } from './valheim-world.service';
import { ValheimWorldController } from './valheim-world.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ValheimWorld,
      ValheimBiome,
      ValheimBossEncounter,
    ]),
    JwtModule,
    ConfigModule,
  ],
  controllers: [ValheimWorldController],
  providers: [ValheimWorldService],
  exports: [ValheimWorldService],
})
export class ValheimWorldModule {}
