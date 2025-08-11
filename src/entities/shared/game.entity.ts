import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

/**
 * Game Entity
 *
 * Represents a game supported by the game hub platform.
 * Each game can have multiple servers, currencies, and associated user data.
 * This entity serves as the central registry for all supported games,
 * enabling multi-game platform functionality with game-specific configurations.
 */
@Entity({ name: 'games' })
export class Game {
  /** Primary key - unique identifier for the game */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Unique game code identifier used for programmatic references
   * Examples: 'space_engineers', 'minecraft', 'valheim'
   * Used in API endpoints, database schemas, and internal routing
   */
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  /**
   * Human-readable game name displayed in the user interface
   * Examples: 'Space Engineers', 'Minecraft', 'Valheim'
   */
  @Column({ type: 'varchar', length: 100 })
  name: string;

  /** Optional detailed description of the game and its features */
  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  /** URL to the game's icon/logo image for UI display */
  @Column({ type: 'varchar', length: 255, nullable: true })
  icon_url: string;

  /**
   * Game activation status
   * When false, the game is temporarily disabled and hidden from users
   * Allows for maintenance or phased rollouts of new games
   */
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  /** One-to-many relationship: one game can have multiple servers */
  @OneToMany('GameServer', 'game')
  servers: any[];

  /** Timestamp when the game record was created */
  @CreateDateColumn()
  created_at: Date;

  /** Timestamp when the game record was last updated */
  @UpdateDateColumn()
  updated_at: Date;
}
