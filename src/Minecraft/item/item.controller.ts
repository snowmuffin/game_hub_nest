import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ItemService } from './item.service';

@Controller('api/minecraft/item')
@UseGuards(JwtAuthGuard)
export class ItemController {
  private readonly logger = new Logger(ItemController.name);

  constructor(private readonly itemService: ItemService) {}

  @Get()
  async getItems(@Request() req) {
    const userId = req.user.id;
    this.logger.log(`User ID from request: ${userId}`);
    return this.itemService.getItems(userId);
  }

  @Post('upload')
  async uploadItem(
    @Request() req,
    @Body() body: { identifier: string; quantity: number },
  ) {
    const userId = req.user.id;
    return this.itemService.uploadItem(userId, body.identifier, body.quantity);
  }

  @Post('request-download')
  async requestDownloadItem(
    @Request() req,
    @Body() body: { index_name: string; quantity: number },
  ) {
    const steamid = req.user.id;
    return this.itemService.requestDownloadItem(
      steamid,
      body.index_name,
      body.quantity,
    );
  }

  @Post('confirm-download')
  async confirmDownloadItem(
    @Request() req,
    @Body() body: { index_name: string; quantity: number },
  ) {
    const steamid = req.user.id;
    return this.itemService.confirmDownloadItem(
      steamid,
      body.index_name,
      body.quantity,
    );
  }

  @Post('cancel-download')
  async cancelDownloadItem(
    @Request() req,
    @Body() body: { index_name: string; quantity: number },
  ) {
    const steamid = req.user.id;
    return this.itemService.cancelDownloadItem(
      steamid,
      body.index_name,
      body.quantity,
    );
  }

  @Get('blueprints')
  async getBlueprints() {
    return this.itemService.getBlueprints();
  }

  @Post('update')
  async updateItems(@Body() body: { items: any[] }) {
    return this.itemService.updateItems(body.items);
  }
}
