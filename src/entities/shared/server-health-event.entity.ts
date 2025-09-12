import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'server_health_events' })
@Index(['server_id', 'observed_at'])
export class ServerHealthEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  server_id: number;

  @Column({ type: 'timestamptz' })
  observed_at: Date;

  @Column({ type: 'varchar', length: 16 })
  status: 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';

  @Column({ type: 'varchar', length: 8 })
  method: 'http' | 'tcp';

  // Primary numeric metric for this check (e.g., latency, sim_speed)
  @Column({ type: 'double precision', nullable: true })
  metric_value?: number | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  metric_name?: string | null; // e.g., 'latency', 'sim_speed'

  @Column({ type: 'varchar', length: 16, nullable: true })
  metric_unit?: string | null; // e.g., 'ms', '%'

  @Column({ type: 'int', nullable: true })
  http_status?: number | null;

  @Column({ type: 'text', nullable: true })
  detail?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, unknown> | null;

  @CreateDateColumn()
  created_at: Date;
}
