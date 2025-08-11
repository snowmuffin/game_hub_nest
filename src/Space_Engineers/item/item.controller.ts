import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Logger,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ItemService } from './item.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'; // Guard 경로

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    steamId: string;
    username: string;
  };
}

interface UploadItemDto {
  userId: string;
  itemName: string;
  quantity: number;
}

interface DownloadItemDto {
  steamid: string;
  index_name: string;
  quantity: number;
}

interface UpgradeItemDto {
  targetItem: string;
}

interface ItemListEntry {
  [key: string]: any; // Since we don't know the exact structure
}

@Controller('space-engineers/item') // 엔드포인트에 space_engineers 추가
export class ItemController {
  private readonly logger = new Logger(ItemController.name);

  constructor(private readonly itemService: ItemService) {}

  @Get()
  @UseGuards(JwtAuthGuard) // 인증 Guard 적용
  async getItems(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.id; // steamId 대신 id 사용
    if (!userId) {
      this.logger.error(`Authorization header is missing or invalid.`);
      throw new UnauthorizedException(
        'Authorization header is missing or invalid.',
      );
    }
    this.logger.log(`User ID from request: ${userId}`);
    return this.itemService.getItems(String(userId));
  }

  @Post('upload')
  async uploadItem(@Body() body: UploadItemDto): Promise<any> {
    const { userId, itemName, quantity } = body;
    this.logger.log(
      `POST /space_engineers/item/upload: User ID=${userId}, Item=${itemName}, Quantity=${quantity}`,
    );
    return this.itemService.uploadItem(userId, itemName, quantity);
  }

  @Post('download')
  async downloadItem(@Body() body: DownloadItemDto): Promise<any> {
    const { steamid, index_name, quantity } = body;
    this.logger.log(
      `POST /space_engineers/item/download: User ID=${steamid}, Item=${index_name}, Quantity=${quantity}`,
    );
    return this.itemService.requestDownloadItem(steamid, index_name, quantity);
  }

  @Post('download/confirm')
  async confirmDownloadItem(@Body() body: DownloadItemDto): Promise<any> {
    const { steamid, index_name, quantity } = body;
    this.logger.log(
      `POST /space_engineers/item/download/confirm: User ID=${steamid}, Item=${index_name}, Quantity=${quantity}`,
    );
    return this.itemService.confirmDownloadItem(steamid, index_name, quantity);
  }

  @Post('update-items')
  async updateItems(@Body() itemList: ItemListEntry[]): Promise<any> {
    this.logger.log(`POST /space_engineers/item/update-items`);
    return this.itemService.updateItems(itemList);
  }

  @Post('upgrade')
  @UseGuards(JwtAuthGuard)
  async upgradeItem(
    @Body() body: UpgradeItemDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<any> {
    const userId = req.user.id;
    const { targetItem } = body;
    this.logger.log(
      `POST /space_engineers/item/upgrade: User ID=${userId}, Target Item=${targetItem}`,
    );
    return this.itemService.upgradeItem(String(userId), targetItem);
  }

  @Get('blueprints')
  async getBlueprints(): Promise<any> {
    this.logger.log(`GET /space_engineers/item/blueprints`);
    return this.itemService.getBlueprints();
  }
}
