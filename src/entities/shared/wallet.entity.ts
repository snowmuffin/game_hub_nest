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
import { Game } from './game.entity';
import { GameServer } from './game-server.entity';
import { Currency } from './currency.entity';

/**
 * Wallet Entity
 *
 * Represents a user's digital wallet for a specific currency within a game/server context.
 * Each wallet is uniquely identified by the combination of user, game, server, and currency.
 * Wallets maintain both available and locked balances to support pending transactions
 * and provide secure financial operations across the game hub system.
 */
@Entity({ name: 'wallets' })
@Index(['user_id', 'game_id', 'server_id', 'currency_id'], { unique: true })
export class Wallet {
  /** Primary key - unique identifier for the wallet */
  @PrimaryGeneratedColumn('increment')
  id: number;

  /** Foreign key reference to the user who owns this wallet */
  @Column({ type: 'int' })
  user_id: number;

  /** Foreign key reference to the game this wallet belongs to */
  @Column({ type: 'int' })
  game_id: number;

  /**
   * Foreign key reference to the specific game server
   * NULL value indicates a global wallet for the entire game
   */
  @Column({ type: 'int', nullable: true })
  server_id: number;

  /** Foreign key reference to the currency type used in this wallet */
  @Column({ type: 'int' })
  currency_id: number;

  /**
   * Current available balance in the wallet
   * High precision decimal to handle fractional currency amounts accurately
   */
  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  balance: number;

  /**
   * Amount currently locked due to pending transactions
   * Funds that are reserved but not yet processed or completed
   */
  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  locked_balance: number;

  /**
   * Wallet activation status
   * When false, wallet is temporarily disabled and cannot perform transactions
   */
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  /**
   * JSON object containing wallet-specific additional information
   * Can include last transaction time, spending limits, preferences, etc.
   */
  @Column({ type: 'json', nullable: true })
  metadata: object;

  /** Many-to-one relationship: multiple wallets belong to one user */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /** Many-to-one relationship: multiple wallets belong to one game */
  @ManyToOne(() => Game)
  @JoinColumn({ name: 'game_id' })
  game: Game;

  /** Many-to-one relationship: multiple wallets can belong to one server */
  @ManyToOne(() => GameServer, { nullable: true })
  @JoinColumn({ name: 'server_id' })
  server: GameServer;

  /** Many-to-one relationship: multiple wallets can use the same currency */
  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  /** Timestamp when the wallet was created */
  @CreateDateColumn()
  created_at: Date;

  /** Timestamp when the wallet was last updated */
  @UpdateDateColumn()
  updated_at: Date;

  /**
   * Computed property: Calculate available balance for transactions
   * Returns the total balance minus any locked/reserved funds
   */
  get available_balance(): number {
    return Number(this.balance) - Number(this.locked_balance);
  }
}
