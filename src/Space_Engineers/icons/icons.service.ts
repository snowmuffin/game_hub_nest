import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UploadIconDto } from './icons.dto';

@Injectable()
export class IconsService {
  private readonly logger = new Logger(IconsService.name);

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

      // Extract safe filename for future use
      const safeFileName = this.extractSafeFileName(dto.fileName);

      this.logger.log(
        `Icon validated successfully: ${safeFileName} (${buffer.length} bytes) - Not saved to disk`,
      );

      // TODO: Implement file storage (S3/CDN) when needed
      return {
        success: true,
        fileName: dto.fileName,
      };
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
