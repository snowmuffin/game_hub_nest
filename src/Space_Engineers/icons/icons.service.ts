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
import * as sharp from 'sharp';

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

  /**
   * Convert DDS to PNG using ImageMagick
   * Supports all DDS formats including DXT1, DXT5, etc.
   */
  private async convertDdsToPng(ddsBuffer: Buffer): Promise<Buffer | null> {
    const { promisify } = require('util');
    const exec = promisify(require('child_process').exec);
    const fs = require('fs').promises;
    const path = require('path');
    const os = require('os');

    let tmpDdsPath: string | null = null;
    let tmpPngPath: string | null = null;

    try {
      // Create temporary files
      const tmpDir = os.tmpdir();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      tmpDdsPath = path.join(tmpDir, `icon_${timestamp}_${randomId}.dds`);
      tmpPngPath = path.join(tmpDir, `icon_${timestamp}_${randomId}.png`);

      // Write DDS buffer to temp file
      await fs.writeFile(tmpDdsPath, ddsBuffer);

      // Convert using ImageMagick
      this.logger.log(`Converting DDS to PNG using ImageMagick...`);
      await exec(`convert "${tmpDdsPath}" "${tmpPngPath}"`);

      // Read PNG buffer
      const pngBuffer = await fs.readFile(tmpPngPath);

      this.logger.log(
        `Successfully converted DDS to PNG: ${ddsBuffer.length} -> ${pngBuffer.length} bytes`,
      );

      return pngBuffer;
    } catch (error) {
      this.logger.warn(
        `DDS to PNG conversion failed: ${(error as Error).message}`,
      );
      return null;
    } finally {
      // Clean up temporary files
      try {
        if (tmpDdsPath) await fs.unlink(tmpDdsPath).catch(() => {});
        if (tmpPngPath) await fs.unlink(tmpPngPath).catch(() => {});
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  async uploadIcon(dto: UploadIconDto): Promise<{
    success: boolean;
    fileName: string;
    url?: string;
    pngUrl?: string;
    error?: string;
  }> {
    try {
      // Validate MIME type (allow DDS and PNG)
      const allowedMimeTypes = ['image/vnd-ms.dds', 'image/png'];
      if (!allowedMimeTypes.includes(dto.mimeType)) {
        this.logger.warn(
          `Invalid MIME type: ${dto.mimeType}. Expected: ${allowedMimeTypes.join(' or ')}`,
        );
        throw new BadRequestException(
          `Invalid MIME type. Expected: ${allowedMimeTypes.join(' or ')}`,
        );
      }

      // Decode Base64 for main file
      let buffer: Buffer;
      try {
        buffer = Buffer.from(dto.data, 'base64');
      } catch (error) {
        this.logger.error(`Base64 decode failed: ${(error as Error).message}`);
        throw new BadRequestException('Invalid base64 data');
      }

      // Validate decoded data based on file type
      if (dto.mimeType === 'image/vnd-ms.dds') {
        // DDS files start with "DDS " magic bytes: 0x44 0x44 0x53 0x20
        if (buffer.length < 4 || buffer.toString('ascii', 0, 4) !== 'DDS ') {
          this.logger.warn(
            `Invalid DDS file signature. First 4 bytes: ${buffer.slice(0, 4).toString('hex')}`,
          );
          throw new BadRequestException(
            'Invalid DDS file format (missing DDS signature)',
          );
        }
      } else if (dto.mimeType === 'image/png') {
        // PNG files start with PNG signature: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
        if (
          buffer.length < 8 ||
          buffer[0] !== 0x89 ||
          buffer[1] !== 0x50 ||
          buffer[2] !== 0x4e ||
          buffer[3] !== 0x47
        ) {
          this.logger.warn(
            `Invalid PNG file signature. First 8 bytes: ${buffer.slice(0, 8).toString('hex')}`,
          );
          throw new BadRequestException(
            'Invalid PNG file format (missing PNG signature)',
          );
        }
      }

      // Decode PNG preview if provided, or auto-convert from DDS
      let pngBuffer: Buffer | null = null;
      if (dto.pngData) {
        try {
          pngBuffer = Buffer.from(dto.pngData, 'base64');
          // Validate PNG signature
          if (
            pngBuffer.length < 8 ||
            pngBuffer[0] !== 0x89 ||
            pngBuffer[1] !== 0x50 ||
            pngBuffer[2] !== 0x4e ||
            pngBuffer[3] !== 0x47
          ) {
            this.logger.warn('Invalid PNG preview signature, ignoring');
            pngBuffer = null;
          }
        } catch (error) {
          this.logger.warn(
            `Failed to decode PNG preview: ${(error as Error).message}`,
          );
          pngBuffer = null;
        }
      } else if (dto.mimeType === 'image/vnd-ms.dds') {
        // Auto-convert DDS to PNG
        this.logger.log('Attempting to convert DDS to PNG...');
        pngBuffer = await this.convertDdsToPng(buffer);
        if (pngBuffer) {
          this.logger.log('DDS to PNG conversion successful');
        } else {
          this.logger.warn('DDS to PNG conversion failed or not supported');
        }
      }

      // Extract safe filename
      const safeFileName = this.extractSafeFileName(dto.fileName);
      const bucket = this.s3Service.getBucket();

      // Upload main file (DDS or PNG) to S3
      const s3Key = `icons/${safeFileName}`;
      const contentType =
        dto.mimeType === 'image/png' ? 'image/png' : 'image/vnd-ms.dds';

      try {
        await this.s3Service['s3'].send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: s3Key,
            Body: buffer,
            ContentType: contentType,
            CacheControl: 'public, max-age=31536000', // 1 year
            ACL: 'public-read', // Make file publicly accessible
          }),
        );

        const cdnUrl = `https://${bucket}.s3.ap-northeast-2.amazonaws.com/${s3Key}`;
        let pngCdnUrl: string | null = null;

        // Upload PNG preview if provided
        if (pngBuffer) {
          const pngFileName = safeFileName.replace(/\.(dds|DDS)$/, '.png');
          const pngS3Key = `icons/${pngFileName}`;

          await this.s3Service['s3'].send(
            new PutObjectCommand({
              Bucket: bucket,
              Key: pngS3Key,
              Body: pngBuffer,
              ContentType: 'image/png',
              CacheControl: 'public, max-age=31536000',
              ACL: 'public-read', // Make file publicly accessible
            }),
          );

          pngCdnUrl = `https://${bucket}.s3.ap-northeast-2.amazonaws.com/${pngS3Key}`;
          this.logger.log(
            `PNG preview uploaded: ${pngFileName} (${pngBuffer.length} bytes)`,
          );
        }

        // Save to database (UPSERT)
        await this.iconFileRepository.upsert(
          {
            fileName: safeFileName,
            cdnUrl: cdnUrl,
            pngCdnUrl: pngCdnUrl,
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
          pngUrl: pngCdnUrl || undefined,
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
