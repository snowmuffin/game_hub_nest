import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    const entity = this.repo.create({
      ...dto,
      minFieldSize: dto.minFieldSize
        ? {
            x: dto.minFieldSize.x,
            y: dto.minFieldSize.y,
            z: dto.minFieldSize.z,
          }
        : null,
      maxFieldSize: dto.maxFieldSize
        ? {
            x: dto.maxFieldSize.x,
            y: dto.maxFieldSize.y,
            z: dto.maxFieldSize.z,
          }
        : null,
    } as Partial<SpaceEngineersBlock>);
    const saved = await this.repo.save(entity);
    return saved;
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { deleted: true };
  }
}
