import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../user/user.entity';
import { ValheimItem, ValheimItemQuality } from '../item/valheim-item.entity';

@Entity({ name: 'inventories', schema: 'valheim' })
@Index(['user_id', 'item_id'], { unique: false })
export class ValheimInventory {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint', nullable: false })
  user_id: number;

  @Column({ type: 'integer', nullable: false })
  item_id: number;

  @Column({ type: 'integer', default: 1 })
  quantity: number;

  @Column({ 
    type: 'enum', 
    enum: ValheimItemQuality, 
    default: ValheimItemQuality.LEVEL_1 
  })
  quality: ValheimItemQuality;

  @Column({ type: 'integer', default: 100 })
  durability: number; // 내구도 (최대 100)

  @Column({ type: 'varchar', length: 50, default: 'inventory' })
  storage_type: string; // 'inventory', 'chest', 'equipped'

  @Column({ type: 'varchar', length: 255, nullable: true })
  storage_location: string; // 보관 위치 (예: 'base_chest_1', 'equipped_helmet')

  @Column({ type: 'json', nullable: true })
  enchantments: any; // 인챈트 정보

  @Column({ type: 'json', nullable: true })
  metadata: any; // 추가 메타데이터

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ValheimItem)
  @JoinColumn({ name: 'item_id' })
  item: ValheimItem;
}
