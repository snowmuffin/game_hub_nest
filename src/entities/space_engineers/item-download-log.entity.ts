import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SpaceEngineersOnlineStorage } from './online-storage.entity';
import { SpaceEngineersItem } from './item.entity';

/**
 * SpaceEngineersItemDownloadLog Entity
 *
 * Tracks download/transfer requests from online storage to player inventories.
 * Maintains an audit trail of all item transfers, including pending requests,
 * successful completions, and failed attempts. This ensures data integrity
 * and provides visibility into the item transfer process between online
 * storage systems and in-game player inventories.
 */
@Entity({ name: 'item_download_log', schema: 'space_engineers' })
export class SpaceEngineersItemDownloadLog {
  /** Primary key - unique identifier for the download log entry */
  @PrimaryGeneratedColumn()
  id: number;

  /** Foreign key reference to the online storage container being accessed */
  @Column({ name: 'storage_id', type: 'integer' })
  storageId: number;

  /** Foreign key reference to the specific item being downloaded */
  @Column({ name: 'item_id', type: 'integer' })
  itemId: number;

  /**
   * Number of items requested for download
   * Must not exceed the available quantity in the storage container
   */
  @Column({ type: 'integer' })
  quantity: number;

  /**
   * Current status of the download request
   * 'pending' - Request initiated but not yet processed
   * 'completed' - Items successfully transferred to player inventory
   * 'failed' - Transfer failed due to errors or insufficient resources
   */
  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  /** Timestamp when the download request was initiated */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /** Timestamp when the download status was last updated */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /** Many-to-one relationship: multiple download logs can reference the same storage */
  @ManyToOne(() => SpaceEngineersOnlineStorage)
  @JoinColumn({ name: 'storage_id' })
  storage: SpaceEngineersOnlineStorage;

  /** Many-to-one relationship: multiple download logs can reference the same item */
  @ManyToOne(() => SpaceEngineersItem)
  @JoinColumn({ name: 'item_id' })
  item: SpaceEngineersItem;
}
