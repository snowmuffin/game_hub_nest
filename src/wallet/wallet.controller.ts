import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  WalletService,
  CreateWalletDto,
  WalletTransactionDto,
} from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // Create or fetch a wallet
  @Post('create')
  async createWallet(@Body() createWalletDto: CreateWalletDto, @Request() req) {
    // Restrict to the requesting user's ID
    createWalletDto.userId = req.user.id;
    return await this.walletService.getOrCreateWallet(createWalletDto);
  }

  // Get my wallets
  @Get('my-wallets')
  async getMyWallets(@Request() req) {
    return await this.walletService.getUserWallets(req.user.id);
  }

  // Get my wallets for a specific game
  @Get('my-wallets/game/:gameId')
  async getMyWalletsByGame(@Param('gameId') gameId: number, @Request() req) {
    return await this.walletService.getUserWalletsByGame(req.user.id, gameId);
  }

  // Get wallet balance
  @Get(':walletId/balance')
  async getWalletBalance(@Param('walletId') walletId: number) {
    return await this.walletService.getWalletBalance(walletId);
  }

  // Execute a transaction
  @Post('transaction')
  async executeTransaction(@Body() transactionDto: WalletTransactionDto) {
    return await this.walletService.executeTransaction(transactionDto);
  }

  // Get wallet transaction history
  @Get(':walletId/transactions')
  async getWalletTransactions(
    @Param('walletId') walletId: number,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ) {
    return await this.walletService.getWalletTransactions(
      walletId,
      limit,
      offset,
    );
  }

  // Get all my transaction history
  @Get('my-transactions')
  async getMyTransactions(
    @Request() req,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ) {
    return await this.walletService.getUserTransactions(
      req.user.id,
      limit,
      offset,
    );
  }

  // Transfer between wallets
  @Post('transfer')
  async transferBetweenWallets(
    @Body()
    transferDto: {
      fromWalletId: number;
      toWalletId: number;
      amount: number;
      description?: string;
    },
  ) {
    return await this.walletService.transferBetweenWallets(
      transferDto.fromWalletId,
      transferDto.toWalletId,
      transferDto.amount,
      transferDto.description,
    );
  }
}
