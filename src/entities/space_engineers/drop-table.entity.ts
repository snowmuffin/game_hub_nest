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

@Entity({ name: 'drop_table', schema: 'space_engineers' })
export class SpaceEngineersDropTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'item_id', type: 'integer' })
  itemId: number;

  @Column({ name: 'item_name', type: 'varchar', length: 255 })
  itemName: string;

  @Column({ type: 'integer', default: 1 })
  rarity: number;

  @Column({
    name: 'drop_rate_multiplier',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 1.0,
  })
  dropRateMultiplier: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => SpaceEngineersItem)
  @JoinColumn({ name: 'item_id' })
  item: SpaceEngineersItem;
}
