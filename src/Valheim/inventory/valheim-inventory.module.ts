import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValheimInventoryController } from './valheim-inventory.controller';
import { ValheimInventoryService } from './valheim-inventory.service';
import { ValheimInventory } from './valheim-inventory.entity';
import { ValheimItem } from '../item/valheim-item.entity';
import { User } from '../../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ValheimInventory, ValheimItem, User])],
  controllers: [ValheimInventoryController],
  providers: [ValheimInventoryService],
  exports: [ValheimInventoryService],
})
export class ValheimInventoryModule {}
