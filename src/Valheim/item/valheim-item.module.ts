import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValheimItemController } from './valheim-item.controller';
import { ValheimItemService } from './valheim-item.service';
import { ValheimItem } from './valheim-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ValheimItem])],
  controllers: [ValheimItemController],
  providers: [ValheimItemService],
  exports: [ValheimItemService],
})
export class ValheimItemModule {}
