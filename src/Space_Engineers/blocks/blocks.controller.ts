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
} from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { CreateBlockDto, ListBlocksQueryDto } from './blocks.dto';
import { SeIngestApiKeyGuard } from './ingest-api-key.guard';

@Controller('space-engineers/blocks')
@UseGuards(SeIngestApiKeyGuard)
export class BlocksController {
  constructor(private readonly service: BlocksService) {}

  @Get()
  async list(@Query() query: ListBlocksQueryDto) {
    return this.service.list(query);
  }

  @Post()
  async create(@Body() dto: CreateBlockDto) {
    return this.service.create(dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
