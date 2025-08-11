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

@Controller('valheim/skills')
@UseGuards(JwtAuthGuard)
export class ValheimSkillController {
  constructor(private readonly skillService: ValheimSkillService) {}

  @Post('experience')
  async addSkillExperience(
    @Body() addSkillDto: AddSkillExperienceDto,
  ): Promise<ValheimCharacterSkill> {
    return await this.skillService.createOrUpdateSkill(addSkillDto);
  }

  @Get('character/:characterId')
  async getSkillsByCharacter(
    @Param('characterId') characterId: number,
  ): Promise<ValheimCharacterSkill[]> {
    return await this.skillService.findSkillsByCharacter(characterId);
  }

  @Get('character/:characterId/summary')
  async getCharacterSkillSummary(
    @Param('characterId') characterId: number,
  ): Promise<any> {
    return await this.skillService.getCharacterSkillSummary(characterId);
  }

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

  @Put(':id')
  async updateSkill(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
  ): Promise<ValheimCharacterSkill | null> {
    return await this.skillService.updateSkill(id, updateSkillDto);
  }

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

  @Get('leaderboard/:skillName')
  async getSkillLeaderboard(
    @Param('skillName') skillName: string,
    @Query('limit') limit?: string,
  ): Promise<ValheimCharacterSkill[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return await this.skillService.getSkillLeaderboard(skillName, limitNum);
  }

  @Get('available')
  async getAvailableSkills(): Promise<string[]> {
    return this.skillService.getAvailableSkills();
  }

  @Delete(':id')
  async deleteSkill(@Param('id') id: string): Promise<{ message: string }> {
    await this.skillService.deleteSkill(id);
    return { message: 'Skill deleted successfully' };
  }
}
