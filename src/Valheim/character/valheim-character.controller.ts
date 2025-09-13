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
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  ValheimCharacterService,
  CreateCharacterDto,
  UpdateCharacterDto,
  UpdateSkillsDto,
} from './valheim-character.service';
import { ValheimCharacter } from '../../entities/valheim/valheim-character.entity';

type AuthenticatedRequest = { user: { id: number } };

@Controller('valheim/character')
export class ValheimCharacterController {
  constructor(private readonly characterService: ValheimCharacterService) {}

  /**
   * 모든 캐릭터 조회 (랭킹)
   */
  @Get()
  async getAllCharacters(): Promise<ValheimCharacter[]> {
    return await this.characterService.findAll();
  }

  /**
   * 현재 사용자의 캐릭터 조회
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyCharacter(
    @Req() req: AuthenticatedRequest,
  ): Promise<ValheimCharacter> {
    const userId = Number(req.user.id);
    return await this.characterService.findByUserId(userId);
  }

  /**
   * 특정 캐릭터 조회
   */
  @Get(':id')
  async getCharacterById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ValheimCharacter> {
    return await this.characterService.findById(id);
  }

  /**
   * 레벨 랭킹 조회
   */
  @Get('rankings/level')
  async getLevelRankings(
    @Query('limit') limit: string = '10',
  ): Promise<ValheimCharacter[]> {
    return await this.characterService.getLevelRankings(parseInt(limit));
  }

  /**
   * 스킬 랭킹 조회
   */
  @Get('rankings/skill/:skillName')
  async getSkillRankings(
    @Param('skillName') skillName: string,
    @Query('limit') limit: string = '10',
  ): Promise<ValheimCharacter[]> {
    return await this.characterService.getSkillRankings(
      skillName,
      parseInt(limit),
    );
  }

  /**
   * 플레이 시간 랭킹 조회
   */
  @Get('rankings/playtime')
  async getPlayTimeRankings(
    @Query('limit') limit: string = '10',
  ): Promise<ValheimCharacter[]> {
    return await this.characterService.getPlayTimeRankings(parseInt(limit));
  }

  /**
   * 캐릭터 통계
   */
  @Get('stats/overview')
  async getCharacterStats(): Promise<{
    total_characters: number;
    average_level: number;
    max_level: number;
    total_play_time_hours: number;
  }> {
    return await this.characterService.getCharacterStats();
  }

  /**
   * 새 캐릭터 생성
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async createCharacter(
    @Req() req: AuthenticatedRequest,
    @Body() createDto: CreateCharacterDto,
  ): Promise<ValheimCharacter> {
    createDto.user_id = Number(req.user.id);
    return await this.characterService.create(createDto);
  }

  /**
   * 캐릭터 정보 업데이트
   */
  @Put()
  @UseGuards(JwtAuthGuard)
  async updateCharacter(
    @Req() req: AuthenticatedRequest,
    @Body() updateDto: UpdateCharacterDto,
  ): Promise<ValheimCharacter> {
    const userId = Number(req.user.id);
    return await this.characterService.update(userId, updateDto);
  }

  /**
   * 캐릭터 스킬 업데이트
   */
  @Put('skills')
  @UseGuards(JwtAuthGuard)
  async updateSkills(
    @Req() req: AuthenticatedRequest,
    @Body() skillsDto: UpdateSkillsDto,
  ): Promise<ValheimCharacter> {
    const userId = Number(req.user.id);
    return await this.characterService.updateSkills(userId, skillsDto);
  }

  /**
   * 보스 처치 기록
   */
  @Post('boss/defeat')
  @UseGuards(JwtAuthGuard)
  async defeatBoss(
    @Req() req: AuthenticatedRequest,
    @Body() body: { boss_name: string },
  ): Promise<ValheimCharacter> {
    const userId = Number(req.user.id);
    return await this.characterService.defeatBoss(userId, body.boss_name);
  }

  /**
   * 위치 발견 기록
   */
  @Post('location/discover')
  @UseGuards(JwtAuthGuard)
  async discoverLocation(
    @Req() req: AuthenticatedRequest,
    @Body() body: { location_name: string },
  ): Promise<ValheimCharacter> {
    const userId = Number(req.user.id);
    return await this.characterService.discoverLocation(
      userId,
      body.location_name,
    );
  }

  /**
   * 제작법 해금
   */
  @Post('recipe/unlock')
  @UseGuards(JwtAuthGuard)
  async unlockRecipe(
    @Req() req: AuthenticatedRequest,
    @Body() body: { recipe_name: string },
  ): Promise<ValheimCharacter> {
    const userId = Number(req.user.id);
    return await this.characterService.unlockRecipe(userId, body.recipe_name);
  }

  /**
   * 캐릭터 삭제
   */
  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteCharacter(
    @Req() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    const userId = Number(req.user.id);
    await this.characterService.delete(userId);
    return { message: 'Character deleted successfully' };
  }
}
