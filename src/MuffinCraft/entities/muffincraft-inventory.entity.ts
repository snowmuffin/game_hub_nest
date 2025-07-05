import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class MuffinCraftInventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  minecraftUuid: string;

  @Column()
  itemId: string;

  @Column()
  itemName: string;

  @Column()
  quantity: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
