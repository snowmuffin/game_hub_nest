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
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  ValheimCharacterService,
  CreateCharacterDto,
  UpdateCharacterDto,
  UpdateSkillsDto,
} from './valheim-character.service';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    steamId: string;
    username: string;
  };
}

@Controller('valheim/character')
export class ValheimCharacterController {
  constructor(private readonly characterService: ValheimCharacterService) {}

  /**
   * Get all characters (ranking)
   */
  @Get()
  async getAllCharacters() {
    return await this.characterService.findAll();
  }

  /**
   * Get current user's character
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyCharacter(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return await this.characterService.findByUserId(userId);
  }

  /**
   * Get specific character
   */
  @Get(':id')
  async getCharacterById(@Param('id', ParseIntPipe) id: number) {
    return await this.characterService.findById(id);
  }

  /**
   * Get level rankings
   */
  @Get('rankings/level')
  async getLevelRankings(@Query('limit') limit: string = '10') {
    return await this.characterService.getLevelRankings(parseInt(limit));
  }

  /**
   * Get skill rankings
   */
  @Get('rankings/skill/:skillName')
  async getSkillRankings(
    @Param('skillName') skillName: string,
    @Query('limit') limit: string = '10',
  ) {
    return await this.characterService.getSkillRankings(
      skillName,
      parseInt(limit),
    );
  }

  /**
   * Get playtime rankings
   */
  @Get('rankings/playtime')
  async getPlayTimeRankings(@Query('limit') limit: string = '10') {
    return await this.characterService.getPlayTimeRankings(parseInt(limit));
  }

  /**
   * Get character statistics
   */
  @Get('stats/overview')
  async getCharacterStats() {
    return await this.characterService.getCharacterStats();
  }

  /**
   * Create new character
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async createCharacter(
    @Req() req: AuthenticatedRequest,
    @Body() createDto: CreateCharacterDto,
  ) {
    createDto.user_id = req.user.id;
    return await this.characterService.create(createDto);
  }

  /**
   * Update character information
   */
  @Put()
  @UseGuards(JwtAuthGuard)
  async updateCharacter(
    @Req() req: AuthenticatedRequest,
    @Body() updateDto: UpdateCharacterDto,
  ) {
    const userId = req.user.id;
    return await this.characterService.update(userId, updateDto);
  }

  /**
   * Update character skills
   */
  @Put('skills')
  @UseGuards(JwtAuthGuard)
  async updateSkills(
    @Req() req: AuthenticatedRequest,
    @Body() skillsDto: UpdateSkillsDto,
  ) {
    const userId = req.user.id;
    return await this.characterService.updateSkills(userId, skillsDto);
  }

  /**
   * Record boss defeat
   */
  @Post('boss/defeat')
  @UseGuards(JwtAuthGuard)
  async defeatBoss(
    @Req() req: AuthenticatedRequest,
    @Body() body: { boss_name: string },
  ) {
    const userId = req.user.id;
    return await this.characterService.defeatBoss(userId, body.boss_name);
  }

  /**
   * Record location discovery
   */
  @Post('location/discover')
  @UseGuards(JwtAuthGuard)
  async discoverLocation(
    @Req() req: AuthenticatedRequest,
    @Body() body: { location_name: string },
  ) {
    const userId = req.user.id;
    return await this.characterService.discoverLocation(
      userId,
      body.location_name,
    );
  }

  /**
   * Unlock recipe
   */
  @Post('recipe/unlock')
  @UseGuards(JwtAuthGuard)
  async unlockRecipe(
    @Req() req: AuthenticatedRequest,
    @Body() body: { recipe_name: string },
  ) {
    const userId = req.user.id;
    return await this.characterService.unlockRecipe(userId, body.recipe_name);
  }

  /**
   * Delete character
   */
  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteCharacter(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    await this.characterService.delete(userId);
    return { message: 'Character deleted successfully' };
  }
}
