import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MuffinCraftService } from './muffincraft.service';
import { MuffinCraftPlayerGuard } from './auth/muffincraft-player.guard';

@Controller('muffincraft')
@UseGuards(MuffinCraftPlayerGuard)
export class MuffinCraftController {
  constructor(private readonly muffinCraftService: MuffinCraftService) {}

  @Get('status')
  getStatus() {
    return this.muffinCraftService.getStatus();
  }

  @Get('currency')
  getUserCurrency(@Request() req) {
    return this.muffinCraftService.getPlayerCurrency(req.user);
  }

  @Post('currency')
  updateUserCurrency(@Request() req, @Body() currencyData: any) {
    return this.muffinCraftService.updatePlayerCurrency(req.user, currencyData);
  }

  /**
   * 기존 API 호환성 유지 (구 버전 클라이언트용)
   */
  @Get('user/:userId/currency')
  getUserCurrencyById(@Param('userId') userId: string) {
    return this.muffinCraftService.getUserCurrency(userId);
  }

  @Post('user/:userId/currency')
  updateUserCurrencyById(
    @Param('userId') userId: string,
    @Body() currencyData: any,
  ) {
    return this.muffinCraftService.updateUserCurrency(userId, currencyData);
  }
}
