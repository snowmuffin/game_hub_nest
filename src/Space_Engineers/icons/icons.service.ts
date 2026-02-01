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
   * Convert DDS to PNG using basic uncompressed DDS format
   * Note: This only works for simple uncompressed DDS files
   * Compressed DDS formats (DXT1, DXT5, etc.) will fail gracefully
   */
  private async convertDdsToPng(ddsBuffer: Buffer): Promise<Buffer | null> {
    try {
      // DDS header is 128 bytes (4 byte magic + 124 byte DDS_HEADER)
      if (ddsBuffer.length < 128) {
        this.logger.warn('DDS buffer too small for conversion');
        return null;
      }

      // Read DDS header
      const height = ddsBuffer.readUInt32LE(12);
      const width = ddsBuffer.readUInt32LE(16);
      const pixelFormatFlags = ddsBuffer.readUInt32LE(80);
      const rgbBitCount = ddsBuffer.readUInt32LE(88);

      this.logger.log(
        `DDS info: ${width}x${height}, bitCount: ${rgbBitCount}, flags: 0x${pixelFormatFlags.toString(16)}`,
      );

      // Check if it's uncompressed RGB/RGBA (DDPF_RGB flag = 0x40)
      const DDPF_RGB = 0x40;
      const DDPF_ALPHAPIXELS = 0x1;

      if (!(pixelFormatFlags & DDPF_RGB)) {
        this.logger.warn(
          'DDS is compressed or not RGB format, skipping conversion',
        );
        return null;
      }

      // Determine channels
      const hasAlpha = (pixelFormatFlags & DDPF_ALPHAPIXELS) !== 0;
      const channels = hasAlpha ? 4 : 3;

      // Read pixel data (starts after 128 byte header)
      const pixelData = ddsBuffer.subarray(128);
      const expectedSize = width * height * channels;

      if (pixelData.length < expectedSize) {
        this.logger.warn(
          `Insufficient pixel data: expected ${expectedSize}, got ${pixelData.length}`,
        );
        return null;
      }

      // DDS stores pixels in BGRA order, convert to RGBA for sharp
      const rgbaData = Buffer.alloc(width * height * channels);
      for (let i = 0; i < width * height; i++) {
        const srcOffset = i * channels;
        const dstOffset = i * channels;

        if (channels === 4) {
          // BGRA -> RGBA
          rgbaData[dstOffset + 0] = pixelData[srcOffset + 2]; // R
          rgbaData[dstOffset + 1] = pixelData[srcOffset + 1]; // G
          rgbaData[dstOffset + 2] = pixelData[srcOffset + 0]; // B
          rgbaData[dstOffset + 3] = pixelData[srcOffset + 3]; // A
        } else {
          // BGR -> RGB
          rgbaData[dstOffset + 0] = pixelData[srcOffset + 2]; // R
          rgbaData[dstOffset + 1] = pixelData[srcOffset + 1]; // G
          rgbaData[dstOffset + 2] = pixelData[srcOffset + 0]; // B
        }
      }

      // Convert to PNG using sharp
      const pngBuffer = await sharp(rgbaData, {
        raw: {
          width,
          height,
          channels,
        },
      })
        .png()
        .toBuffer();

      this.logger.log(
        `Successfully converted DDS to PNG: ${ddsBuffer.length} -> ${pngBuffer.length} bytes`,
      );
      return pngBuffer;
    } catch (error) {
      this.logger.warn(
        `DDS to PNG conversion failed: ${(error as Error).message}`,
      );
      return null;
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
