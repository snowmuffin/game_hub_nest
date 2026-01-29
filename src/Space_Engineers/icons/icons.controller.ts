import {
  Controller,
  Post,
  Body,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IconsService } from './icons.service';
import { UploadIconDto } from './icons.dto';
import { SeIngestApiKeyGuard } from '../blocks/ingest-api-key.guard';

@Controller('space-engineers/icons')
@UseGuards(SeIngestApiKeyGuard)
export class IconsController {
  private readonly logger = new Logger(IconsController.name);

  constructor(private readonly iconsService: IconsService) {}

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  async uploadIcon(@Body() dto: UploadIconDto): Promise<{
    success: boolean;
    fileName: string;
    url?: string;
    error?: string;
  }> {
    this.logger.log(
      `POST /space-engineers/icons/upload - fileName=${dto.fileName}, dataSize=${dto.data?.length || 0} chars`,
    );

    return this.iconsService.uploadIcon(dto);
  }
}
