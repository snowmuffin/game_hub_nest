import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'server_outages' })
@Index(['server_id', 'started_at'])
export class ServerOutage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  server_id: number;

  @Column({ type: 'timestamptz' })
  started_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  ended_at?: Date | null;

  @Column({ type: 'int', nullable: true })
  duration_sec?: number | null; // computed on close

  @Column({ type: 'text', nullable: true })
  reason?: string | null;

  @Column({ type: 'int', nullable: true })
  sample_event_id?: number | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
