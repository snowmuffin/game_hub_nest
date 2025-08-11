import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Wallet } from './wallet.entity';

/**
 * WalletTransaction Entity
 *
 * Represents individual financial transactions within user wallets.
 * Maintains a complete audit trail of all wallet activities including
 * deposits, withdrawals, transfers, purchases, and rewards.
 * Each transaction records balance changes and provides full traceability
 * for financial operations across the game hub system.
 */
@Entity({ name: 'wallet_transactions' })
@Index(['wallet_id', 'created_at'])
@Index(['user_id', 'created_at'])
@Index(['transaction_type', 'created_at'])
export class WalletTransaction {
  /** Primary key - unique identifier for the transaction */
  @PrimaryGeneratedColumn('increment')
  id: number;

  /** Foreign key reference to the wallet involved in this transaction */
  @Column({ type: 'int' })
  wallet_id: number;

  /** Foreign key reference to the user who initiated or is affected by this transaction */
  @Column({ type: 'int' })
  user_id: number;

  /**
   * Type of transaction being performed
   * DEPOSIT: Adding funds to wallet
   * WITHDRAW: Removing funds from wallet
   * TRANSFER_IN: Receiving funds from another wallet
   * TRANSFER_OUT: Sending funds to another wallet
   * PURCHASE: Buying items or services
   * SALE: Selling items or services
   * REWARD: Receiving bonus or achievement rewards
   * PENALTY: Deducting funds as penalty or fee
   */
  @Column({
    type: 'enum',
    enum: [
      'DEPOSIT',
      'WITHDRAW',
      'TRANSFER_IN',
      'TRANSFER_OUT',
      'PURCHASE',
      'SALE',
      'REWARD',
      'PENALTY',
    ],
  })
  transaction_type:
    | 'DEPOSIT'
    | 'WITHDRAW'
    | 'TRANSFER_IN'
    | 'TRANSFER_OUT'
    | 'PURCHASE'
    | 'SALE'
    | 'REWARD'
    | 'PENALTY';

  /**
   * Transaction amount (positive for credits, negative for debits)
   * High precision decimal to handle fractional currency amounts accurately
   */
  @Column({ type: 'decimal', precision: 20, scale: 8 })
  amount: number;

  /**
   * Wallet balance before this transaction was processed
   * Used for audit trail and balance verification
   */
  @Column({ type: 'decimal', precision: 20, scale: 8 })
  balance_before: number;

  /**
   * Wallet balance after this transaction was processed
   * Should equal balance_before + amount for proper accounting
   */
  @Column({ type: 'decimal', precision: 20, scale: 8 })
  balance_after: number;

  /**
   * Human-readable description of the transaction
   * Provides context about what the transaction was for
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  /**
   * External reference identifier linking to related entities
   * Could reference order IDs, item IDs, game events, etc.
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  reference_id: string;

  /**
   * Current status of the transaction
   * PENDING: Transaction initiated but not yet processed
   * COMPLETED: Transaction successfully processed
   * FAILED: Transaction failed due to insufficient funds or other errors
   * CANCELLED: Transaction was cancelled before completion
   */
  @Column({
    type: 'enum',
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
    default: 'COMPLETED',
  })
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

  /**
   * JSON object containing transaction-specific additional information
   * Can include fees, exchange rates, game-specific data, etc.
   */
  @Column({ type: 'json', nullable: true })
  metadata: object;

  /** Many-to-one relationship: multiple transactions belong to one wallet */
  @ManyToOne(() => Wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  /** Many-to-one relationship: multiple transactions belong to one user */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  /** Timestamp when the transaction was created */
  @CreateDateColumn()
  created_at: Date;

  /** Timestamp when the transaction was last updated */
  @UpdateDateColumn()
  updated_at: Date;
}
