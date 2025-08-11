import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'items', schema: 'space_engineers' })
export class SpaceEngineersItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'index_name', type: 'varchar', length: 255 })
  indexName: string;

  @Column({ name: 'display_name', type: 'varchar', length: 255 })
  displayName: string;

  @Column({ type: 'integer', default: 1 })
  rarity: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'json', nullable: true })
  icons: any; // JSON data for icons

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
