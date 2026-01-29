import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';
import { SpaceEngineersBlock } from 'src/entities/space_engineers';
import { IconFile } from 'src/entities/space_engineers/icon-file.entity';
import { SeIngestApiKeyGuard } from './ingest-api-key.guard';

@Module({
  imports: [TypeOrmModule.forFeature([SpaceEngineersBlock, IconFile])],
  controllers: [BlocksController],
  providers: [BlocksService, SeIngestApiKeyGuard],
  exports: [TypeOrmModule, BlocksService],
})
export class BlocksModule {}
