import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SpaceEngineersItem } from './item.entity';

@Entity({ name: 'marketplace_items', schema: 'space_engineers' })
export class SpaceEngineersMarketplaceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'seller_steam_id', type: 'varchar', length: 50 })
  sellerSteamId: string;

  @Column({ name: 'item_name', type: 'varchar', length: 255 })
  itemName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'integer', default: 1 })
  quantity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => SpaceEngineersItem, { nullable: true })
  @JoinColumn({ name: 'item_name', referencedColumnName: 'indexName' })
  item: SpaceEngineersItem;
}
