import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ValheimCharacter } from './valheim-character.entity';

@Entity({ name: 'valheim_character_skills' })
export class ValheimCharacterSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'character_id' })
  characterId: number;

  @Column({ name: 'skill_name', length: 50 })
  skillName: string; // 'Swords', 'Bows', 'Axes', 'Clubs', 'Knives', 'Spears', 'Blocking', 'Wood Cutting', 'Cooking', etc.

  @Column({ name: 'skill_level', default: 1 })
  skillLevel: number;

  @Column({ name: 'skill_experience', type: 'float', default: 0 })
  skillExperience: number;

  @Column({ name: 'accumulated_experience', type: 'float', default: 0 })
  accumulatedExperience: number; // Total experience gained for this skill

  @Column({ name: 'death_penalty_applied', type: 'float', default: 0 })
  deathPenaltyApplied: number; // Experience lost due to death

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ValheimCharacter)
  @JoinColumn({ name: 'character_id' })
  character: ValheimCharacter;
}
