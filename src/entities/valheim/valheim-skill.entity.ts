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

/**
 * ValheimCharacterSkill Entity
 *
 * Represents individual skill progression for Valheim characters.
 * Tracks detailed skill advancement including experience points, levels,
 * and death penalties. Each skill has its own progression curve and
 * contributes to character effectiveness in specific activities.
 * Maintains historical data for skill development and penalty recovery.
 */
@Entity({ name: 'character_skills', schema: 'valheim' })
export class ValheimCharacterSkill {
  /** Primary key - unique UUID identifier for the skill record */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Foreign key reference to the character who owns this skill */
  @Column({ name: 'character_id' })
  characterId: number;

  /**
   * Name identifier of the skill being tracked
   * Examples: 'Swords', 'Bows', 'Axes', 'Clubs', 'Knives', 'Spears', 'Blocking',
   * 'Wood Cutting', 'Cooking', 'Farming', 'Swimming', 'Running', 'Jumping'
   */
  @Column({ name: 'skill_name', length: 50 })
  skillName: string;

  /**
   * Current skill level (1-100)
   * Determines the effectiveness and bonuses provided by this skill
   * Higher levels unlock better performance and reduced stamina costs
   */
  @Column({ name: 'skill_level', default: 1 })
  skillLevel: number;

  /**
   * Current experience points within the current skill level
   * Resets to 0 when leveling up to the next skill level
   * Used to calculate progress toward the next level
   */
  @Column({ name: 'skill_experience', type: 'float', default: 0 })
  skillExperience: number;

  /**
   * Total cumulative experience points gained for this skill
   * Never decreases and provides a historical record of skill usage
   * Used for statistics and achievement tracking
   */
  @Column({ name: 'accumulated_experience', type: 'float', default: 0 })
  accumulatedExperience: number;

  /**
   * Amount of experience lost due to character death
   * Valheim applies skill penalties when players die
   * Can be recovered through continued skill usage
   */
  @Column({ name: 'death_penalty_applied', type: 'float', default: 0 })
  deathPenaltyApplied: number;

  /** Timestamp when the skill record was created */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /** Timestamp when the skill record was last updated */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /** Many-to-one relationship: multiple skills belong to one character */
  @ManyToOne(() => ValheimCharacter)
  @JoinColumn({ name: 'character_id' })
  character: ValheimCharacter;
}
