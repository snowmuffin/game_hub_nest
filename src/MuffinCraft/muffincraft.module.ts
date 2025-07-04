import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MuffinCraftController } from './muffincraft.controller';
import { MuffinCraftService } from './muffincraft.service';
import { MuffinCraftInventory } from './entities/muffincraft-inventory.entity';
import { MuffinCraftCurrency } from './entities/muffincraft-currency.entity';
import { MuffinCraftPlayer } from './entities/muffincraft-player.entity';
import { MuffinCraftAuthCode } from './entities/muffincraft-auth-code.entity';
import { InventoryController } from './inventory/inventory.controller';
import { InventoryService } from './inventory/inventory.service';
import { MuffinCraftAuthController } from './auth/muffincraft-auth.controller';
import { MuffinCraftAuthService } from './auth/muffincraft-auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MuffinCraftInventory, 
      MuffinCraftCurrency,
      MuffinCraftPlayer,
      MuffinCraftAuthCode
    ]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'defaultSecret',
        signOptions: { expiresIn: '6h' },
      }),
    }),
  ],
  controllers: [MuffinCraftController, InventoryController, MuffinCraftAuthController],
  providers: [MuffinCraftService, InventoryService, MuffinCraftAuthService],
  exports: [MuffinCraftService, InventoryService, MuffinCraftAuthService],
})
export class MuffinCraftModule {}
