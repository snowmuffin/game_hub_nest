import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValheimWorld, ValheimBiome, ValheimBossEncounter } from './valheim-world.entity';

export interface CreateWorldDto {
  serverId: string;
  worldName: string;
  worldSeed: string;
  worldSize?: number;
  isHardcore?: boolean;
  maxPlayers?: number;
}

export interface UpdateWorldDto {
  worldName?: string;
  dayCount?: number;
  timeOfDay?: number;
  defeatedBosses?: string[];
  discoveredLocations?: string[];
  globalKeys?: string[];
  weatherState?: string;
  playerCount?: number;
  worldData?: Record<string, any>;
}

export interface CreateBiomeDto {
  worldId: string;
  biomeName: string;
  positionX: number;
  positionY: number;
  sizeRadius: number;
  biomeData?: Record<string, any>;
}

export interface CreateBossEncounterDto {
  worldId: string;
  bossName: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  bossData?: Record<string, any>;
}

@Injectable()
export class ValheimWorldService {
  constructor(
    @InjectRepository(ValheimWorld)
    private worldRepository: Repository<ValheimWorld>,
    @InjectRepository(ValheimBiome)
    private biomeRepository: Repository<ValheimBiome>,
    @InjectRepository(ValheimBossEncounter)
    private bossEncounterRepository: Repository<ValheimBossEncounter>,
  ) {}

  // World methods
  async createWorld(createWorldDto: CreateWorldDto): Promise<ValheimWorld> {
    const world = this.worldRepository.create(createWorldDto);
    return await this.worldRepository.save(world);
  }

  async findWorldsByServer(serverId: string): Promise<ValheimWorld[]> {
    return await this.worldRepository.find({
      where: { serverId },
      relations: ['server'],
    });
  }

  async findWorldById(id: string): Promise<ValheimWorld | null> {
    return await this.worldRepository.findOne({
      where: { id },
      relations: ['server', 'characters'],
    });
  }

  async updateWorld(id: string, updateWorldDto: UpdateWorldDto): Promise<ValheimWorld | null> {
    await this.worldRepository.update(id, updateWorldDto);
    return await this.findWorldById(id);
  }

  async deleteWorld(id: string): Promise<void> {
    await this.worldRepository.delete(id);
  }

  async advanceDay(worldId: string): Promise<ValheimWorld | null> {
    const world = await this.findWorldById(worldId);
    if (!world) return null;

    return await this.updateWorld(worldId, { 
      dayCount: world.dayCount + 1 
    });
  }

  async updateTimeOfDay(worldId: string, timeOfDay: number): Promise<ValheimWorld | null> {
    return await this.updateWorld(worldId, { timeOfDay });
  }

  async defeatBoss(worldId: string, bossName: string, participantUserIds: string[]): Promise<ValheimWorld | null> {
    const world = await this.findWorldById(worldId);
    if (!world) return null;

    const defeatedBosses = [...world.defeatedBosses];
    if (!defeatedBosses.includes(bossName)) {
      defeatedBosses.push(bossName);
    }

    // Update boss encounter
    const bossEncounter = await this.bossEncounterRepository.findOne({
      where: { worldId, bossName }
    });

    if (bossEncounter) {
      await this.bossEncounterRepository.update(bossEncounter.id, {
        isDefeated: true,
        defeatedAt: new Date(),
        defeatedByUsers: participantUserIds,
        attempts: bossEncounter.attempts + 1,
      });
    }

    return await this.updateWorld(worldId, { defeatedBosses });
  }

  // Biome methods
  async createBiome(createBiomeDto: CreateBiomeDto): Promise<ValheimBiome> {
    const biome = this.biomeRepository.create(createBiomeDto);
    return await this.biomeRepository.save(biome);
  }

  async findBiomesByWorld(worldId: string): Promise<ValheimBiome[]> {
    return await this.biomeRepository.find({
      where: { worldId },
      relations: ['world'],
    });
  }

  async updateBiomeExploration(biomeId: string, explorationPercentage: number): Promise<ValheimBiome | null> {
    const isExplored = explorationPercentage >= 100;
    await this.biomeRepository.update(biomeId, { 
      explorationPercentage, 
      isExplored 
    });
    
    return await this.biomeRepository.findOne({
      where: { id: biomeId }
    });
  }

  // Boss encounter methods
  async createBossEncounter(createBossEncounterDto: CreateBossEncounterDto): Promise<ValheimBossEncounter> {
    const bossEncounter = this.bossEncounterRepository.create(createBossEncounterDto);
    return await this.bossEncounterRepository.save(bossEncounter);
  }

  async findBossEncountersByWorld(worldId: string): Promise<ValheimBossEncounter[]> {
    return await this.bossEncounterRepository.find({
      where: { worldId },
      relations: ['world'],
    });
  }

  async attemptBoss(bossEncounterId: string): Promise<ValheimBossEncounter | null> {
    const bossEncounter = await this.bossEncounterRepository.findOne({
      where: { id: bossEncounterId }
    });
    
    if (!bossEncounter) return null;

    await this.bossEncounterRepository.update(bossEncounterId, {
      attempts: bossEncounter.attempts + 1
    });

    return await this.bossEncounterRepository.findOne({
      where: { id: bossEncounterId }
    });
  }

  async getWorldProgress(worldId: string): Promise<any> {
    const world = await this.findWorldById(worldId);
    const biomes = await this.findBiomesByWorld(worldId);
    const bossEncounters = await this.findBossEncountersByWorld(worldId);

    const totalBiomes = biomes.length;
    const exploredBiomes = biomes.filter(b => b.isExplored).length;
    const explorationProgress = totalBiomes > 0 ? (exploredBiomes / totalBiomes) * 100 : 0;

    const totalBosses = bossEncounters.length;
    const defeatedBosses = bossEncounters.filter(b => b.isDefeated).length;
    const bossProgress = totalBosses > 0 ? (defeatedBosses / totalBosses) * 100 : 0;

    return {
      world,
      biomes: {
        total: totalBiomes,
        explored: exploredBiomes,
        progress: explorationProgress
      },
      bosses: {
        total: totalBosses,
        defeated: defeatedBosses,
        progress: bossProgress,
        encounters: bossEncounters
      }
    };
  }
}
