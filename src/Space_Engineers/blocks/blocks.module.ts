import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';
import { SpaceEngineersBlock } from 'src/entities/space_engineers';
import { SeIngestApiKeyGuard } from './ingest-api-key.guard';

@Module({
  imports: [TypeOrmModule.forFeature([SpaceEngineersBlock])],
  controllers: [BlocksController],
  providers: [BlocksService, SeIngestApiKeyGuard],
  exports: [TypeOrmModule, BlocksService],
})
export class BlocksModule {}
