import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SpaceEngineersOnlineStorage } from './online-storage.entity';
import { SpaceEngineersItem } from './item.entity';

@Entity({ name: 'online_storage_items', schema: 'space_engineers' })
export class SpaceEngineersOnlineStorageItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'storage_id', type: 'integer' })
  storageId: number;

  @Column({ name: 'item_id', type: 'integer' })
  itemId: number;

  @Column({ type: 'integer', default: 1 })
  quantity: number;

  // Relations
  @ManyToOne(() => SpaceEngineersOnlineStorage)
  @JoinColumn({ name: 'storage_id' })
  storage: SpaceEngineersOnlineStorage;

  @ManyToOne(() => SpaceEngineersItem)
  @JoinColumn({ name: 'item_id' })
  item: SpaceEngineersItem;
}
