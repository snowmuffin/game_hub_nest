import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { WalletTransaction } from '../entities/wallet-transaction.entity';
import { User } from '../user/user.entity';
import { Game } from '../entities/game.entity';
import { GameServer } from '../entities/game-server.entity';
import { Currency } from '../entities/currency.entity';

export interface CreateWalletDto {
  userId: number;
  gameId: number;
  serverId?: number;
  currencyId: number;
}

export interface WalletTransactionDto {
  walletId: number;
  type:
    | 'DEPOSIT'
    | 'WITHDRAW'
    | 'TRANSFER_IN'
    | 'TRANSFER_OUT'
    | 'PURCHASE'
    | 'SALE'
    | 'REWARD'
    | 'PENALTY';
  amount: number;
  description?: string;
  referenceId?: string;
  metadata?: object;
}

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private transactionRepository: Repository<WalletTransaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @InjectRepository(GameServer)
    private serverRepository: Repository<GameServer>,
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,
    private dataSource: DataSource,
  ) {}

  // Create or retrieve wallet
  async getOrCreateWallet(dto: CreateWalletDto): Promise<Wallet> {
    // Check existing wallet
    const whereCondition = dto.serverId
      ? {
          user_id: dto.userId,
          game_id: dto.gameId,
          currency_id: dto.currencyId,
          server_id: dto.serverId,
        }
      : {
          user_id: dto.userId,
          game_id: dto.gameId,
          currency_id: dto.currencyId,
          server_id: IsNull(),
        };

    const wallet = await this.walletRepository.findOne({
      where: whereCondition,
      relations: ['user', 'game', 'server', 'currency'],
    });

    if (wallet) {
      return wallet;
    }

    // Verify required entities exist
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const game = await this.gameRepository.findOne({
      where: { id: dto.gameId },
    });
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const currency = await this.currencyRepository.findOne({
      where: { id: dto.currencyId },
    });
    if (!currency) {
      throw new NotFoundException('Currency not found');
    }

    if (dto.serverId) {
      const server = await this.serverRepository.findOne({
        where: { id: dto.serverId, game_id: dto.gameId },
      });
      if (!server) {
        throw new NotFoundException(
          'Server not found or does not belong to the specified game',
        );
      }
    }

    // Create new wallet
    const newWallet = new Wallet();
    newWallet.user_id = dto.userId;
    newWallet.game_id = dto.gameId;
    newWallet.currency_id = dto.currencyId;
    newWallet.balance = 0;
    newWallet.locked_balance = 0;
    newWallet.is_active = true;

    if (dto.serverId) {
      newWallet.server_id = dto.serverId;
    }

    return await this.walletRepository.save(newWallet);
  }

  // Retrieve all wallets for a user
  async getUserWallets(userId: number): Promise<Wallet[]> {
    return await this.walletRepository.find({
      where: { user_id: userId, is_active: true },
      relations: ['game', 'server', 'currency'],
      order: { created_at: 'DESC' },
    });
  }

  // Retrieve wallets for a specific game
  async getUserWalletsByGame(
    userId: number,
    gameId: number,
  ): Promise<Wallet[]> {
    return await this.walletRepository.find({
      where: { user_id: userId, game_id: gameId, is_active: true },
      relations: ['game', 'server', 'currency'],
      order: { created_at: 'DESC' },
    });
  }

  // Execute wallet transaction
  async executeTransaction(
    dto: WalletTransactionDto,
  ): Promise<WalletTransaction> {
    return await this.dataSource.transaction(async (manager) => {
      // Retrieve and lock wallet
      const wallet = await manager.findOne(Wallet, {
        where: { id: dto.walletId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      const currentBalance = Number(wallet.balance);
      const amount = Number(dto.amount);
      let newBalance: number;

      // Calculate balance based on transaction type
      switch (dto.type) {
        case 'DEPOSIT':
        case 'TRANSFER_IN':
        case 'SALE':
        case 'REWARD':
          newBalance = currentBalance + amount;
          break;
        case 'WITHDRAW':
        case 'TRANSFER_OUT':
        case 'PURCHASE':
        case 'PENALTY':
          if (currentBalance < amount) {
            throw new BadRequestException('Insufficient balance');
          }
          newBalance = currentBalance - amount;
          break;
        default:
          throw new BadRequestException('Invalid transaction type');
      }

      // Update wallet balance
      wallet.balance = newBalance;
      await manager.save(wallet);

      // Create transaction record
      const transaction = manager.create(WalletTransaction, {
        wallet_id: dto.walletId,
        user_id: wallet.user_id,
        transaction_type: dto.type,
        amount: amount,
        balance_before: currentBalance,
        balance_after: newBalance,
        description: dto.description,
        reference_id: dto.referenceId,
        status: 'COMPLETED',
        metadata: dto.metadata,
      });

      return await manager.save(transaction);
    });
  }

  // Retrieve wallet transaction history
  async getWalletTransactions(
    walletId: number,
    limit: number = 50,
    offset: number = 0,
  ): Promise<WalletTransaction[]> {
    return await this.transactionRepository.find({
      where: { wallet_id: walletId },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  // Retrieve all transaction history for a user
  async getUserTransactions(
    userId: number,
    limit: number = 50,
    offset: number = 0,
  ): Promise<WalletTransaction[]> {
    return await this.transactionRepository.find({
      where: { user_id: userId },
      relations: ['wallet', 'wallet.game', 'wallet.server', 'wallet.currency'],
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  // Transfer between wallets
  async transferBetweenWallets(
    fromWalletId: number,
    toWalletId: number,
    amount: number,
    description?: string,
  ): Promise<{
    fromTransaction: WalletTransaction;
    toTransaction: WalletTransaction;
  }> {
    // Withdrawal transaction
    const fromTransaction = await this.executeTransaction({
      walletId: fromWalletId,
      type: 'TRANSFER_OUT',
      amount: amount,
      description: description || `Transfer to wallet ${toWalletId}`,
      referenceId: `transfer_${Date.now()}`,
    });

    // Deposit transaction
    const toTransaction = await this.executeTransaction({
      walletId: toWalletId,
      type: 'TRANSFER_IN',
      amount: amount,
      description: description || `Transfer from wallet ${fromWalletId}`,
      referenceId: fromTransaction.reference_id,
    });

    return { fromTransaction, toTransaction };
  }

  // Retrieve wallet balance
  async getWalletBalance(walletId: number): Promise<{
    balance: number;
    locked_balance: number;
    available_balance: number;
  }> {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const balance = Number(wallet.balance);
    const locked_balance = Number(wallet.locked_balance);

    return {
      balance,
      locked_balance,
      available_balance: balance - locked_balance,
    };
  }
}
