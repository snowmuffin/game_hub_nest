import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpaceEngineersHangarGrid } from 'src/entities/space_engineers';
import { IssueUploadUrlDto, ConfirmUploadDto } from './hangar.dto';
import { SeS3Service } from './s3.service';

@Injectable()
export class HangarService {
  constructor(
    @InjectRepository(SpaceEngineersHangarGrid)
    private readonly repo: Repository<SpaceEngineersHangarGrid>,
    private readonly s3: SeS3Service,
  ) {}

  async issueUploadUrl(userId: number, dto: IssueUploadUrlDto) {
    const key = `hangar/${userId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.prefab`;
    const presigned = await this.s3.createPresignedUploadUrl(
      key,
      dto.contentType,
    );

    const row = this.repo.create({
      user_id: userId,
      server_id: dto.serverId ?? null,
      name: dto.name ?? null,
      description: dto.description ?? null,
      s3_bucket: presigned.bucket,
      s3_key: key,
      content_type: dto.contentType ?? null,
      size_bytes: null,
      file_hash: null,
      status: 'UPLOADING',
      metadata: null,
    });
    const saved = await this.repo.save(row);
    return {
      id: saved.id,
      uploadUrl: presigned.url,
      bucket: presigned.bucket,
      key,
    };
  }

  async confirmUpload(userId: number, dto: ConfirmUploadDto) {
    const row = await this.repo.findOne({ where: { id: dto.id } });
    if (!row) throw new NotFoundException('Grid not found');
    if (row.user_id !== userId) throw new ForbiddenException();

    // Optionally verify object exists and read content length safely (no any)
    const head = (await this.s3.headObject(row.s3_key)) as unknown;
    let size: string | undefined = dto.sizeBytes;
    if (
      !size &&
      head &&
      typeof (head as { ContentLength?: unknown }).ContentLength === 'number'
    ) {
      size = String((head as { ContentLength: number }).ContentLength);
    }

    row.status = 'AVAILABLE';
    row.file_hash = dto.fileHash ?? row.file_hash;
    row.size_bytes = size ?? row.size_bytes;
    await this.repo.save(row);
    return { ok: true };
  }

  async listByUser(userId: number) {
    return this.repo.find({ where: { user_id: userId, status: 'AVAILABLE' } });
  }

  async issueDownloadUrl(userId: number, id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Grid not found');
    if (row.user_id !== userId) throw new ForbiddenException();
    if (row.status !== 'AVAILABLE')
      throw new ForbiddenException('Not available');
    const { url } = await this.s3.createPresignedDownloadUrl(row.s3_key);
    return { id, downloadUrl: url };
  }

  async softDelete(userId: number, id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Grid not found');
    if (row.user_id !== userId) throw new ForbiddenException();
    row.status = 'DELETED';
    await this.repo.save(row);
    return { ok: true };
  }
}
