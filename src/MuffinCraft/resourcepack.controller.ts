import { Controller, Get, Header, Res, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { createReadStream, existsSync, statSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

@Controller('muffincraft/resourcepack')
export class ResourcePackController {
  private readonly logger = new Logger(ResourcePackController.name);
  private readonly resourcePackPath: string;

  constructor() {
    // 여러 경로를 시도해서 파일을 찾기
    const possiblePaths = [
      // 프로덕션 환경 (dist 폴더)
      join(__dirname, 'resources', 'muffincraft-resourcepack.zip'),
      join(process.cwd(), 'dist', 'src', 'MuffinCraft', 'resources', 'muffincraft-resourcepack.zip'),
      // 개발 환경 (src 폴더)
      join(process.cwd(), 'src', 'MuffinCraft', 'resources', 'muffincraft-resourcepack.zip'),
      // 백업 경로
      join(process.cwd(), 'resources', 'muffincraft-resourcepack.zip')
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
      this.logger.log(`✅ 리소스팩 파일을 찾았습니다: ${this.resourcePackPath}`);
    } else {
      this.resourcePackPath = possiblePaths[0]; // 기본값
      this.logger.error('❌ 리소스팩 파일을 찾을 수 없습니다!');
      this.logger.error('시도한 경로들:');
      possiblePaths.forEach((path, index) => {
        this.logger.error(`  ${index + 1}. ${path} - 존재여부: ${existsSync(path)}`);
      });
    }
  }

  /**
   * 리소스팩 ZIP 파일을 다운로드합니다
   */
  @Get('download')
  @Header('Content-Type', 'application/zip')
  @Header('Content-Disposition', 'attachment; filename="muffincraft-resourcepack.zip"')
  @Header('Cache-Control', 'public, max-age=3600') // 1시간 캐시
  async downloadResourcePack(@Res() res: Response) {
    try {
      // 파일 존재 확인
      if (!existsSync(this.resourcePackPath)) {
        this.logger.error(`리소스팩 파일을 찾을 수 없습니다: ${this.resourcePackPath}`);
        throw new HttpException('리소스팩 파일을 찾을 수 없습니다', HttpStatus.NOT_FOUND);
      }

      // 파일 크기 확인
      const stats = statSync(this.resourcePackPath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      
      if (fileSizeInMB > 50) {
        this.logger.warn(`리소스팩 파일이 너무 큽니다: ${fileSizeInMB.toFixed(2)}MB`);
      }

      // 헤더 설정
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Accept-Ranges', 'bytes');
      
      this.logger.log(`리소스팩 다운로드 시작: ${this.resourcePackPath} (${fileSizeInMB.toFixed(2)}MB)`);

      // 파일 스트림 생성 및 전송
      const stream = createReadStream(this.resourcePackPath);
      
      stream.on('error', (error) => {
        this.logger.error(`리소스팩 스트림 오류: ${error.message}`);
        if (!res.headersSent) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: '파일 전송 중 오류가 발생했습니다',
            error: error.message
          });
        }
      });

      stream.on('end', () => {
        this.logger.log('리소스팩 다운로드 완료');
      });

      stream.pipe(res);

    } catch (error) {
      this.logger.error(`리소스팩 다운로드 오류: ${error.message}`);
      
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: '리소스팩 다운로드 중 오류가 발생했습니다',
          error: error.message
        });
      }
    }
  }

  /**
   * 리소스팩 정보를 반환합니다 (SHA-1 해시, 크기 등)
   */
  @Get('info')
  async getResourcePackInfo() {
    try {
      if (!existsSync(this.resourcePackPath)) {
        throw new HttpException('리소스팩 파일을 찾을 수 없습니다', HttpStatus.NOT_FOUND);
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
        description: 'MuffinCraft 커스텀 아이템 리소스팩'
      };

    } catch (error) {
      this.logger.error(`리소스팩 정보 조회 오류: ${error.message}`);
      throw new HttpException('리소스팩 정보를 가져올 수 없습니다', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 파일의 SHA-1 해시를 계산합니다
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
   * 리소스팩 상태를 확인합니다 (헬스체크)
   */
  @Get('status')
  async getResourcePackStatus() {
    const exists = existsSync(this.resourcePackPath);
    
    if (!exists) {
      return {
        status: 'error',
        message: '리소스팩 파일을 찾을 수 없습니다',
        available: false
      };
    }

    const stats = statSync(this.resourcePackPath);
    
    return {
      status: 'ok',
      message: '리소스팩이 정상적으로 사용 가능합니다',
      available: true,
      size: stats.size,
      lastModified: stats.mtime
    };
  }
}
