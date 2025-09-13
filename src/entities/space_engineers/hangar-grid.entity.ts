import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

/**
 * SpaceEngineersHangarGrid
 *
 * Stores metadata for Space Engineers prefab/blueprint files uploaded to S3
 * and associated to a user and a server. The actual file bytes live in S3.
 */
@Entity({ name: 'hangar_grids', schema: 'space_engineers' })
export class SpaceEngineersHangarGrid {
  @PrimaryGeneratedColumn()
  id: number;

  /** Owner user id (references users.id) */
  @Column({ type: 'int' })
  user_id: number;

  /** Game server id (references game_servers.id) */
  @Column({ type: 'int', nullable: true })
  server_id: number | null;

  /** Optional friendly name/label for the grid */
  @Column({ type: 'varchar', length: 200, nullable: true })
  name: string | null;

  /** Optional description */
  @Column({ type: 'varchar', length: 1000, nullable: true })
  description: string | null;

  /** S3 bucket where the file is stored */
  @Column({ type: 'varchar', length: 255 })
  s3_bucket: string;

  /** S3 object key */
  @Column({ type: 'varchar', length: 1024 })
  s3_key: string;

  /** MIME type provided by client (e.g., application/zip or text/xml) */
  @Column({ type: 'varchar', length: 255, nullable: true })
  content_type: string | null;

  /** File size if known (bytes) */
  @Column({ type: 'bigint', nullable: true })
  size_bytes: string | null; // bigint as string in JS

  /** Optional checksum (e.g., sha256) */
  @Column({ type: 'varchar', length: 128, nullable: true })
  file_hash: string | null;

  /**
   * Upload/availability status
   * - UPLOADING: presigned URL issued, upload in progress
   * - AVAILABLE: upload completed and object confirmed
   * - DELETED: logically deleted (object may be removed from S3)
   */
  @Column({ type: 'varchar', length: 20, default: 'UPLOADING' })
  status: 'UPLOADING' | 'AVAILABLE' | 'DELETED';

  /** Free-form JSON metadata (parsed blueprint info, tags, etc.) */
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations (optional runtime joins)
  @ManyToOne('User')
  @JoinColumn({ name: 'user_id' })
  user: any;

  @ManyToOne('GameServer')
  @JoinColumn({ name: 'server_id' })
  server: any;
}
