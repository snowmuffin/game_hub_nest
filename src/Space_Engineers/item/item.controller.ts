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
import { ItemService } from './item.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'; // Guard path

type AuthenticatedRequest = { user?: { id?: number } };

type UploadItemBody = {
  userId: number;
  itemName: string;
  quantity: number;
};

type DownloadItemBody = {
  steamid: string;
  index_name: string;
  quantity: number;
};

type UpgradeItemBody = { targetItem: string };

type UpdateItemsPayload = Array<Record<string, unknown>>;

@Controller('space-engineers/item') // Add space_engineers to endpoint path
export class ItemController {
  private readonly logger = new Logger(ItemController.name);

  constructor(private readonly itemService: ItemService) {}

  @Get()
  @UseGuards(JwtAuthGuard) // Apply auth guard
  async getItems(@Req() req: AuthenticatedRequest): Promise<unknown> {
    const userId = req.user?.id; // Use user id instead of steamId
    if (!userId) {
      this.logger.error(`Authorization header is missing or invalid.`);
      throw new UnauthorizedException(
        'Authorization header is missing or invalid.',
      );
    }
    this.logger.log(`User ID from request: ${userId}`);
    return this.itemService.getItems(userId);
  }

  @Post('upload')
  async uploadItem(@Body() body: UploadItemBody): Promise<unknown> {
    const { userId, itemName, quantity } = body;
    this.logger.log(
      `POST /space_engineers/item/upload: User ID=${userId}, Item=${itemName}, Quantity=${quantity}`,
    );
    return this.itemService.uploadItem(userId, itemName, quantity);
  }

  @Post('download')
  async downloadItem(@Body() body: DownloadItemBody): Promise<unknown> {
    const { steamid, index_name, quantity } = body;
    this.logger.log(
      `POST /space_engineers/item/download: User ID=${steamid}, Item=${index_name}, Quantity=${quantity}`,
    );
    return this.itemService.requestDownloadItem(steamid, index_name, quantity);
  }

  @Post('download/confirm')
  async confirmDownloadItem(@Body() body: DownloadItemBody): Promise<unknown> {
    const { steamid, index_name, quantity } = body;
    this.logger.log(
      `POST /space_engineers/item/download/confirm: User ID=${steamid}, Item=${index_name}, Quantity=${quantity}`,
    );
    return this.itemService.confirmDownloadItem(steamid, index_name, quantity);
  }

  @Post('update-items')
  async updateItems(@Body() itemList: UpdateItemsPayload): Promise<unknown> {
    this.logger.log(`POST /space_engineers/item/update-items`);
    return this.itemService.updateItems(itemList);
  }

  @Post('upgrade')
  @UseGuards(JwtAuthGuard)
  async upgradeItem(
    @Body() body: UpgradeItemBody,
    @Req() req: { user: { id: number } },
  ): Promise<unknown> {
    const userId = req.user.id;
    const { targetItem } = body;
    this.logger.log(
      `POST /space_engineers/item/upgrade: User ID=${userId}, Target Item=${targetItem}`,
    );
    return this.itemService.upgradeItem(userId, targetItem);
  }

  @Get('blueprints')
  getBlueprints(): unknown {
    this.logger.log(`GET /space_engineers/item/blueprints`);
    return this.itemService.getBlueprints();
  }
}
