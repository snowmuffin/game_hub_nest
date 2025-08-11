import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../shared/user.entity';
import { ValheimWorld } from './valheim-world.entity';

/**
 * ValheimCharacter Entity
 *
 * Represents a player's character in Valheim with comprehensive progression tracking.
 * Stores all character attributes including stats, skills, location, and game progress.
 * Maintains detailed records of player achievements, discoveries, and playtime statistics.
 * Each character is tied to a specific user and can be associated with different worlds,
 * providing complete character persistence across game sessions.
 */
@Entity({ name: 'characters', schema: 'valheim' })
export class ValheimCharacter {
  /** Primary key - unique identifier for the character */
  @PrimaryGeneratedColumn('increment')
  id: number;

  /** Foreign key reference to the user who owns this character */
  @Column({ type: 'bigint', nullable: false, unique: true })
  user_id: number;

  /** Foreign key reference to the Valheim world where this character exists */
  @Column({ name: 'world_id', nullable: true })
  worldId: string;

  /** Player-chosen name for the character */
  @Column({ type: 'varchar', length: 255, nullable: false })
  character_name: string;

  /** Overall character level based on experience gained */
  @Column({ type: 'integer', default: 1 })
  level: number;

  /** Total experience points accumulated by the character */
  @Column({ type: 'bigint', default: 0 })
  experience: number;

  /**
   * Character Health Points
   * Base value is 25, can be increased through gameplay progression
   */
  @Column({ type: 'integer', default: 25 })
  health: number;

  /**
   * Character Stamina Points
   * Used for running, jumping, and combat actions. Base value is 100
   */
  @Column({ type: 'integer', default: 100 })
  stamina: number;

  /**
   * Character Eitr (Magic Power)
   * Required for casting spells and using magical abilities. Base value is 25
   */
  @Column({ type: 'integer', default: 25 })
  eitr: number;

  /** Skill level for Axes weapons (0-100) */
  @Column({ type: 'integer', default: 0 })
  skill_axes: number;

  /** Skill level for Bows weapons (0-100) */
  @Column({ type: 'integer', default: 0 })
  skill_bows: number;

  /** Skill level for Clubs weapons (0-100) */
  @Column({ type: 'integer', default: 0 })
  skill_clubs: number;

  /** Skill level for Knives weapons (0-100) */
  @Column({ type: 'integer', default: 0 })
  skill_knives: number;

  /** Skill level for Polearms weapons (0-100) */
  @Column({ type: 'integer', default: 0 })
  skill_polearms: number;

  /** Skill level for Spears weapons (0-100) */
  @Column({ type: 'integer', default: 0 })
  skill_spears: number;

  /** Skill level for Swords weapons (0-100) */
  @Column({ type: 'integer', default: 0 })
  skill_swords: number;

  /** Skill level for Unarmed combat (0-100) */
  @Column({ type: 'integer', default: 0 })
  skill_unarmed: number;

  /** Skill level for Blocking with shields (0-100) */
  @Column({ type: 'integer', default: 0 })
  skill_blocking: number;

  /** Skill level for Jumping movement (0-100) */
  @Column({ type: 'integer', default: 0 })
  skill_jump: number;

  /** Skill level for Running movement (0-100) */
  @Column({ type: 'integer', default: 0 })
  skill_run: number;

  /** Skill level for Sneaking movement (0-100) */
  @Column({ type: 'integer', default: 0 })
  skill_sneak: number;

  /** Skill level for Swimming movement (0-100) */
  @Column({ type: 'integer', default: 0 })
  skill_swim: number;

  /** Skill level for Fishing activity (0-100) */
  @Column({ type: 'integer', default: 0 })
  skill_fishing: number;

  /** Skill level for Wood cutting activity (0-100) */
  @Column({ type: 'integer', default: 0 })
  skill_wood_cutting: number;

  /** Skill level for Cooking activity (0-100) */
  @Column({ type: 'integer', default: 0 })
  skill_cooking: number;

  /** Skill level for Farming activity (0-100) */
  @Column({ type: 'integer', default: 0 })
  skill_farming: number;

  /** X-coordinate position in the Valheim world */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  position_x: number;

  /** Y-coordinate position (height/elevation) in the Valheim world */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  position_y: number;

  /** Z-coordinate position in the Valheim world */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  position_z: number;

  /**
   * Current biome where the character is located
   * Examples: 'Meadows', 'Black Forest', 'Swamp', 'Mountain', 'Plains', 'Ocean'
   */
  @Column({ type: 'varchar', length: 100, default: 'Meadows' })
  current_biome: string;

  /**
   * Array of defeated boss names tracking game progression
   * Examples: ['Eikthyr', 'The Elder', 'Bonemass', 'Moder', 'Yagluth']
   */
  @Column({ type: 'json', nullable: true })
  defeated_bosses: string[];

  /**
   * Array of discovered location names for exploration tracking
   * Includes dungeons, monuments, and significant landmarks found by the player
   */
  @Column({ type: 'json', nullable: true })
  discovered_locations: string[];

  /**
   * Array of unlocked crafting recipe names
   * Tracks progression through crafting and building systems
   */
  @Column({ type: 'json', nullable: true })
  unlocked_recipes: string[];

  /** Total playtime in seconds for this character */
  @Column({ type: 'integer', default: 0 })
  play_time_seconds: number;

  /** Number of times this character has died */
  @Column({ type: 'integer', default: 0 })
  deaths: number;

  /** Total number of enemies killed by this character */
  @Column({ type: 'integer', default: 0 })
  enemies_killed: number;

  /** Total distance walked/traveled in game units */
  @Column({ type: 'integer', default: 0 })
  distance_walked: number;

  /** Total number of items crafted by this character */
  @Column({ type: 'integer', default: 0 })
  items_crafted: number;

  /**
   * JSON object containing additional character metadata
   * Can store custom achievements, preferences, or game-specific data
   */
  @Column({ type: 'json', nullable: true })
  metadata: any;

  /**
   * Character status indicating if it's currently active/playable
   * False when character is deleted or archived
   */
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  /** Timestamp when the character was created */
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  /** Timestamp when the character was last updated */
  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  /** One-to-one relationship: each character belongs to one user */
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  /** Many-to-one relationship: multiple characters can exist in the same world */
  @ManyToOne(() => ValheimWorld)
  @JoinColumn({ name: 'world_id' })
  world: ValheimWorld;
}
