import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { HangarService } from './hangar.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ConfirmUploadDto, IssueUploadUrlDto } from './hangar.dto';

@Controller('space-engineers/hangar')
@UseGuards(JwtAuthGuard)
export class HangarController {
  constructor(private readonly hangar: HangarService) {}

  @Post('upload-url')
  async issueUploadUrl(
    @Req() req: { user: { id: number } },
    @Body() dto: IssueUploadUrlDto,
  ) {
    const userId = req.user.id;
    return this.hangar.issueUploadUrl(userId, dto);
  }

  @Post('confirm')
  async confirmUpload(
    @Req() req: { user: { id: number } },
    @Body() dto: ConfirmUploadDto,
  ) {
    const userId = req.user.id;
    return this.hangar.confirmUpload(userId, dto);
  }

  @Get('list')
  async listMine(@Req() req: { user: { id: number } }) {
    const userId = req.user.id;
    return this.hangar.listByUser(userId);
  }

  @Get(':id/download-url')
  async getDownloadUrl(
    @Req() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user.id;
    return this.hangar.issueDownloadUrl(userId, id);
  }

  @Delete(':id')
  async delete(
    @Req() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user.id;
    return this.hangar.softDelete(userId, id);
  }
}
