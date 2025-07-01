import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MuffinCraftController } from './muffincraft.controller';
import { MuffinCraftService } from './muffincraft.service';
import { MuffinCraftInventory } from './entities/muffincraft-inventory.entity';
import { MuffinCraftCurrency } from './entities/muffincraft-currency.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MuffinCraftInventory, MuffinCraftCurrency]),
  ],
  controllers: [MuffinCraftController],
  providers: [MuffinCraftService],
  exports: [MuffinCraftService],
})
export class MuffinCraftModule {}
