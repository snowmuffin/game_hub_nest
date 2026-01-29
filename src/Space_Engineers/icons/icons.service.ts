import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadIconDto } from './icons.dto';
import { SeS3Service } from '../hangar/s3.service';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { IconFile } from '../../entities/space_engineers/icon-file.entity';

@Injectable()
export class IconsService {
  private readonly logger = new Logger(IconsService.name);

  constructor(
    private readonly s3Service: SeS3Service,
    @InjectRepository(IconFile)
    private readonly iconFileRepository: Repository<IconFile>,
  ) {}

  /**
   * Extract safe filename from game path
   * Input: "Textures\\GUI\\Icons\\Cubes\\LargeBlockArmorBlock.dds"
   * Output: "LargeBlockArmorBlock.dds"
   */
  private extractSafeFileName(filePath: string): string {
    // Replace backslashes with forward slashes for cross-platform compatibility
    const normalized = filePath.replace(/\\/g, '/');
    const parts = normalized.split('/');
    const fileName = parts[parts.length - 1] || 'unknown.dds';

    // Sanitize filename (remove dangerous characters)
    return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  async uploadIcon(dto: UploadIconDto): Promise<{
    success: boolean;
    fileName: string;
    url?: string;
    error?: string;
  }> {
    try {
      // Validate MIME type
      if (dto.mimeType !== 'image/vnd-ms.dds') {
        this.logger.warn(
          `Invalid MIME type: ${dto.mimeType}. Expected: image/vnd-ms.dds`,
        );
        throw new BadRequestException(
          'Invalid MIME type. Expected: image/vnd-ms.dds',
        );
      }

      // Decode Base64
      let buffer: Buffer;
      try {
        buffer = Buffer.from(dto.data, 'base64');
      } catch (error) {
        this.logger.error(`Base64 decode failed: ${(error as Error).message}`);
        throw new BadRequestException('Invalid base64 data');
      }

      // Validate decoded data (DDS files start with "DDS " magic bytes: 0x44 0x44 0x53 0x20)
      if (buffer.length < 4 || buffer.toString('ascii', 0, 4) !== 'DDS ') {
        this.logger.warn(
          `Invalid DDS file signature. First 4 bytes: ${buffer.slice(0, 4).toString('hex')}`,
        );
        throw new BadRequestException(
          'Invalid DDS file format (missing DDS signature)',
        );
      }

      // Extract safe filename
      const safeFileName = this.extractSafeFileName(dto.fileName);

      // Upload to S3
      const s3Key = `icons/${safeFileName}`;
      const bucket = this.s3Service.getBucket();

      try {
        await this.s3Service['s3'].send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: s3Key,
            Body: buffer,
            ContentType: 'image/vnd-ms.dds',
            CacheControl: 'public, max-age=31536000', // 1 year
          }),
        );

        const cdnUrl = `https://${bucket}.s3.ap-northeast-2.amazonaws.com/${s3Key}`;

        // Save to database (UPSERT)
        await this.iconFileRepository.upsert(
          {
            fileName: safeFileName,
            cdnUrl: cdnUrl,
          },
          ['fileName'], // conflict target
        );

        this.logger.log(
          `Icon uploaded successfully: ${safeFileName} (${buffer.length} bytes) → ${cdnUrl}`,
        );

        return {
          success: true,
          fileName: dto.fileName,
          url: cdnUrl,
        };
      } catch (uploadError) {
        const message = (uploadError as Error).message;
        this.logger.error(`S3 upload failed: ${message}`);
        throw new InternalServerErrorException('Failed to upload icon to S3');
      }
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      const message = (error as Error).message;
      this.logger.error(`Icon upload failed: ${message}`);
      throw new InternalServerErrorException('Failed to upload icon');
    }
  }
}
