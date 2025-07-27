import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { GameServer } from '../../entities/game-server.entity';

@Entity({ name: 'buildings', schema: 'valheim' })
export class ValheimBuilding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'server_id' })
  serverId: string;

  @Column({ name: 'building_name', length: 100 })
  buildingName: string;

  @Column({ name: 'building_type', length: 50 })
  buildingType: string; // 'house', 'portal', 'workbench', 'forge', 'smelter', etc.

  @Column({ name: 'position_x', type: 'float' })
  positionX: number;

  @Column({ name: 'position_y', type: 'float' })
  positionY: number;

  @Column({ name: 'position_z', type: 'float' })
  positionZ: number;

  @Column({ name: 'rotation_x', type: 'float', default: 0 })
  rotationX: number;

  @Column({ name: 'rotation_y', type: 'float', default: 0 })
  rotationY: number;

  @Column({ name: 'rotation_z', type: 'float', default: 0 })
  rotationZ: number;

  @Column({ name: 'health', type: 'float', default: 100 })
  health: number;

  @Column({ name: 'max_health', type: 'float', default: 100 })
  maxHealth: number;

  @Column({ name: 'materials_used', type: 'json', nullable: true })
  materialsUsed: Record<string, number>; // { "Wood": 20, "Stone": 10 }

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => GameServer)
  @JoinColumn({ name: 'server_id' })
  server: GameServer;
}
