import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ValheimBuilding } from './valheim-building.entity';
import { ValheimBuildingService } from './valheim-building.service';
import { ValheimBuildingController } from './valheim-building.controller';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([ValheimBuilding]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'defaultSecret',
        signOptions: { expiresIn: '6h' },
      }),
    }),
    ConfigModule,
  ],
  controllers: [ValheimBuildingController],
  providers: [ValheimBuildingService, JwtAuthGuard],
  exports: [ValheimBuildingService],
})
export class ValheimBuildingModule {}
