import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToMany } from 'typeorm';
import { GameServer } from '../../entities/game-server.entity';
import { ValheimCharacter } from '../character/valheim-character.entity';

@Entity('valheim_worlds')
export class ValheimWorld {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'server_id' })
  serverId: string;

  @Column({ name: 'world_name', length: 100 })
  worldName: string;

  @Column({ name: 'world_seed', length: 50 })
  worldSeed: string;

  @Column({ name: 'world_size', default: 10000 })
  worldSize: number;

  @Column({ name: 'day_count', default: 1 })
  dayCount: number;

  @Column({ name: 'time_of_day', type: 'float', default: 0.5 }) // 0.0 = midnight, 0.5 = noon
  timeOfDay: number;

  @Column({ name: 'defeated_bosses', type: 'json', default: '[]' })
  defeatedBosses: string[]; // ['Eikthyr', 'The Elder', 'Bonemass', 'Moder', 'Yagluth']

  @Column({ name: 'discovered_locations', type: 'json', default: '[]' })
  discoveredLocations: string[]; // Location names

  @Column({ name: 'global_keys', type: 'json', default: '[]' })
  globalKeys: string[]; // Global progression keys

  @Column({ name: 'weather_state', length: 50, default: 'Clear' })
  weatherState: string; // 'Clear', 'Rain', 'Storm', 'Snow', etc.

  @Column({ name: 'is_hardcore', default: false })
  isHardcore: boolean;

  @Column({ name: 'player_count', default: 0 })
  playerCount: number;

  @Column({ name: 'max_players', default: 10 })
  maxPlayers: number;

  @Column({ name: 'world_data', type: 'json', nullable: true })
  worldData: Record<string, any>; // Additional world metadata

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => GameServer)
  @JoinColumn({ name: 'server_id' })
  server: GameServer;

  @OneToMany(() => ValheimCharacter, character => character.world)
  characters: ValheimCharacter[];
}

@Entity('valheim_biomes')
export class ValheimBiome {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'world_id' })
  worldId: string;

  @Column({ name: 'biome_name', length: 50 })
  biomeName: string; // 'Meadows', 'BlackForest', 'Swamp', 'Mountains', 'Plains', 'Ocean', 'Mistlands', 'DeepNorth', 'Ashlands'

  @Column({ name: 'position_x', type: 'float' })
  positionX: number;

  @Column({ name: 'position_y', type: 'float' })
  positionY: number;

  @Column({ name: 'size_radius', type: 'float' })
  sizeRadius: number;

  @Column({ name: 'is_explored', default: false })
  isExplored: boolean;

  @Column({ name: 'exploration_percentage', type: 'float', default: 0 })
  explorationPercentage: number;

  @Column({ name: 'biome_data', type: 'json', nullable: true })
  biomeData: Record<string, any>; // Specific biome metadata

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ValheimWorld)
  @JoinColumn({ name: 'world_id' })
  world: ValheimWorld;
}

@Entity('valheim_boss_encounters')
export class ValheimBossEncounter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'world_id' })
  worldId: string;

  @Column({ name: 'boss_name', length: 50 })
  bossName: string;

  @Column({ name: 'position_x', type: 'float' })
  positionX: number;

  @Column({ name: 'position_y', type: 'float' })
  positionY: number;

  @Column({ name: 'position_z', type: 'float' })
  positionZ: number;

  @Column({ name: 'is_defeated', default: false })
  isDefeated: boolean;

  @Column({ name: 'defeated_at', nullable: true })
  defeatedAt: Date;

  @Column({ name: 'defeated_by_users', type: 'json', default: '[]' })
  defeatedByUsers: string[]; // User IDs who participated

  @Column({ name: 'attempts', default: 0 })
  attempts: number;

  @Column({ name: 'boss_data', type: 'json', nullable: true })
  bossData: Record<string, any>; // Boss-specific data

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ValheimWorld)
  @JoinColumn({ name: 'world_id' })
  world: ValheimWorld;
}
