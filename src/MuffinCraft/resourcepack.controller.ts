import {
  Controller,
  Get,
  Header,
  Res,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { createReadStream, existsSync, statSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

/**
 * Controller for managing MuffinCraft resource pack downloads and information
 */
@Controller('muffincraft/resourcepack')
export class ResourcePackController {
  private readonly logger = new Logger(ResourcePackController.name);
  private readonly resourcePackPath: string;

  constructor() {
    // Try multiple paths to find the resource pack file
    const possiblePaths = [
      // Production environment (dist folder)
      join(__dirname, 'resources', 'muffincraft-resourcepack.zip'),
      join(
        process.cwd(),
        'dist',
        'src',
        'MuffinCraft',
        'resources',
        'muffincraft-resourcepack.zip',
      ),
      // Development environment (src folder)
      join(
        process.cwd(),
        'src',
        'MuffinCraft',
        'resources',
        'muffincraft-resourcepack.zip',
      ),
      // Backup path
      join(process.cwd(), 'resources', 'muffincraft-resourcepack.zip'),
    ];

    let foundPath: string | null = null;
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        foundPath = path;
        break;
      }
    }

    if (foundPath) {
      this.resourcePackPath = foundPath;
      this.logger.log(`✅ Resource pack file found: ${this.resourcePackPath}`);
    } else {
      this.resourcePackPath = possiblePaths[0]; // Default value
      this.logger.error('❌ Resource pack file not found!');
      this.logger.error('Attempted paths:');
      possiblePaths.forEach((path, index) => {
        this.logger.error(
          `  ${index + 1}. ${path} - exists: ${existsSync(path)}`,
        );
      });
    }
  }

  /**
   * Download the resource pack ZIP file
   */
  @Get('download')
  @Header('Content-Type', 'application/zip')
  @Header(
    'Content-Disposition',
    'attachment; filename="muffincraft-resourcepack.zip"',
  )
  @Header('Cache-Control', 'public, max-age=3600') // 1 hour cache
  downloadResourcePack(@Res() res: Response): void {
    try {
      // Check if file exists
      if (!existsSync(this.resourcePackPath)) {
        this.logger.error(
          `Resource pack file not found: ${this.resourcePackPath}`,
        );
        throw new HttpException(
          'Resource pack file not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Check file size
      const stats = statSync(this.resourcePackPath);
      const fileSizeInMB = stats.size / (1024 * 1024);

      if (fileSizeInMB > 50) {
        this.logger.warn(
          `Resource pack file is too large: ${fileSizeInMB.toFixed(2)}MB`,
        );
      }

      // Set headers
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Accept-Ranges', 'bytes');

      this.logger.log(
        `Resource pack download started: ${this.resourcePackPath} (${fileSizeInMB.toFixed(2)}MB)`,
      );

      // Create file stream and send
      const stream = createReadStream(this.resourcePackPath);

      stream.on('error', (error: Error) => {
        this.logger.error(`Resource pack stream error: ${error.message}`);
        if (!res.headersSent) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Error occurred during file transmission',
            error: error.message,
          });
        }
      });

      stream.on('end', () => {
        this.logger.log('Resource pack download completed');
      });

      stream.pipe(res);
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Resource pack download error: ${errorMessage}`);

      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Error occurred during resource pack download',
          error: errorMessage,
        });
      }
    }
  }

  /**
   * Returns resource pack information (SHA-1 hash, size, etc.)
   */
  @Get('info')
  async getResourcePackInfo() {
    try {
      if (!existsSync(this.resourcePackPath)) {
        throw new HttpException(
          'Resource pack file not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const stats = statSync(this.resourcePackPath);
      const sha1Hash = await this.calculateSHA1(this.resourcePackPath);

      return {
        filename: 'muffincraft-resourcepack.zip',
        size: stats.size,
        sizeInMB: (stats.size / (1024 * 1024)).toFixed(2),
        sha1: sha1Hash,
        lastModified: stats.mtime,
        downloadUrl: '/muffincraft/resourcepack/download',
        description: 'MuffinCraft custom items resource pack',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Resource pack info retrieval error: ${errorMessage}`);
      throw new HttpException(
        'Unable to retrieve resource pack information',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Calculate SHA-1 hash of a file
   */
  private async calculateSHA1(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash('sha1');
      const stream = createReadStream(filePath);

      stream.on('data', (data) => {
        hash.update(data);
      });

      stream.on('end', () => {
        resolve(hash.digest('hex').toUpperCase());
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Check resource pack status (health check)
   */
  @Get('status')
  getResourcePackStatus() {
    const exists = existsSync(this.resourcePackPath);

    if (!exists) {
      return {
        status: 'error',
        message: 'Resource pack file not found',
        available: false,
      };
    }

    const stats = statSync(this.resourcePackPath);

    return {
      status: 'ok',
      message: 'Resource pack is available and ready',
      available: true,
      size: stats.size,
      lastModified: stats.mtime,
    };
  }
}
