import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ValheimBuilding } from './valheim-building.entity';
import { ValheimBuildingService } from './valheim-building.service';
import { ValheimBuildingController } from './valheim-building.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ValheimBuilding]),
    JwtModule,
    ConfigModule,
  ],
  controllers: [ValheimBuildingController],
  providers: [ValheimBuildingService],
  exports: [ValheimBuildingService],
})
export class ValheimBuildingModule {}
