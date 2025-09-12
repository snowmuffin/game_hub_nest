import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity({ name: 'server_health_snapshots' })
@Index(['server_id', 'window_start', 'window_size'], { unique: true })
export class ServerHealthSnapshot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  server_id: number;

  @Column({ type: 'timestamptz' })
  window_start: Date; // inclusive

  @Column({ type: 'varchar', length: 8 })
  window_size: '1m' | '5m' | '1h';

  @Column({ type: 'int' })
  checks_total: number;

  @Column({ type: 'int' })
  checks_up: number;

  @Column({ type: 'numeric', precision: 5, scale: 4 })
  uptime_ratio: string; // store as numeric string

  // Aggregated metric values (unit/name aligned with events for the window)
  @Column({ type: 'double precision', nullable: true })
  metric_avg?: number | null;

  @Column({ type: 'double precision', nullable: true })
  metric_p50?: number | null;

  @Column({ type: 'double precision', nullable: true })
  metric_p95?: number | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  metric_name?: string | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  metric_unit?: string | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  last_status?: 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN' | null;

  @Column({ type: 'timestamptz', nullable: true })
  last_change_at?: Date | null;
}
