import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { GameServer } from '../shared/game-server.entity';
import { ValheimCharacter } from './valheim-character.entity';

/**
 * ValheimWorld Entity
 *
 * Represents a Valheim game world with all its persistent state and configuration.
 * Each world is procedurally generated based on a seed and maintains its own
 * progression, time cycle, weather patterns, and player achievements.
 * Tracks global world state including boss defeats, discovered locations,
 * and environmental conditions that affect all players in the world.
 */
@Entity({ name: 'worlds', schema: 'valheim' })
export class ValheimWorld {
  /** Primary key - unique UUID identifier for the world */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Foreign key reference to the game server hosting this world */
  @Column({ name: 'server_id' })
  serverId: string;

  /** Player-assigned name for the world */
  @Column({ name: 'world_name', length: 100 })
  worldName: string;

  /**
   * Procedural generation seed used to create the world
   * Same seed will always generate identical world layouts
   */
  @Column({ name: 'world_seed', length: 50 })
  worldSeed: string;

  /**
   * World size in game units (radius from center)
   * Default 10000 creates a substantial explorable area
   */
  @Column({ name: 'world_size', default: 10000 })
  worldSize: number;

  /**
   * Number of days that have passed in the world
   * Affects certain game events and seasonal mechanics
   */
  @Column({ name: 'day_count', default: 1 })
  dayCount: number;

  /**
   * Current time of day as a decimal (0.0 = midnight, 0.5 = noon, 1.0 = midnight)
   * Controls lighting, enemy spawns, and other time-dependent mechanics
   */
  @Column({ name: 'time_of_day', type: 'float', default: 0.5 })
  timeOfDay: number;

  /**
   * Array of boss names that have been defeated in this world
   * Examples: ['Eikthyr', 'The Elder', 'Bonemass', 'Moder', 'Yagluth']
   * Unlocks world progression and new areas/items
   */
  @Column({ name: 'defeated_bosses', type: 'json', default: '[]' })
  defeatedBosses: string[];

  /**
   * Array of location names that have been discovered by any player
   * Includes dungeons, monuments, and significant landmarks
   */
  @Column({ name: 'discovered_locations', type: 'json', default: '[]' })
  discoveredLocations: string[];

  /**
   * Array of global progression keys unlocked in the world
   * Keys unlock new recipes, areas, or gameplay mechanics
   */
  @Column({ name: 'global_keys', type: 'json', default: '[]' })
  globalKeys: string[];

  /**
   * Current weather state affecting the entire world
   * Examples: 'Clear', 'Rain', 'Storm', 'Snow', 'Fog'
   * Affects visibility, movement, and gameplay mechanics
   */
  @Column({ name: 'weather_state', length: 50, default: 'Clear' })
  weatherState: string;

  /**
   * Whether this world is in hardcore mode
   * Hardcore mode typically has permanent character death
   */
  @Column({ name: 'is_hardcore', default: false })
  isHardcore: boolean;

  /** Current number of players active in the world */
  @Column({ name: 'player_count', default: 0 })
  playerCount: number;

  /** Maximum number of players allowed in the world simultaneously */
  @Column({ name: 'max_players', default: 10 })
  maxPlayers: number;

  /**
   * JSON object containing additional world-specific metadata
   * Can store custom events, server settings, or extended world state
   */
  @Column({ name: 'world_data', type: 'json', nullable: true })
  worldData: Record<string, any>;

  /** Timestamp when the world was created */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /** Timestamp when the world was last updated */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /** Many-to-one relationship: multiple worlds can exist on one server */
  @ManyToOne(() => GameServer)
  @JoinColumn({ name: 'server_id' })
  server: GameServer;

  /** One-to-many relationship: one world can host multiple characters */
  @OneToMany(() => ValheimCharacter, (character) => character.world)
  characters: ValheimCharacter[];
}

/**
 * ValheimBiome Entity
 *
 * Represents individual biome regions within a Valheim world.
 * Each biome has unique characteristics, resources, enemies, and challenges.
 * Tracks exploration progress and specific biome data for world mapping
 * and progression tracking. Biomes are procedurally placed during world generation.
 */
@Entity({ name: 'biomes', schema: 'valheim' })
export class ValheimBiome {
  /** Primary key - unique UUID identifier for the biome region */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Foreign key reference to the world containing this biome */
  @Column({ name: 'world_id' })
  worldId: string;

  /**
   * Name of the biome type
   * Examples: 'Meadows', 'BlackForest', 'Swamp', 'Mountains', 'Plains',
   * 'Ocean', 'Mistlands', 'DeepNorth', 'Ashlands'
   */
  @Column({ name: 'biome_name', length: 50 })
  biomeName: string;

  /** X-coordinate of the biome's center position in the world */
  @Column({ name: 'position_x', type: 'float' })
  positionX: number;

  /** Y-coordinate of the biome's center position in the world */
  @Column({ name: 'position_y', type: 'float' })
  positionY: number;

  /** Radius of the biome area from its center point */
  @Column({ name: 'size_radius', type: 'float' })
  sizeRadius: number;

  /**
   * Whether this biome has been discovered/visited by any player
   * Unlocks the biome on the world map and enables resource tracking
   */
  @Column({ name: 'is_explored', default: false })
  isExplored: boolean;

  /**
   * Percentage of the biome area that has been explored (0.0 to 1.0)
   * Tracks detailed exploration progress for completion tracking
   */
  @Column({ name: 'exploration_percentage', type: 'float', default: 0 })
  explorationPercentage: number;

  /**
   * JSON object containing biome-specific metadata
   * Can store resource spawns, unique features, or custom biome properties
   */
  @Column({ name: 'biome_data', type: 'json', nullable: true })
  biomeData: Record<string, any>;

  /** Timestamp when the biome record was created */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /** Timestamp when the biome record was last updated */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /** Many-to-one relationship: multiple biomes belong to one world */
  @ManyToOne(() => ValheimWorld)
  @JoinColumn({ name: 'world_id' })
  world: ValheimWorld;
}

/**
 * ValheimBossEncounter Entity
 *
 * Represents boss encounters and their locations within Valheim worlds.
 * Tracks boss spawn locations, defeat status, and player participation.
 * Maintains historical records of boss attempts and victories for
 * world progression tracking and player achievement systems.
 */
@Entity({ name: 'boss_encounters', schema: 'valheim' })
export class ValheimBossEncounter {
  /** Primary key - unique UUID identifier for the boss encounter */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Foreign key reference to the world where this boss encounter exists */
  @Column({ name: 'world_id' })
  worldId: string;

  /**
   * Name of the boss for this encounter
   * Examples: 'Eikthyr', 'The Elder', 'Bonemass', 'Moder', 'Yagluth'
   */
  @Column({ name: 'boss_name', length: 50 })
  bossName: string;

  /** X-coordinate of the boss altar/spawn location */
  @Column({ name: 'position_x', type: 'float' })
  positionX: number;

  /** Y-coordinate (height) of the boss altar/spawn location */
  @Column({ name: 'position_y', type: 'float' })
  positionY: number;

  /** Z-coordinate of the boss altar/spawn location */
  @Column({ name: 'position_z', type: 'float' })
  positionZ: number;

  /** Whether this boss has been successfully defeated */
  @Column({ name: 'is_defeated', default: false })
  isDefeated: boolean;

  /** Timestamp when the boss was defeated (null if not defeated) */
  @Column({ name: 'defeated_at', nullable: true })
  defeatedAt: Date;

  /**
   * Array of user IDs who participated in defeating the boss
   * Used for achievement tracking and reward distribution
   */
  @Column({ name: 'defeated_by_users', type: 'json', default: '[]' })
  defeatedByUsers: string[];

  /** Number of attempts made against this boss (successful and failed) */
  @Column({ name: 'attempts', default: 0 })
  attempts: number;

  /**
   * JSON object containing boss-specific encounter data
   * Can store difficulty modifiers, loot tables, or custom boss properties
   */
  @Column({ name: 'boss_data', type: 'json', nullable: true })
  bossData: Record<string, any>;

  /** Timestamp when the boss encounter record was created */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /** Timestamp when the boss encounter record was last updated */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /** Many-to-one relationship: multiple boss encounters belong to one world */
  @ManyToOne(() => ValheimWorld)
  @JoinColumn({ name: 'world_id' })
  world: ValheimWorld;
}
