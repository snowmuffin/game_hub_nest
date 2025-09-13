import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { CreateBlockDto, ListBlocksQueryDto } from './blocks.dto';
import { SeIngestApiKeyGuard } from './ingest-api-key.guard';

@Controller('space-engineers/blocks')
@UseGuards(SeIngestApiKeyGuard)
export class BlocksController {
  private readonly logger = new Logger(BlocksController.name);

  constructor(private readonly service: BlocksService) {}

  @Get()
  async list(@Query() query: ListBlocksQueryDto) {
    this.logger.log(
      `GET /space-engineers/blocks query skip=${query.skip ?? 0} take=${query.take ?? 50} typeId=${query.typeId ?? ''} subtypeId=${query.subtypeId ?? ''}`,
    );
    return this.service.list(query);
  }

  @Post()
  async create(@Body() dto: CreateBlockDto) {
    this.logger.log(
      `POST /space-engineers/blocks payload typeId=${dto.typeId} subtypeId=${
        dto.subtypeId ?? 'null'
      }`,
    );
    return this.service.create(dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`DELETE /space-engineers/blocks/${id}`);
    return this.service.remove(id);
  }
}
