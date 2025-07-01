import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MuffinCraftService } from './muffincraft.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('muffincraft')
@UseGuards(JwtAuthGuard)
export class MuffinCraftController {
  constructor(private readonly muffinCraftService: MuffinCraftService) {}

  @Get('status')
  getStatus() {
    return this.muffinCraftService.getStatus();
  }

  @Get('user/:userId/currency')
  getUserCurrency(@Param('userId') userId: string) {
    return this.muffinCraftService.getUserCurrency(userId);
  }

  @Post('user/:userId/currency')
  updateUserCurrency(
    @Param('userId') userId: string,
    @Body() currencyData: any
  ) {
    return this.muffinCraftService.updateUserCurrency(userId, currencyData);
  }
}
