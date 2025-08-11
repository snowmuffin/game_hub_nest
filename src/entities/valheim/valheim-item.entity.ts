import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * ValheimItemQuality Enum
 *
 * Represents the quality/upgrade levels available for items in Valheim.
 * Higher quality levels provide better stats and enhanced appearance.
 * Items can be upgraded at workbenches using specific materials.
 */
export enum ValheimItemQuality {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
  LEVEL_4 = 4,
  LEVEL_5 = 5,
}

/**
 * ValheimItemType Enum
 *
 * Categorizes items by their primary function and usage in Valheim.
 * Used for inventory organization, filtering, and game mechanics.
 */
export enum ValheimItemType {
  WEAPON = 'WEAPON',
  TOOL = 'TOOL',
  ARMOR = 'ARMOR',
  FOOD = 'FOOD',
  MATERIAL = 'MATERIAL',
  BUILDING = 'BUILDING',
  CONSUMABLE = 'CONSUMABLE',
  TROPHY = 'TROPHY',
  MISC = 'MISC',
}

/**
 * ValheimItem Entity
 *
 * Represents the master catalog of all items available in Valheim.
 * Contains comprehensive item definitions including stats, crafting recipes,
 * and gameplay mechanics. Serves as the reference data for all item instances
 * used throughout the game, from basic materials to legendary weapons and armor.
 * Each item definition includes quality limits, trading restrictions, and biome associations.
 */
@Entity({ name: 'items', schema: 'valheim' })
export class ValheimItem {
  /** Primary key - unique identifier for the item definition */
  @PrimaryGeneratedColumn('increment')
  id: number;

  /** Human-readable item name displayed to players */
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  /**
   * Unique internal game identifier for the item
   * Examples: 'Wood', 'Stone', 'IronSword', 'LeatherHelmet'
   * Must match the item's identifier within Valheim's game data
   */
  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  item_code: string;

  /**
   * Detailed description of the item's purpose and characteristics
   * Provides players with lore, usage instructions, or flavor text
   */
  @Column({ type: 'text', nullable: true })
  description: string;

  /** Category classification of the item for organization and filtering */
  @Column({
    type: 'enum',
    enum: ValheimItemType,
    default: ValheimItemType.MISC,
  })
  type: ValheimItemType;

  /** Maximum quality level this item can be upgraded to */
  @Column({
    type: 'enum',
    enum: ValheimItemQuality,
    default: ValheimItemQuality.LEVEL_1,
  })
  max_quality: ValheimItemQuality;

  /**
   * Maximum number of items that can be stacked in a single inventory slot
   * Non-stackable items (weapons, armor) typically have a value of 1
   */
  @Column({ type: 'integer', default: 1 })
  max_stack: number;

  /**
   * Item weight affecting player movement and inventory capacity
   * Heavier items slow down movement and limit carrying capacity
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  weight: number;

  /**
   * Base monetary value of the item for trading and economic systems
   * Used for vendor pricing and trade calculations
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  value: number;

  /**
   * JSON object containing crafting recipe information
   * Includes required materials, workbench type, and crafting conditions
   * Format: { "materials": [{"item": "Wood", "quantity": 10}], "station": "Workbench" }
   */
  @Column({ type: 'json', nullable: true })
  crafting_recipe: any;

  /**
   * JSON object containing item statistics and attributes
   * Includes damage, armor, durability, and special effects
   * Format varies by item type (weapons have damage, armor has protection, etc.)
   */
  @Column({ type: 'json', nullable: true })
  stats: any;

  /**
   * URL or path to the item's icon image
   * Used for displaying the item in inventories and interfaces
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  icon_url: string;

  /**
   * Whether the item can be traded between players
   * Some rare or boss items may be marked as non-tradeable
   */
  @Column({ type: 'boolean', default: true })
  is_tradeable: boolean;

  /**
   * Whether the item can be transported through portals
   * Metals and ores typically cannot be teleported in Valheim
   */
  @Column({ type: 'boolean', default: false })
  is_teleportable: boolean;

  /**
   * Primary biome where this item is commonly found or used
   * Examples: 'Meadows', 'Black Forest', 'Swamp', 'Mountains', 'Plains'
   * Helps players understand where to find or use the item
   */
  @Column({ type: 'text', nullable: true })
  biome: string;

  /** Timestamp when the item definition was created */
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  /** Timestamp when the item definition was last updated */
  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
