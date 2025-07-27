import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  ValheimSkillService,
  AddSkillExperienceDto,
  UpdateSkillDto,
} from './valheim-skill.service';
import { ValheimCharacterSkill } from './valheim-skill.entity';

/**
 * Controller for managing Valheim character skills
 * Handles skill experience, updates, leaderboards, and character skill management
 */
@Controller('valheim/skills')
@UseGuards(JwtAuthGuard)
export class ValheimSkillController {
  constructor(private readonly skillService: ValheimSkillService) {}

  /**
   * Add experience to a character's skill
   * @param addSkillDto Skill experience data to add
   * @returns Updated or created character skill
   */
  @Post('experience')
  async addSkillExperience(
    @Body() addSkillDto: AddSkillExperienceDto,
  ): Promise<ValheimCharacterSkill> {
    return await this.skillService.createOrUpdateSkill(addSkillDto);
  }

  /**
   * Get all skills for a specific character
   * @param characterId Character ID to fetch skills for
   * @returns Array of character skills
   */
  @Get('character/:characterId')
  async getSkillsByCharacter(
    @Param('characterId') characterId: number,
  ): Promise<ValheimCharacterSkill[]> {
    return await this.skillService.findSkillsByCharacter(characterId);
  }

  /**
   * Get skill summary for a character including total level and skill count
   * @param characterId Character ID to get summary for
   * @returns Character skill summary object
   */
  @Get('character/:characterId/summary')
  async getCharacterSkillSummary(
    @Param('characterId') characterId: number,
  ): Promise<any> {
    return await this.skillService.getCharacterSkillSummary(characterId);
  }

  /**
   * Get a specific skill for a character by skill name
   * @param characterId Character ID
   * @param skillName Name of the skill to retrieve
   * @returns Character skill or null if not found
   */
  @Get('character/:characterId/:skillName')
  async getSkillByCharacterAndName(
    @Param('characterId') characterId: number,
    @Param('skillName') skillName: string,
  ): Promise<ValheimCharacterSkill | null> {
    return await this.skillService.findSkillByCharacterAndName(
      characterId,
      skillName,
    );
  }

  /**
   * Update an existing skill
   * @param id Skill ID to update
   * @param updateSkillDto Skill update data
   * @returns Updated skill or null if not found
   */
  @Put(':id')
  async updateSkill(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
  ): Promise<ValheimCharacterSkill | null> {
    return await this.skillService.updateSkill(id, updateSkillDto);
  }

  /**
   * Apply death penalty to all character skills
   * @param characterId Character ID to apply penalty to
   * @param penaltyPercentage Optional penalty percentage (default from service)
   * @returns Updated character skills after penalty
   */
  @Put('character/:characterId/death-penalty')
  async applyDeathPenalty(
    @Param('characterId') characterId: number,
    @Body('penaltyPercentage') penaltyPercentage?: number,
  ): Promise<ValheimCharacterSkill[]> {
    return await this.skillService.applyDeathPenalty(
      characterId,
      penaltyPercentage,
    );
  }

  /**
   * Get leaderboard for a specific skill
   * @param skillName Name of the skill for leaderboard
   * @param limit Optional limit for results (default: 10)
   * @returns Array of top character skills
   */
  @Get('leaderboard/:skillName')
  async getSkillLeaderboard(
    @Param('skillName') skillName: string,
    @Query('limit') limit?: string,
  ): Promise<ValheimCharacterSkill[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return await this.skillService.getSkillLeaderboard(skillName, limitNum);
  }

  /**
   * Get list of all available skill names
   * @returns Array of available skill names
   */
  @Get('available')
  getAvailableSkills(): string[] {
    return this.skillService.getAvailableSkills();
  }

  /**
   * Delete a character skill
   * @param id Skill ID to delete
   * @returns Success message
   */
  @Delete(':id')
  async deleteSkill(@Param('id') id: string): Promise<{ message: string }> {
    await this.skillService.deleteSkill(id);
    return { message: 'Skill deleted successfully' };
  }
}
