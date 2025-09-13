import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import type { FindOptionsWhere } from 'typeorm';
import { SpaceEngineersBlock } from 'src/entities/space_engineers';
import { CreateBlockDto, ListBlocksQueryDto } from './blocks.dto';

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(SpaceEngineersBlock)
    private readonly repo: Repository<SpaceEngineersBlock>,
  ) {}

  async list(query: ListBlocksQueryDto) {
    const { skip = 0, take = 50, typeId, subtypeId } = query;
    return this.repo.find({
      where: {
        ...(typeId ? { typeId } : {}),
        ...(subtypeId ? { subtypeId } : {}),
      },
      order: { id: 'ASC' },
      skip,
      take,
    });
  }

  async create(dto: CreateBlockDto) {
    const where: FindOptionsWhere<SpaceEngineersBlock> = { typeId: dto.typeId };
    if (dto.subtypeId === null) {
      where.subtypeId = IsNull();
    } else if (dto.subtypeId !== undefined) {
      where.subtypeId = dto.subtypeId;
    }
    const existing = await this.repo.findOne({ where });

    const mapped: Partial<SpaceEngineersBlock> = {
      ...dto,
    } as Partial<SpaceEngineersBlock>;
    if (dto.minFieldSize) {
      mapped.minFieldSize = {
        x: dto.minFieldSize.x,
        y: dto.minFieldSize.y,
        z: dto.minFieldSize.z,
      };
    }
    if (dto.maxFieldSize) {
      mapped.maxFieldSize = {
        x: dto.maxFieldSize.x,
        y: dto.maxFieldSize.y,
        z: dto.maxFieldSize.z,
      };
    }
    if (dto.center) {
      const c = dto.center;
      mapped.center = { x: c.x, y: c.y, z: c.z } as unknown as {
        x: number;
        y: number;
        z: number;
      };
    }

    if (existing) {
      Object.assign(existing, mapped);
      return this.repo.save(existing);
    }

    const entity = this.repo.create(mapped);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { deleted: true };
  }
}
