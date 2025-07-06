import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MuffinCraftController } from './muffincraft.controller';
import { MuffinCraftService } from './muffincraft.service';
import { MuffinCraftInventory } from './entities/muffincraft-inventory.entity';
import { MuffinCraftCurrency } from './entities/muffincraft-currency.entity';
import { MuffinCraftPlayer } from './entities/muffincraft-player.entity';
import { MuffinCraftAuthCode } from './entities/muffincraft-auth-code.entity';
import { InventoryController, LegacyInventoryController } from './inventory/inventory.controller';
import { InventoryService } from './inventory/inventory.service';
import { MuffinCraftAuthController } from './auth/muffincraft-auth.controller';
import { MuffinCraftAuthService } from './auth/muffincraft-auth.service';
import { MuffinCraftPlayerController } from './player/muffincraft-player.controller';
import { MuffinCraftPlayerService } from './player/muffincraft-player.service';
import { ResourcePackController } from './resourcepack.controller';

@Module({
  imports: [
    ConfigModule,
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
  controllers: [MuffinCraftController, InventoryController, LegacyInventoryController, MuffinCraftAuthController, MuffinCraftPlayerController, ResourcePackController],
  providers: [MuffinCraftService, InventoryService, MuffinCraftAuthService, MuffinCraftPlayerService],
  exports: [MuffinCraftService, InventoryService, MuffinCraftAuthService, MuffinCraftPlayerService],
})
export class MuffinCraftModule {}
