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
 * GameServer Entity
 *
 * Represents a game server instance within the game hub system.
 * Each server belongs to a specific game and can host multiple user wallets.
 * Servers can be configured with different types (main, creative, survival, etc.)
 * and can be activated or deactivated as needed.
 */
@Entity({ name: 'game_servers' })
export class GameServer {
  /** Primary key - unique identifier for the game server */
  @PrimaryGeneratedColumn()
  id: number;

  /** Foreign key reference to the game this server belongs to */
  @Column({ type: 'int' })
  game_id: number;

  /** Foreign key reference to the primary currency used by this server */
  @Column({ type: 'int', nullable: true })
  currency_id: number;

  /**
   * Server code identifier (e.g., 'main', 'creative', 'survival')
   * Used for programmatic identification and routing
   */
  @Column({ type: 'varchar', length: 50 })
  code: string;

  /**
   * Human-readable server name (e.g., 'Main Server', 'Creative Server')
   * Displayed to users in the interface
   */
  @Column({ type: 'varchar', length: 100 })
  name: string;

  /** Optional detailed description of the server's purpose and features */
  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  /** Server connection URL or IP address for client connections */
  @Column({ type: 'varchar', length: 255, nullable: true })
  server_url: string;

  /** Network port number for server connections */
  @Column({ type: 'int', nullable: true })
  port: number;

  /**
   * Server activation status
   * When false, server is temporarily disabled and unavailable to users
   */
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  /**
   * JSON object containing server-specific configuration and metadata
   * Can include server rules, settings, mod configurations, etc.
   */
  @Column({ type: 'json', nullable: true })
  metadata: object;

  /** Many-to-one relationship: multiple servers can belong to one game */
  @ManyToOne('Game', 'servers')
  @JoinColumn({ name: 'game_id' })
  game: any;

  /** One-to-many relationship: one server can host multiple user wallets */
  @OneToMany('Wallet', 'server')
  wallets: any[];

  /** Timestamp when the server record was created */
  @CreateDateColumn()
  created_at: Date;

  /** One-to-one relationship: one server has one primary currency */
  @ManyToOne('Currency')
  @JoinColumn({ name: 'currency_id' })
  currency: any;

  /** Timestamp when the server record was last updated */
  @UpdateDateColumn()
  updated_at: Date;
}
