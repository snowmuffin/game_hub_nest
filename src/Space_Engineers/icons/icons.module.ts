import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IconsController } from './icons.controller';
import { IconsService } from './icons.service';
import { SeS3Service } from '../hangar/s3.service';

@Module({
  imports: [ConfigModule],
  controllers: [IconsController],
  providers: [IconsService, SeS3Service],
  exports: [IconsService],
})
export class IconsModule {}
