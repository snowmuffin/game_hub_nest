import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import type { FindOptionsWhere } from 'typeorm';
import { SpaceEngineersBlock } from 'src/entities/space_engineers';
import { CreateBlockDto, ListBlocksQueryDto } from './blocks.dto';
import logger from 'src/utils/logger';

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(SpaceEngineersBlock)
    private readonly repo: Repository<SpaceEngineersBlock>,
    private readonly dataSource: DataSource,
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
    // Diagnostic: log incoming payload summary and DB target
    try {
      const opts = this.dataSource.options as {
        type?: unknown;
        host?: string;
        port?: number;
        database?: string;
      };
      logger.info(
        `[SpaceEngineers][Blocks] create() received typeId=${dto.typeId}, subtypeId=${dto.subtypeId ?? 'null'} -> DB ${opts.host}:${String(opts.port)} ${opts.database} table=${this.repo.metadata.tablePath}`,
      );
    } catch {
      // ignore
    }

    const where: FindOptionsWhere<SpaceEngineersBlock> = { typeId: dto.typeId };
    if (dto.subtypeId === null) {
      where.subtypeId = IsNull();
    } else if (dto.subtypeId !== undefined) {
      where.subtypeId = dto.subtypeId;
    }
    logger.info(
      `[SpaceEngineers][Blocks] Looking up existing by where=${JSON.stringify(where)}`,
    );
    const existing = await this.repo.findOne({ where });
    logger.info(
      `[SpaceEngineers][Blocks] Lookup result: ${existing ? `FOUND id=${existing.id}` : 'NOT FOUND'}`,
    );

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
      logger.info(
        `[SpaceEngineers][Blocks] Saving update for id=${existing.id} ...`,
      );
      try {
        const saved = await this.repo.save(existing);
        logger.info(
          `[SpaceEngineers][Blocks] Updated block typeId=${saved.typeId}, subtypeId=${saved.subtypeId ?? 'null'}, id=${saved.id}`,
        );
        return saved;
      } catch (e) {
        logger.error(
          `[SpaceEngineers][Blocks] Update failed for id=${existing.id}: ${String(
            (e as Error).message,
          )}`,
        );
        throw e;
      }
    }

    const entity = this.repo.create(mapped);
    logger.info(
      `[SpaceEngineers][Blocks] Saving new entity for typeId=${dto.typeId}, subtypeId=${dto.subtypeId ?? 'null'} ...`,
    );
    try {
      const saved = await this.repo.save(entity);
      logger.info(
        `[SpaceEngineers][Blocks] Created block typeId=${saved.typeId}, subtypeId=${saved.subtypeId ?? 'null'}, id=${saved.id}`,
      );
      return saved;
    } catch (e) {
      logger.error(
        `[SpaceEngineers][Blocks] Create failed typeId=${dto.typeId}, subtypeId=${dto.subtypeId ?? 'null'}: ${String(
          (e as Error).message,
        )}`,
      );
      throw e;
    }
  }

  async remove(id: number) {
    await this.repo.delete(id);
    logger.info(`[SpaceEngineers][Blocks] Deleted block id=${id}`);
    return { deleted: true };
  }
}
