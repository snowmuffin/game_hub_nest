import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemModule } from './item/item.module';
import { DamageLogsModule } from './damage-logs/damage-logs.module';
import { Game } from '../entities/shared/game.entity';
import { GameServer } from '../entities/shared/game-server.entity';
// Removed registry-based sync; ingest-based only
import { HealthController } from './servers/health.controller';
import { HealthService } from './servers/health.service';
import { ServerHealthEvent } from '../entities/shared/server-health-event.entity';
import { ServerHealthSnapshot } from '../entities/shared/server-health-snapshot.entity';
import { ServerOutage } from '../entities/shared/server-outage.entity';
import {
  SpaceEngineersItem,
  SpaceEngineersOnlineStorage,
  SpaceEngineersOnlineStorageItem,
  SpaceEngineersMarketplaceItem,
  SpaceEngineersItemDownloadLog,
  SpaceEngineersDropTable,
} from '../entities/space_engineers';
import { HangarModule } from './hangar/hangar.module';
import { BlocksModule } from './blocks/blocks.module';
import { WikiModule } from './wiki/wiki.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Game,
      GameServer,
      ServerHealthEvent,
      ServerHealthSnapshot,
      ServerOutage,
      SpaceEngineersItem,
      SpaceEngineersOnlineStorage,
      SpaceEngineersOnlineStorageItem,
      SpaceEngineersMarketplaceItem,
      SpaceEngineersItemDownloadLog,
      SpaceEngineersDropTable,
    ]),
    ItemModule,
    HangarModule,
    DamageLogsModule,
    BlocksModule,
    WikiModule,
  ],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [TypeOrmModule, HealthService],
})
export class SpaceEngineersModule {}
