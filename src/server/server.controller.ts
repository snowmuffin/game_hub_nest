import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ServerService,
  CreateServerDto,
  UpdateServerDto,
} from './server.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('servers')
@UseGuards(JwtAuthGuard)
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @Post()
  async create(@Body() dto: CreateServerDto) {
    return await this.serverService.create(dto);
  }

  @Get()
  async list(@Query('gameId') gameId?: number) {
    return await this.serverService.list(gameId ? Number(gameId) : undefined);
  }

  @Get(':id')
  async get(@Param('id') id: number) {
    return await this.serverService.findById(Number(id));
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateServerDto) {
    return await this.serverService.update(Number(id), dto);
  }

  @Post(':id/activate')
  async activate(@Param('id') id: number) {
    return await this.serverService.activate(Number(id));
  }

  @Post(':id/deactivate')
  async deactivate(@Param('id') id: number) {
    return await this.serverService.deactivate(Number(id));
  }
}
