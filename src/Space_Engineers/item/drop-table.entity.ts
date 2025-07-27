import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('drop_table', { schema: 'space_engineers' })
@Index(['item_id'])
@Index(['rarity'])
export class DropTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  item_id: string;

  @Column({ type: 'varchar', length: 255 })
  item_name: string;

  @Column({ type: 'int' })
  rarity: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 1.0 })
  drop_rate_multiplier: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
