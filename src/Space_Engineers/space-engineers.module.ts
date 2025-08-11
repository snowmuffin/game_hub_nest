import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemModule } from './item/item.module';
import { DamageLogsModule } from './damage-logs/damage-logs.module';
import {
  SpaceEngineersItem,
  SpaceEngineersOnlineStorage,
  SpaceEngineersOnlineStorageItem,
  SpaceEngineersMarketplaceItem,
  SpaceEngineersItemDownloadLog,
  SpaceEngineersDropTable,
} from '../entities/space_engineers';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpaceEngineersItem,
      SpaceEngineersOnlineStorage,
      SpaceEngineersOnlineStorageItem,
      SpaceEngineersMarketplaceItem,
      SpaceEngineersItemDownloadLog,
      SpaceEngineersDropTable,
    ]),
    ItemModule,
    DamageLogsModule,
  ],
  exports: [TypeOrmModule],
})
export class SpaceEngineersModule {}
