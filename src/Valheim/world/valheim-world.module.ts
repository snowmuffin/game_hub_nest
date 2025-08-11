import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import {
  ValheimWorld,
  ValheimBiome,
  ValheimBossEncounter,
} from '../../entities/valheim/valheim-world.entity';
import { ValheimWorldService } from './valheim-world.service';
import { ValheimWorldController } from './valheim-world.controller';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ValheimWorld,
      ValheimBiome,
      ValheimBossEncounter,
    ]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'defaultSecret',
        signOptions: { expiresIn: '6h' },
      }),
    }),
    ConfigModule,
  ],
  controllers: [ValheimWorldController],
  providers: [ValheimWorldService, JwtAuthGuard],
  exports: [ValheimWorldService],
})
export class ValheimWorldModule {}
