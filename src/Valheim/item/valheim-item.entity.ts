import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/user.entity';
import { Game } from '../../entities/game.entity';

export enum ValheimItemQuality {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
  LEVEL_4 = 4,
  LEVEL_5 = 5,
}

export enum ValheimItemType {
  WEAPON = 'WEAPON',
  TOOL = 'TOOL',
  ARMOR = 'ARMOR',
  FOOD = 'FOOD',
  MATERIAL = 'MATERIAL',
  BUILDING = 'BUILDING',
  CONSUMABLE = 'CONSUMABLE',
  TROPHY = 'TROPHY',
  MISC = 'MISC',
}

@Entity('valheim_items')
export class ValheimItem {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  item_code: string; // 게임 내 아이템 식별자 (예: Wood, Stone, IronSword)

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ 
    type: 'enum', 
    enum: ValheimItemType, 
    default: ValheimItemType.MISC 
  })
  type: ValheimItemType;

  @Column({ 
    type: 'enum', 
    enum: ValheimItemQuality, 
    default: ValheimItemQuality.LEVEL_1 
  })
  max_quality: ValheimItemQuality;

  @Column({ type: 'integer', default: 1 })
  max_stack: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  weight: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  value: number; // 상점 가치

  @Column({ type: 'json', nullable: true })
  crafting_recipe: any; // 제작 레시피 정보

  @Column({ type: 'json', nullable: true })
  stats: any; // 아이템 스탯 (공격력, 방어력 등)

  @Column({ type: 'varchar', length: 500, nullable: true })
  icon_url: string;

  @Column({ type: 'boolean', default: true })
  is_tradeable: boolean;

  @Column({ type: 'boolean', default: false })
  is_teleportable: boolean; // 포탈 이동 가능 여부

  @Column({ type: 'text', nullable: true })
  biome: string; // 주로 발견되는 바이옴

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
