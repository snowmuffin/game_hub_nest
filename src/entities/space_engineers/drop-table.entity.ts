import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SpaceEngineersItem } from './item.entity';

/**
 * SpaceEngineersDropTable Entity
 *
 * Defines the drop table configuration for Space Engineers items.
 * Controls which items can be obtained through gameplay mechanics such as
 * mining, salvaging, looting, or random rewards. Each entry specifies
 * the drop probability, rarity tier, and multipliers that affect
 * how frequently items appear in the game world.
 */
@Entity({ name: 'drop_table', schema: 'space_engineers' })
export class SpaceEngineersDropTable {
  /** Primary key - unique identifier for the drop table entry */
  @PrimaryGeneratedColumn()
  id: number;

  /** Foreign key reference to the Space Engineers item that can be dropped */
  @Column({ name: 'item_id', type: 'integer' })
  itemId: number;

  /**
   * Cached item name for quick reference and display
   * Denormalized from the item table for performance optimization
   */
  @Column({ name: 'item_name', type: 'varchar', length: 255 })
  itemName: string;

  /**
   * Rarity tier of the item (1 = common, higher numbers = rarer)
   * Used to categorize items by their scarcity and value
   * Affects base drop probability calculations
   */
  @Column({ type: 'integer', default: 1 })
  rarity: number;

  /**
   * Drop rate multiplier applied to base drop probability
   * 1.0 = normal rate, >1.0 = increased chance, <1.0 = decreased chance
   * Allows fine-tuning of drop rates without changing base item properties
   */
  @Column({
    name: 'drop_rate_multiplier',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 1.0,
  })
  dropRateMultiplier: number;

  /**
   * Drop table entry activation status
   * When false, this item is temporarily removed from the drop pool
   * Useful for seasonal events or balancing adjustments
   */
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  /**
   * Optional description explaining drop conditions or special requirements
   * Can include context about where/when/how this item drops
   */
  @Column({ type: 'text', nullable: true })
  description: string;

  /** Timestamp when the drop table entry was created */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /** Timestamp when the drop table entry was last updated */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /** Many-to-one relationship: multiple drop entries can reference the same item */
  @ManyToOne(() => SpaceEngineersItem)
  @JoinColumn({ name: 'item_id' })
  item: SpaceEngineersItem;
}
