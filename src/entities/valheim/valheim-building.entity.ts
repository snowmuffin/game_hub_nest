import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../shared/user.entity';
import { GameServer } from '../shared/game-server.entity';

/**
 * ValheimBuilding Entity
 *
 * Represents structures and buildings constructed by players in Valheim worlds.
 * Tracks all player-built structures including houses, workbenches, portals,
 * and crafting stations with their precise locations, orientations, and states.
 * Maintains building health, material costs, and ownership information
 * for persistence across game sessions and server management.
 */
@Entity({ name: 'buildings', schema: 'valheim' })
export class ValheimBuilding {
  /** Primary key - unique UUID identifier for the building */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Foreign key reference to the user who built this structure */
  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  /** Foreign key reference to the Valheim server where this building exists */
  @Column({ name: 'server_id' })
  serverId: string;

  /**
   * Custom name assigned to the building by the player
   * Used for identification and organization of player structures
   */
  @Column({ name: 'building_name', length: 100 })
  buildingName: string;

  /**
   * Category classification of the building structure
   * Examples: 'house', 'portal', 'workbench', 'forge', 'smelter', 'kiln', 'farm'
   * Helps with filtering and management of different structure types
   */
  @Column({ name: 'building_type', length: 50 })
  buildingType: string;

  /** X-coordinate position in the Valheim world space */
  @Column({ name: 'position_x', type: 'float' })
  positionX: number;

  /** Y-coordinate position (height/elevation) in the Valheim world space */
  @Column({ name: 'position_y', type: 'float' })
  positionY: number;

  /** Z-coordinate position in the Valheim world space */
  @Column({ name: 'position_z', type: 'float' })
  positionZ: number;

  /** Rotation around the X-axis in degrees (pitch) */
  @Column({ name: 'rotation_x', type: 'float', default: 0 })
  rotationX: number;

  /** Rotation around the Y-axis in degrees (yaw) */
  @Column({ name: 'rotation_y', type: 'float', default: 0 })
  rotationY: number;

  /** Rotation around the Z-axis in degrees (roll) */
  @Column({ name: 'rotation_z', type: 'float', default: 0 })
  rotationZ: number;

  /**
   * Current health/durability of the building structure
   * Decreases due to damage from enemies, weather, or decay
   * When reaches 0, the building is destroyed
   */
  @Column({ name: 'health', type: 'float', default: 100 })
  health: number;

  /**
   * Maximum health capacity of the building when fully repaired
   * Depends on building type and materials used in construction
   */
  @Column({ name: 'max_health', type: 'float', default: 100 })
  maxHealth: number;

  /**
   * JSON object tracking materials consumed during construction
   * Format: { "Wood": 20, "Stone": 10, "Iron": 5 }
   * Used for repair calculations and resource tracking
   */
  @Column({ name: 'materials_used', type: 'json', nullable: true })
  materialsUsed: Record<string, number>;

  /**
   * Building status indicating if it still exists in the world
   * False when building is destroyed or demolished by players
   */
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  /** Timestamp when the building was first constructed */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /** Timestamp when the building information was last updated */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /** Many-to-one relationship: multiple buildings can belong to one user */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  /** Many-to-one relationship: multiple buildings can exist on one server */
  @ManyToOne(() => GameServer)
  @JoinColumn({ name: 'server_id' })
  server: GameServer;
}
