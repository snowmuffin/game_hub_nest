import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  ValheimWorldService,
  CreateWorldDto,
  UpdateWorldDto,
  CreateBiomeDto,
  CreateBossEncounterDto,
} from './valheim-world.service';
import {
  ValheimWorld,
  ValheimBiome,
  ValheimBossEncounter,
} from '../../entities/valheim/valheim-world.entity';

@Controller('valheim/worlds')
@UseGuards(JwtAuthGuard)
export class ValheimWorldController {
  constructor(private readonly worldService: ValheimWorldService) {}

  // World endpoints
  @Post()
  async createWorld(
    @Body() createWorldDto: CreateWorldDto,
  ): Promise<ValheimWorld> {
    return await this.worldService.createWorld(createWorldDto);
  }

  @Get('server/:serverId')
  async getWorldsByServer(
    @Param('serverId') serverId: string,
  ): Promise<ValheimWorld[]> {
    return await this.worldService.findWorldsByServer(serverId);
  }

  @Get(':id')
  async getWorldById(@Param('id') id: string): Promise<ValheimWorld | null> {
    return await this.worldService.findWorldById(id);
  }

  @Put(':id')
  async updateWorld(
    @Param('id') id: string,
    @Body() updateWorldDto: UpdateWorldDto,
  ): Promise<ValheimWorld | null> {
    return await this.worldService.updateWorld(id, updateWorldDto);
  }

  @Delete(':id')
  async deleteWorld(@Param('id') id: string): Promise<{ message: string }> {
    await this.worldService.deleteWorld(id);
    return { message: 'World deleted successfully' };
  }

  @Put(':id/advance-day')
  async advanceDay(@Param('id') id: string): Promise<ValheimWorld | null> {
    return await this.worldService.advanceDay(id);
  }

  @Put(':id/time')
  async updateTimeOfDay(
    @Param('id') id: string,
    @Body('timeOfDay') timeOfDay: number,
  ): Promise<ValheimWorld | null> {
    return await this.worldService.updateTimeOfDay(id, timeOfDay);
  }

  @Put(':id/defeat-boss')
  async defeatBoss(
    @Param('id') id: string,
    @Body() body: { bossName: string; participantUserIds: string[] },
  ): Promise<ValheimWorld | null> {
    return await this.worldService.defeatBoss(
      id,
      body.bossName,
      body.participantUserIds,
    );
  }

  @Get(':id/progress')
  async getWorldProgress(@Param('id') id: string): Promise<any> {
    return await this.worldService.getWorldProgress(id);
  }

  // Biome endpoints
  @Post(':worldId/biomes')
  async createBiome(
    @Param('worldId') worldId: string,
    @Body() createBiomeDto: Omit<CreateBiomeDto, 'worldId'>,
  ): Promise<ValheimBiome> {
    return await this.worldService.createBiome({ ...createBiomeDto, worldId });
  }

  @Get(':worldId/biomes')
  async getBiomesByWorld(
    @Param('worldId') worldId: string,
  ): Promise<ValheimBiome[]> {
    return await this.worldService.findBiomesByWorld(worldId);
  }

  @Put('biomes/:biomeId/exploration')
  async updateBiomeExploration(
    @Param('biomeId') biomeId: string,
    @Body('explorationPercentage') explorationPercentage: number,
  ): Promise<ValheimBiome | null> {
    return await this.worldService.updateBiomeExploration(
      biomeId,
      explorationPercentage,
    );
  }

  // Boss encounter endpoints
  @Post(':worldId/boss-encounters')
  async createBossEncounter(
    @Param('worldId') worldId: string,
    @Body() createBossEncounterDto: Omit<CreateBossEncounterDto, 'worldId'>,
  ): Promise<ValheimBossEncounter> {
    return await this.worldService.createBossEncounter({
      ...createBossEncounterDto,
      worldId,
    });
  }

  @Get(':worldId/boss-encounters')
  async getBossEncountersByWorld(
    @Param('worldId') worldId: string,
  ): Promise<ValheimBossEncounter[]> {
    return await this.worldService.findBossEncountersByWorld(worldId);
  }

  @Put('boss-encounters/:bossEncounterId/attempt')
  async attemptBoss(
    @Param('bossEncounterId') bossEncounterId: string,
  ): Promise<ValheimBossEncounter | null> {
    return await this.worldService.attemptBoss(bossEncounterId);
  }
}
