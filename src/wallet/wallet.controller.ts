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

  // 지갑 생성 또는 조회
  @Post('create')
  async createWallet(@Body() createWalletDto: CreateWalletDto, @Request() req) {
    // 요청한 사용자의 ID로 제한
    createWalletDto.userId = req.user.id;
    return await this.walletService.getOrCreateWallet(createWalletDto);
  }

  // 내 지갑 목록 조회
  @Get('my-wallets')
  async getMyWallets(@Request() req) {
    return await this.walletService.getUserWallets(req.user.id);
  }

  // 특정 게임의 내 지갑들 조회
  @Get('my-wallets/game/:gameId')
  async getMyWalletsByGame(@Param('gameId') gameId: number, @Request() req) {
    return await this.walletService.getUserWalletsByGame(req.user.id, gameId);
  }

  // 지갑 잔액 조회
  @Get(':walletId/balance')
  async getWalletBalance(@Param('walletId') walletId: number) {
    return await this.walletService.getWalletBalance(walletId);
  }

  // 거래 실행
  @Post('transaction')
  async executeTransaction(@Body() transactionDto: WalletTransactionDto) {
    return await this.walletService.executeTransaction(transactionDto);
  }

  // 지갑 거래 내역 조회
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

  // 내 모든 거래 내역 조회
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

  // 지갑 간 전송
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
