import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValheimCharacterSkill } from './valheim-skill.entity';

export interface AddSkillExperienceDto {
  characterId: number;
  skillName: string;
  experienceGained: number;
}

export interface UpdateSkillDto {
  skillLevel?: number;
  skillExperience?: number;
  accumulatedExperience?: number;
  deathPenaltyApplied?: number;
}

@Injectable()
export class ValheimSkillService {
  constructor(
    @InjectRepository(ValheimCharacterSkill)
    private skillRepository: Repository<ValheimCharacterSkill>,
  ) {}

  // Valheim skill experience thresholds
  private getExperienceForLevel(level: number): number {
    // Valheim uses exponential progression: experience = level * (level + 1) * 0.5
    // But adjusted for better progression: approximately level^2 * 0.5
    return Math.floor(level * level * 0.5);
  }

  private getLevelFromExperience(experience: number): number {
    // Reverse calculation: level = sqrt(experience * 2)
    return Math.floor(Math.sqrt(experience * 2));
  }

  async createOrUpdateSkill(
    addSkillDto: AddSkillExperienceDto,
  ): Promise<ValheimCharacterSkill> {
    let skill = await this.skillRepository.findOne({
      where: {
        characterId: addSkillDto.characterId,
        skillName: addSkillDto.skillName,
      },
    });

    if (!skill) {
      // Create new skill
      skill = this.skillRepository.create({
        characterId: addSkillDto.characterId,
        skillName: addSkillDto.skillName,
        skillLevel: 1,
        skillExperience: 0,
        accumulatedExperience: 0,
      });
    }

    // Add experience
    const newExperience = skill.skillExperience + addSkillDto.experienceGained;
    const newAccumulated =
      skill.accumulatedExperience + addSkillDto.experienceGained;
    const newLevel = Math.max(1, this.getLevelFromExperience(newExperience));

    skill.skillExperience = newExperience;
    skill.accumulatedExperience = newAccumulated;
    skill.skillLevel = Math.min(100, newLevel); // Cap at level 100

    return await this.skillRepository.save(skill);
  }

  async findSkillsByCharacter(
    characterId: number,
  ): Promise<ValheimCharacterSkill[]> {
    return await this.skillRepository.find({
      where: { characterId },
      relations: ['character'],
      order: { skillLevel: 'DESC' },
    });
  }

  async findSkillByCharacterAndName(
    characterId: number,
    skillName: string,
  ): Promise<ValheimCharacterSkill | null> {
    return await this.skillRepository.findOne({
      where: { characterId, skillName },
      relations: ['character'],
    });
  }

  async updateSkill(
    id: string,
    updateSkillDto: UpdateSkillDto,
  ): Promise<ValheimCharacterSkill | null> {
    await this.skillRepository.update(id, updateSkillDto);
    return await this.skillRepository.findOne({
      where: { id },
      relations: ['character'],
    });
  }

  async applyDeathPenalty(
    characterId: number,
    penaltyPercentage: number = 5,
  ): Promise<ValheimCharacterSkill[]> {
    const skills = await this.findSkillsByCharacter(characterId);
    const updatedSkills: ValheimCharacterSkill[] = [];

    for (const skill of skills) {
      if (skill.skillLevel > 1) {
        const experienceLoss =
          skill.skillExperience * (penaltyPercentage / 100);
        const newExperience = Math.max(
          0,
          skill.skillExperience - experienceLoss,
        );
        const newLevel = Math.max(
          1,
          this.getLevelFromExperience(newExperience),
        );

        const updatedSkill = await this.updateSkill(skill.id, {
          skillExperience: newExperience,
          skillLevel: newLevel,
          deathPenaltyApplied: skill.deathPenaltyApplied + experienceLoss,
        });

        if (updatedSkill) {
          updatedSkills.push(updatedSkill);
        }
      }
    }

    return updatedSkills;
  }

  async getSkillLeaderboard(
    skillName: string,
    limit: number = 10,
  ): Promise<ValheimCharacterSkill[]> {
    return await this.skillRepository.find({
      where: { skillName },
      relations: ['character', 'character.user'],
      order: { skillLevel: 'DESC', skillExperience: 'DESC' },
      take: limit,
    });
  }

  async getCharacterSkillSummary(characterId: number): Promise<any> {
    const skills = await this.findSkillsByCharacter(characterId);

    const totalLevels = skills.reduce(
      (sum, skill) => sum + skill.skillLevel,
      0,
    );
    const totalExperience = skills.reduce(
      (sum, skill) => sum + skill.accumulatedExperience,
      0,
    );
    const averageLevel = skills.length > 0 ? totalLevels / skills.length : 0;
    const highestSkill = skills.length > 0 ? skills[0] : null;

    return {
      totalSkills: skills.length,
      totalLevels,
      totalExperience,
      averageLevel: Math.round(averageLevel * 100) / 100,
      highestSkill,
      skills: skills,
    };
  }

  async deleteSkill(id: string): Promise<void> {
    await this.skillRepository.delete(id);
  }

  // Predefined Valheim skills
  getAvailableSkills(): string[] {
    return [
      'Swords',
      'Knives',
      'Clubs',
      'Polearms',
      'Spears',
      'Blocking',
      'Axes',
      'Bows',
      'Unarmed',
      'Pickaxes',
      'Wood Cutting',
      'Crossbows',
      'Jump',
      'Sneak',
      'Run',
      'Swim',
      'Fishing',
      'Cooking',
      'Farming',
    ];
  }
}
