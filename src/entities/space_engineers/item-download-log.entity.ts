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

@Entity({ name: 'item_download_log', schema: 'space_engineers' })
export class SpaceEngineersItemDownloadLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'storage_id', type: 'integer' })
  storageId: number;

  @Column({ name: 'item_id', type: 'integer' })
  itemId: number;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string; // 'pending', 'completed', 'failed'

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => SpaceEngineersOnlineStorage)
  @JoinColumn({ name: 'storage_id' })
  storage: SpaceEngineersOnlineStorage;

  @ManyToOne(() => SpaceEngineersItem)
  @JoinColumn({ name: 'item_id' })
  item: SpaceEngineersItem;
}
