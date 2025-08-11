import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

/**
 * Currency Entity
 *
 * Represents different types of currencies used within the game hub system.
 * Currencies can be either global (real-world currencies like USD, EUR) or
 * game-specific (virtual currencies like credits, gems, coins).
 * Each currency defines its own formatting rules, decimal places, and metadata.
 */
@Entity({ name: 'currencies' })
export class Currency {
  /** Primary key - unique identifier for the currency */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Foreign key reference to the game this currency belongs to
   * NULL value indicates a global currency (e.g., USD, EUR) that can be used across all games
   */
  @Column({ type: 'int', nullable: true })
  game_id: number;

  /**
   * Unique currency code identifier (e.g., 'USD', 'SE_CREDITS', 'MC_EMERALD')
   * Used for programmatic identification and API references
   */
  @Column({ type: 'varchar', length: 10, unique: true })
  code: string;

  /**
   * Human-readable currency name (e.g., 'US Dollar', 'Space Credits', 'Emerald')
   * Displayed to users in the interface
   */
  @Column({ type: 'varchar', length: 50 })
  name: string;

  /**
   * Currency symbol for display purposes (e.g., '$', '₹', '💎')
   * Used in UI to show currency amounts with proper formatting
   */
  @Column({ type: 'varchar', length: 5, nullable: true })
  symbol: string;

  /**
   * Currency type classification
   * GLOBAL: Real-world currencies that can be used across all games (USD, EUR, etc.)
   * GAME_SPECIFIC: Virtual currencies specific to individual games (credits, gems, etc.)
   */
  @Column({
    type: 'enum',
    enum: ['GLOBAL', 'GAME_SPECIFIC'],
    default: 'GAME_SPECIFIC',
  })
  type: 'GLOBAL' | 'GAME_SPECIFIC';

  /**
   * Number of decimal places for currency precision
   * Controls how currency amounts are formatted and stored (e.g., 2 for dollars, 0 for whole units)
   */
  @Column({ type: 'int', default: 2 })
  decimal_places: number;

  /**
   * Currency activation status
   * When false, currency is temporarily disabled and cannot be used for new transactions
   */
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  /**
   * JSON object containing currency-specific additional information and configuration
   * Can include exchange rates, conversion factors, regional settings, etc.
   */
  @Column({ type: 'json', nullable: true })
  metadata: object;

  /** Many-to-one relationship: multiple currencies can belong to one game */
  @ManyToOne('Game', 'currencies', { nullable: true })
  @JoinColumn({ name: 'game_id' })
  game: any;

  /** One-to-many relationship: one currency can be used by multiple wallets */
  @OneToMany('Wallet', 'currency')
  wallets: any[];

  /** Timestamp when the currency record was created */
  @CreateDateColumn()
  created_at: Date;

  /** Timestamp when the currency record was last updated */
  @UpdateDateColumn()
  updated_at: Date;
}
