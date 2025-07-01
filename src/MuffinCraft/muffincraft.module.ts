import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MuffinCraftController } from './muffincraft.controller';
import { MuffinCraftService } from './muffincraft.service';
import { MuffinCraftInventory } from './entities/muffincraft-inventory.entity';
import { MuffinCraftCurrency } from './entities/muffincraft-currency.entity';
import { InventoryController } from './inventory/inventory.controller';
import { InventoryService } from './inventory/inventory.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MuffinCraftInventory, MuffinCraftCurrency]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'defaultSecret',
        signOptions: { expiresIn: '6h' },
      }),
    }),
  ],
  controllers: [MuffinCraftController, InventoryController],
  providers: [MuffinCraftService, InventoryService],
  exports: [MuffinCraftService, InventoryService],
})
export class MuffinCraftModule {}
