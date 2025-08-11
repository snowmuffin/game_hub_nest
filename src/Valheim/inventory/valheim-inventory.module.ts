import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ValheimInventoryController } from './valheim-inventory.controller';
import { ValheimInventoryService } from './valheim-inventory.service';
import { ValheimInventory } from './valheim-inventory.entity';
import { ValheimItem } from '../item/valheim-item.entity';
import { User } from '../../entities/user.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([ValheimInventory, ValheimItem, User]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'defaultSecret',
        signOptions: { expiresIn: '6h' },
      }),
    }),
    ConfigModule,
  ],
  controllers: [ValheimInventoryController],
  providers: [ValheimInventoryService, JwtAuthGuard],
  exports: [ValheimInventoryService],
})
export class ValheimInventoryModule {}
