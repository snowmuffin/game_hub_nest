import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * SpaceEngineersItem Entity
 *
 * Represents individual items, components, and resources within Space Engineers.
 * Contains comprehensive item definitions including display information,
 * categorization, rarity classification, and visual assets.
 * Serves as the master catalog for all obtainable items in the game,
 * from basic ores and components to advanced ship parts and tools.
 */
@Entity({ name: 'items', schema: 'space_engineers' })
export class SpaceEngineersItem {
  /** Primary key - unique identifier for the item */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Internal game identifier used by Space Engineers engine
   * Matches the item's internal name or ID within the game's data files
   */
  @Column({ name: 'index_name', type: 'varchar', length: 255 })
  indexName: string;

  /**
   * Human-readable item name displayed to players
   * Localized name shown in game interfaces and inventories
   */
  @Column({ name: 'display_name', type: 'varchar', length: 255 })
  displayName: string;

  /**
   * Rarity tier classification (1 = common, higher numbers = rarer)
   * Affects drop rates, value, and availability in the game world
   * Used for balancing and progression systems
   */
  @Column({ type: 'integer', default: 1 })
  rarity: number;

  /**
   * Detailed description of the item's purpose and characteristics
   * Provides players with information about usage, crafting, or functionality
   */
  @Column({ type: 'text', nullable: true })
  description: string;

  /**
   * Item category classification for organization and filtering
   * Examples: 'Ore', 'Component', 'Tool', 'Block', 'Ammunition', etc.
   * Helps with inventory management and item discovery
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  /**
   * JSON object containing icon and visual asset information
   * Stores URLs, file paths, or metadata for item representations
   * Used for displaying items in inventories, shops, and interfaces
   */
  @Column({ type: 'json', nullable: true })
  icons: any;

  /** Timestamp when the item definition was created */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /** Timestamp when the item definition was last updated */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
