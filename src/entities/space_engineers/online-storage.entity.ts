import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../shared/user.entity';

@Entity({ name: 'online_storage', schema: 'space_engineers' })
export class SpaceEngineersOnlineStorage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'steam_id', type: 'varchar', length: 50 })
  steamId: string;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'steam_id', referencedColumnName: 'steam_id' })
  user: User;
}
