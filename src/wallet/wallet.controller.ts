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

interface AuthenticatedRequest {
  user: {
    id: number;
    steam_id: string;
    username: string;
  };
}

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // Create or get wallet
  @Post('create')
  async createWallet(
    @Body() createWalletDto: CreateWalletDto,
    @Request() req: AuthenticatedRequest,
  ) {
    // Limit to requesting user's ID
    createWalletDto.userId = req.user.id;
    return await this.walletService.getOrCreateWallet(createWalletDto);
  }

  // Get my wallet list
  @Get('my-wallets')
  async getMyWallets(@Request() req: AuthenticatedRequest) {
    return await this.walletService.getUserWallets(req.user.id);
  }

  // Get my wallets for specific game
  @Get('my-wallets/game/:gameId')
  async getMyWalletsByGame(
    @Param('gameId') gameId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return await this.walletService.getUserWalletsByGame(req.user.id, gameId);
  }

  // Get wallet balance
  @Get(':walletId/balance')
  async getWalletBalance(@Param('walletId') walletId: number) {
    return await this.walletService.getWalletBalance(walletId);
  }

  // Execute transaction
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
    @Request() req: AuthenticatedRequest,
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
