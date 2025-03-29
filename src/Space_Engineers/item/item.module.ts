import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [ItemController],
  providers: [ItemService],
})
export class ItemModule {}