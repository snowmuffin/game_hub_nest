import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TradeService } from './trade.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/trade')
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @Get('marketplace')
  async getMarketplaceItems(@Body() body: { myMarket: boolean }) {
    return this.tradeService.getMarketplaceItems(body.myMarket);
  }

  @Post('purchase')
  @UseGuards(AuthGuard('jwt'))
  async purchaseItem(@Body() itemsToPurchase: any) {
    return this.tradeService.purchaseItem(itemsToPurchase);
  }

  @Post('register')
  @UseGuards(AuthGuard('jwt'))
  async registerItem(@Body() itemData: { itemName: string; price: number; quantity: number }) {
    return this.tradeService.registerItem(itemData);
  }

  @Post('cancel')
  @UseGuards(AuthGuard('jwt'))
  async cancelMarketplaceItem(@Body() body: { itemId: number; quantity: number }) {
    return this.tradeService.cancelMarketplaceItem(body);
  }
}