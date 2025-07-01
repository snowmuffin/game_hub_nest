import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { MuffinCraftInventory } from '../entities/muffincraft-inventory.entity';
import { MinecraftModule } from '../../Minecraft/minecraft.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MuffinCraftInventory]),
    MinecraftModule
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService]
})
export class InventoryModule {}
