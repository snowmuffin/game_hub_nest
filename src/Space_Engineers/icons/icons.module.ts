import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IconsController } from './icons.controller';
import { IconsService } from './icons.service';
import { SeS3Service } from '../hangar/s3.service';
import { IconFile } from '../../entities/space_engineers/icon-file.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([IconFile])],
  controllers: [IconsController],
  providers: [IconsService, SeS3Service],
  exports: [IconsService],
})
export class IconsModule {}
