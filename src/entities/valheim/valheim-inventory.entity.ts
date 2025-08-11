import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../shared/user.entity';
import { ValheimItem, ValheimItemQuality } from './valheim-item.entity';

/**
 * ValheimInventory Entity
 *
 * Represents items stored in a player's inventory system in Valheim.
 * Tracks item quantities, quality levels, durability, and storage locations.
 * Supports multiple storage types including player inventory, chests, and equipped items.
 * Maintains detailed item state including enchantments and custom metadata
 * for comprehensive inventory management across the game world.
 */
@Entity({ name: 'inventories', schema: 'valheim' })
@Index(['user_id', 'item_id'], { unique: false })
export class ValheimInventory {
  /** Primary key - unique identifier for the inventory entry */
  @PrimaryGeneratedColumn('increment')
  id: number;

  /** Foreign key reference to the user who owns this inventory item */
  @Column({ type: 'bigint', nullable: false })
  user_id: number;

  /** Foreign key reference to the specific Valheim item being stored */
  @Column({ type: 'integer', nullable: false })
  item_id: number;

  /**
   * Number of items in this inventory stack
   * For stackable items, represents the total count in this location
   */
  @Column({ type: 'integer', default: 1 })
  quantity: number;

  /**
   * Quality/upgrade level of the item
   * Ranges from LEVEL_1 to LEVEL_4, affecting item stats and appearance
   */
  @Column({
    type: 'enum',
    enum: ValheimItemQuality,
    default: ValheimItemQuality.LEVEL_1,
  })
  quality: ValheimItemQuality;

  /**
   * Current durability of the item (0-100)
   * Decreases with use and can be repaired at workbenches
   * Items become unusable when durability reaches 0
   */
  @Column({ type: 'integer', default: 100 })
  durability: number;

  /**
   * Type of storage container where the item is located
   * 'inventory' - Player's personal inventory
   * 'chest' - Storage containers in the world
   * 'equipped' - Currently equipped items
   */
  @Column({ type: 'varchar', length: 50, default: 'inventory' })
  storage_type: string;

  /**
   * Specific location identifier within the storage type
   * Examples: 'base_chest_1', 'equipped_helmet', 'ship_storage'
   * Helps organize items across multiple storage locations
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  storage_location: string;

  /**
   * JSON object containing item enchantment information
   * Stores magical properties, runes, or special effects applied to the item
   */
  @Column({ type: 'json', nullable: true })
  enchantments: any;

  /**
   * JSON object containing additional item-specific metadata
   * Can store custom properties, timestamps, or game-specific data
   */
  @Column({ type: 'json', nullable: true })
  metadata: any;

  /** Timestamp when the inventory entry was created */
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  /** Timestamp when the inventory entry was last updated */
  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  /** Many-to-one relationship: multiple inventory entries belong to one user */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  /** Many-to-one relationship: multiple inventory entries can reference the same item */
  @ManyToOne(() => ValheimItem)
  @JoinColumn({ name: 'item_id' })
  item: ValheimItem;
}
