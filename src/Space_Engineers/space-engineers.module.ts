import { Module, OnModuleInit } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ItemModule } from './item/item.module';
import { DamageLogsModule } from './damage-logs/damage-logs.module';
import { DropTableService } from './item/drop-table.service';
import { initializeDropTableService } from './item/dropUtils';

@Module({
  imports: [
    JwtModule.register({}),
    ConfigModule,
    ItemModule, 
    DamageLogsModule
  ],
  exports: [JwtModule, ConfigModule, ItemModule, DamageLogsModule],
})
export class SpaceEngineersModule implements OnModuleInit {
  constructor(private readonly dropTableService: DropTableService) {}

  async onModuleInit() {
    // Initialize dropUtils with the DropTableService instance
    initializeDropTableService(this.dropTableService);
  }
}
