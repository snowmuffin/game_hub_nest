import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'icon_files', schema: 'space_engineers' })
@Index(['fileName'], { unique: true })
export class IconFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'file_name', type: 'varchar', length: 255, unique: true })
  fileName: string;

  @Column({ name: 'cdn_url', type: 'text' })
  cdnUrl: string;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
