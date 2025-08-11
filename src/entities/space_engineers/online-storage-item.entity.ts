import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SpaceEngineersOnlineStorage } from './online-storage.entity';
import { SpaceEngineersItem } from './item.entity';

/**
 * SpaceEngineersOnlineStorageItem Entity
 *
 * Represents individual item stacks within online storage containers.
 * Acts as a bridge entity between storage containers and items, maintaining
 * the quantity of each item type stored in a specific container.
 * Enables inventory management for player storage systems and supports
 * item transfers between different storage locations and player inventories.
 */
@Entity({ name: 'online_storage_items', schema: 'space_engineers' })
export class SpaceEngineersOnlineStorageItem {
  /** Primary key - unique identifier for the storage item entry */
  @PrimaryGeneratedColumn()
  id: number;

  /** Foreign key reference to the online storage container holding this item */
  @Column({ name: 'storage_id', type: 'integer' })
  storageId: number;

  /** Foreign key reference to the specific item type being stored */
  @Column({ name: 'item_id', type: 'integer' })
  itemId: number;

  /**
   * Number of items of this type stored in the container
   * Represents the stack size for stackable items
   * Must be greater than 0 for valid storage entries
   */
  @Column({ type: 'integer', default: 1 })
  quantity: number;

  /** Many-to-one relationship: multiple items can be stored in the same container */
  @ManyToOne(() => SpaceEngineersOnlineStorage)
  @JoinColumn({ name: 'storage_id' })
  storage: SpaceEngineersOnlineStorage;

  /** Many-to-one relationship: multiple storage entries can reference the same item */
  @ManyToOne(() => SpaceEngineersItem)
  @JoinColumn({ name: 'item_id' })
  item: SpaceEngineersItem;
}
