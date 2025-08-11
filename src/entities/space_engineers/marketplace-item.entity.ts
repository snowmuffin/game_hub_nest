import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SpaceEngineersItem } from './item.entity';

/**
 * SpaceEngineersMarketplaceItem Entity
 *
 * Represents items listed for sale in the Space Engineers marketplace system.
 * Enables player-to-player trading by allowing users to list their items
 * with specific prices and quantities. Each listing is tied to a seller's
 * Steam ID and references the actual item definition for validation and
 * display purposes in the marketplace interface.
 */
@Entity({ name: 'marketplace_items', schema: 'space_engineers' })
export class SpaceEngineersMarketplaceItem {
  /** Primary key - unique identifier for the marketplace listing */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Steam ID of the player selling the item
   * Links the listing to the seller's account for transaction processing
   * and ownership verification
   */
  @Column({ name: 'seller_steam_id', type: 'varchar', length: 50 })
  sellerSteamId: string;

  /**
   * Internal game name of the item being sold
   * Must match the indexName from the SpaceEngineersItem entity
   * Used for item validation and marketplace display
   */
  @Column({ name: 'item_name', type: 'varchar', length: 255 })
  itemName: string;

  /**
   * Price per unit in the marketplace currency
   * Decimal precision allows for fractional pricing
   * Represents the cost for a single item unit
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  /**
   * Number of items available for purchase in this listing
   * Buyers can purchase partial quantities if available
   * Must be greater than 0 for active listings
   */
  @Column({ type: 'integer', default: 1 })
  quantity: number;

  /** Timestamp when the marketplace listing was created */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * Many-to-one relationship: multiple marketplace listings can reference the same item
   * Joins on itemName to indexName for item definition lookup
   * Provides access to item details, category, and display information
   */
  @ManyToOne(() => SpaceEngineersItem, { nullable: true })
  @JoinColumn({ name: 'item_name', referencedColumnName: 'indexName' })
  item: SpaceEngineersItem;
}
