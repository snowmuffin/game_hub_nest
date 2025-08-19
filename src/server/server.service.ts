import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameServer } from '../entities/shared/game-server.entity';
import { Game } from '../entities/shared/game.entity';
import { Currency } from '../entities/shared/currency.entity';

export interface CreateServerDto {
  gameId: number;
  code: string;
  name: string;
  description?: string;
  serverUrl?: string;
  port?: number;
  currencyId?: number; // optional initial currency
  metadata?: Record<string, any>;
}

export interface UpdateServerDto {
  name?: string;
  description?: string;
  serverUrl?: string;
  port?: number;
  isActive?: boolean;
  currencyId?: number | null;
  metadata?: Record<string, any> | null;
}

@Injectable()
export class ServerService {
  constructor(
    @InjectRepository(GameServer)
    private readonly serverRepo: Repository<GameServer>,
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,
    @InjectRepository(Currency)
    private readonly currencyRepo: Repository<Currency>,
  ) {}

  async create(dto: CreateServerDto): Promise<GameServer> {
    const game = await this.gameRepo.findOne({ where: { id: dto.gameId } });
    if (!game) throw new BadRequestException('Invalid gameId');

    if (!dto.code || dto.code.length > 50)
      throw new BadRequestException('Invalid code');

    const exists = await this.serverRepo.findOne({
      where: { code: dto.code, game_id: dto.gameId },
    });
    if (exists)
      throw new BadRequestException('Server code already exists for this game');

    let currency: Currency | null = null;
    if (dto.currencyId) {
      currency = await this.currencyRepo.findOne({
        where: { id: dto.currencyId },
      });
      if (!currency) throw new BadRequestException('Invalid currencyId');
    }

    const server = this.serverRepo.create({
      game_id: dto.gameId,
      code: dto.code,
      name: dto.name,
      description: dto.description,
      server_url: dto.serverUrl,
      port: dto.port,
      currency_id: currency?.id,
      metadata: dto.metadata,
    });
    return await this.serverRepo.save(server);
  }

  async list(gameId?: number): Promise<GameServer[]> {
    if (gameId) {
      return await this.serverRepo.find({ where: { game_id: gameId } });
    }
    return await this.serverRepo.find();
  }

  async findById(id: number): Promise<GameServer> {
    const server = await this.serverRepo.findOne({ where: { id } });
    if (!server) throw new NotFoundException('Server not found');
    return server;
  }

  async update(id: number, dto: UpdateServerDto): Promise<GameServer> {
    const server = await this.findById(id);
    if (dto.name !== undefined) server.name = dto.name;
    if (dto.description !== undefined) server.description = dto.description;
    if (dto.serverUrl !== undefined) server.server_url = dto.serverUrl;
    if (dto.port !== undefined) server.port = dto.port;
    if (dto.isActive !== undefined) server.is_active = dto.isActive;
    if (dto.currencyId !== undefined) {
      if (dto.currencyId === null) {
        // Clear existing currency (field is nullable in DB)
        (server as unknown as { currency_id: number | null }).currency_id =
          null;
      } else {
        const currency = await this.currencyRepo.findOne({
          where: { id: dto.currencyId },
        });
        if (!currency) throw new BadRequestException('Invalid currencyId');
        server.currency_id = currency.id;
      }
    }
    if (dto.metadata !== undefined)
      server.metadata = dto.metadata === null ? {} : (dto.metadata as object);
    return await this.serverRepo.save(server);
  }

  async activate(id: number): Promise<GameServer> {
    return this.update(id, { isActive: true });
  }

  async deactivate(id: number): Promise<GameServer> {
    return this.update(id, { isActive: false });
  }
}
