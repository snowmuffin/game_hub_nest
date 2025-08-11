import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from 'src/entities/shared/user.entity';
import { JwtModule } from '@nestjs/jwt'; // JwtModule 추가
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  SpaceEngineersItem,
  SpaceEngineersOnlineStorage,
  SpaceEngineersOnlineStorageItem,
  SpaceEngineersMarketplaceItem,
  SpaceEngineersItemDownloadLog,
  SpaceEngineersDropTable,
} from 'src/entities/space_engineers';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      SpaceEngineersItem,
      SpaceEngineersOnlineStorage,
      SpaceEngineersOnlineStorageItem,
      SpaceEngineersMarketplaceItem,
      SpaceEngineersItemDownloadLog,
      SpaceEngineersDropTable,
    ]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'defaultSecret',
        signOptions: { expiresIn: '6h' },
      }),
    }),
    ConfigModule,
  ],
  controllers: [ItemController],
  providers: [ItemService, JwtAuthGuard],
})
export class ItemModule {}
