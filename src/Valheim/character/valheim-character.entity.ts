import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/user.entity';
import { ValheimWorld } from '../world/valheim-world.entity';

@Entity('valheim_characters')
export class ValheimCharacter {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint', nullable: false, unique: true })
  user_id: number;

  @Column({ name: 'world_id', nullable: true })
  worldId: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  character_name: string;

  @Column({ type: 'integer', default: 1 })
  level: number;

  @Column({ type: 'bigint', default: 0 })
  experience: number;

  // 스탯
  @Column({ type: 'integer', default: 25 })
  health: number;

  @Column({ type: 'integer', default: 100 })
  stamina: number;

  @Column({ type: 'integer', default: 25 })
  eitr: number; // 마법력

  // 스킬 레벨
  @Column({ type: 'integer', default: 0 })
  skill_axes: number;

  @Column({ type: 'integer', default: 0 })
  skill_bows: number;

  @Column({ type: 'integer', default: 0 })
  skill_clubs: number;

  @Column({ type: 'integer', default: 0 })
  skill_knives: number;

  @Column({ type: 'integer', default: 0 })
  skill_polearms: number;

  @Column({ type: 'integer', default: 0 })
  skill_spears: number;

  @Column({ type: 'integer', default: 0 })
  skill_swords: number;

  @Column({ type: 'integer', default: 0 })
  skill_unarmed: number;

  @Column({ type: 'integer', default: 0 })
  skill_blocking: number;

  @Column({ type: 'integer', default: 0 })
  skill_jump: number;

  @Column({ type: 'integer', default: 0 })
  skill_run: number;

  @Column({ type: 'integer', default: 0 })
  skill_sneak: number;

  @Column({ type: 'integer', default: 0 })
  skill_swim: number;

  @Column({ type: 'integer', default: 0 })
  skill_fishing: number;

  @Column({ type: 'integer', default: 0 })
  skill_wood_cutting: number;

  @Column({ type: 'integer', default: 0 })
  skill_cooking: number;

  @Column({ type: 'integer', default: 0 })
  skill_farming: number;

  // 위치 정보
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  position_x: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  position_y: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  position_z: number;

  @Column({ type: 'varchar', length: 100, default: 'Meadows' })
  current_biome: string;

  // 게임 진행 상황
  @Column({ type: 'json', nullable: true })
  defeated_bosses: string[]; // ['Eikthyr', 'The Elder', ...]

  @Column({ type: 'json', nullable: true })
  discovered_locations: string[]; // 발견한 위치들

  @Column({ type: 'json', nullable: true })
  unlocked_recipes: string[]; // 해금된 제작법

  // 플레이 통계
  @Column({ type: 'integer', default: 0 })
  play_time_seconds: number;

  @Column({ type: 'integer', default: 0 })
  deaths: number;

  @Column({ type: 'integer', default: 0 })
  enemies_killed: number;

  @Column({ type: 'integer', default: 0 })
  distance_walked: number;

  @Column({ type: 'integer', default: 0 })
  items_crafted: number;

  // 기타
  @Column({ type: 'json', nullable: true })
  metadata: any; // 추가 메타데이터

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ValheimWorld)
  @JoinColumn({ name: 'world_id' })
  world: ValheimWorld;
}
