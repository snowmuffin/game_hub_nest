import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HangarController } from './hangar.controller';
import { HangarService } from './hangar.service';
import { SeS3Service } from './s3.service';
import { SpaceEngineersHangarGrid } from 'src/entities/space_engineers';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'defaultSecret',
        signOptions: { expiresIn: '6h' },
      }),
    }),
    TypeOrmModule.forFeature([SpaceEngineersHangarGrid]),
  ],
  controllers: [HangarController],
  providers: [HangarService, SeS3Service, JwtAuthGuard],
  exports: [TypeOrmModule, HangarService],
})
export class HangarModule {}
