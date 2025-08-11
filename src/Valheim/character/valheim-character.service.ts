import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValheimCharacter } from './valheim-character.entity';
import { User } from '../../entities/user.entity';

export interface CreateCharacterDto {
  user_id: number;
  character_name: string;
}

export interface UpdateCharacterDto {
  character_name?: string;
  level?: number;
  experience?: number;
  health?: number;
  stamina?: number;
  eitr?: number;
  position_x?: number;
  position_y?: number;
  position_z?: number;
  current_biome?: string;
  defeated_bosses?: string[];
  discovered_locations?: string[];
  unlocked_recipes?: string[];
  play_time_seconds?: number;
  deaths?: number;
  enemies_killed?: number;
  distance_walked?: number;
  items_crafted?: number;
  metadata?: any;
}

export interface UpdateSkillsDto {
  skill_axes?: number;
  skill_bows?: number;
  skill_clubs?: number;
  skill_knives?: number;
  skill_polearms?: number;
  skill_spears?: number;
  skill_swords?: number;
  skill_unarmed?: number;
  skill_blocking?: number;
  skill_jump?: number;
  skill_run?: number;
  skill_sneak?: number;
  skill_swim?: number;
  skill_fishing?: number;
  skill_wood_cutting?: number;
  skill_cooking?: number;
  skill_farming?: number;
}

@Injectable()
export class ValheimCharacterService {
  private readonly logger = new Logger(ValheimCharacterService.name);

  constructor(
    @InjectRepository(ValheimCharacter)
    private readonly characterRepository: Repository<ValheimCharacter>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 모든 캐릭터 조회
   */
  async findAll(): Promise<ValheimCharacter[]> {
    return await this.characterRepository.find({
      relations: ['user'],
      where: { is_active: true },
      order: { level: 'DESC' },
    });
  }

  /**
   * 사용자의 캐릭터 조회
   */
  async findByUserId(userId: number): Promise<ValheimCharacter> {
    const character = await this.characterRepository.findOne({
      where: { user_id: userId, is_active: true },
      relations: ['user'],
    });

    if (!character) {
      throw new NotFoundException(`Character for user ${userId} not found`);
    }

    return character;
  }

  /**
   * ID로 캐릭터 조회
   */
  async findById(id: number): Promise<ValheimCharacter> {
    const character = await this.characterRepository.findOne({
      where: { id, is_active: true },
      relations: ['user'],
    });

    if (!character) {
      throw new NotFoundException(`Character with ID ${id} not found`);
    }

    return character;
  }

  /**
   * 새 캐릭터 생성
   */
  async create(createDto: CreateCharacterDto): Promise<ValheimCharacter> {
    // 사용자 존재 확인
    const user = await this.userRepository.findOne({
      where: { id: createDto.user_id },
    });
    if (!user) {
      throw new NotFoundException(
        `User with ID ${createDto.user_id} not found`,
      );
    }

    // 이미 캐릭터가 있는지 확인
    const existingCharacter = await this.characterRepository.findOne({
      where: { user_id: createDto.user_id, is_active: true },
    });

    if (existingCharacter) {
      throw new BadRequestException(
        `Character already exists for user ${createDto.user_id}`,
      );
    }

    const character = this.characterRepository.create(createDto);
    const savedCharacter = await this.characterRepository.save(character);

    this.logger.log(
      `Created new character: ${savedCharacter.character_name} for user ${createDto.user_id}`,
    );
    return savedCharacter;
  }

  /**
   * 캐릭터 정보 업데이트
   */
  async update(
    userId: number,
    updateDto: UpdateCharacterDto,
  ): Promise<ValheimCharacter> {
    const character = await this.findByUserId(userId);

    Object.assign(character, updateDto);
    const updatedCharacter = await this.characterRepository.save(character);

    this.logger.log(`Updated character for user ${userId}`);
    return updatedCharacter;
  }

  /**
   * 캐릭터 스킬 업데이트
   */
  async updateSkills(
    userId: number,
    skillsDto: UpdateSkillsDto,
  ): Promise<ValheimCharacter> {
    const character = await this.findByUserId(userId);

    // 스킬 레벨은 0-100 사이여야 함
    for (const [skill, level] of Object.entries(skillsDto)) {
      if (level !== undefined && (level < 0 || level > 100)) {
        throw new BadRequestException(
          `${skill} level must be between 0 and 100`,
        );
      }
    }

    Object.assign(character, skillsDto);
    const updatedCharacter = await this.characterRepository.save(character);

    this.logger.log(`Updated skills for character ${character.character_name}`);
    return updatedCharacter;
  }

  /**
   * 보스 처치 기록
   */
  async defeatBoss(
    userId: number,
    bossName: string,
  ): Promise<ValheimCharacter> {
    const character = await this.findByUserId(userId);

    if (!character.defeated_bosses) {
      character.defeated_bosses = [];
    }

    if (!character.defeated_bosses.includes(bossName)) {
      character.defeated_bosses.push(bossName);
      const updatedCharacter = await this.characterRepository.save(character);

      this.logger.log(
        `Character ${character.character_name} defeated boss: ${bossName}`,
      );
      return updatedCharacter;
    }

    return character;
  }

  /**
   * 위치 발견 기록
   */
  async discoverLocation(
    userId: number,
    locationName: string,
  ): Promise<ValheimCharacter> {
    const character = await this.findByUserId(userId);

    if (!character.discovered_locations) {
      character.discovered_locations = [];
    }

    if (!character.discovered_locations.includes(locationName)) {
      character.discovered_locations.push(locationName);
      const updatedCharacter = await this.characterRepository.save(character);

      this.logger.log(
        `Character ${character.character_name} discovered location: ${locationName}`,
      );
      return updatedCharacter;
    }

    return character;
  }

  /**
   * 제작법 해금
   */
  async unlockRecipe(
    userId: number,
    recipeName: string,
  ): Promise<ValheimCharacter> {
    const character = await this.findByUserId(userId);

    if (!character.unlocked_recipes) {
      character.unlocked_recipes = [];
    }

    if (!character.unlocked_recipes.includes(recipeName)) {
      character.unlocked_recipes.push(recipeName);
      const updatedCharacter = await this.characterRepository.save(character);

      this.logger.log(
        `Character ${character.character_name} unlocked recipe: ${recipeName}`,
      );
      return updatedCharacter;
    }

    return character;
  }

  /**
   * 캐릭터 삭제 (비활성화)
   */
  async delete(userId: number): Promise<void> {
    const character = await this.findByUserId(userId);
    character.is_active = false;
    await this.characterRepository.save(character);

    this.logger.log(`Deactivated character for user ${userId}`);
  }

  /**
   * 레벨 랭킹 조회
   */
  async getLevelRankings(limit: number = 10): Promise<ValheimCharacter[]> {
    return await this.characterRepository.find({
      where: { is_active: true },
      relations: ['user'],
      order: { level: 'DESC', experience: 'DESC' },
      take: limit,
    });
  }

  /**
   * 스킬 랭킹 조회
   */
  async getSkillRankings(
    skillName: string,
    limit: number = 10,
  ): Promise<ValheimCharacter[]> {
    return await this.characterRepository
      .createQueryBuilder('character')
      .leftJoinAndSelect('character.user', 'user')
      .where('character.is_active = :isActive', { isActive: true })
      .orderBy(`character.${skillName}`, 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * 플레이 시간 랭킹 조회
   */
  async getPlayTimeRankings(limit: number = 10): Promise<ValheimCharacter[]> {
    return await this.characterRepository.find({
      where: { is_active: true },
      relations: ['user'],
      order: { play_time_seconds: 'DESC' },
      take: limit,
    });
  }

  /**
   * 캐릭터 통계
   */
  async getCharacterStats(): Promise<any> {
    const totalCharacters = await this.characterRepository.count({
      where: { is_active: true },
    });

    const avgLevel = await this.characterRepository
      .createQueryBuilder('character')
      .select('AVG(character.level)', 'avg_level')
      .where('character.is_active = :isActive', { isActive: true })
      .getRawOne();

    const maxLevel = await this.characterRepository
      .createQueryBuilder('character')
      .select('MAX(character.level)', 'max_level')
      .where('character.is_active = :isActive', { isActive: true })
      .getRawOne();

    const totalPlayTime = await this.characterRepository
      .createQueryBuilder('character')
      .select('SUM(character.play_time_seconds)', 'total_play_time')
      .where('character.is_active = :isActive', { isActive: true })
      .getRawOne();

    return {
      total_characters: totalCharacters,
      average_level: Math.round(parseFloat(avgLevel.avg_level) || 0),
      max_level: parseInt(maxLevel.max_level) || 0,
      total_play_time_hours: Math.round(
        (parseInt(totalPlayTime.total_play_time) || 0) / 3600,
      ),
    };
  }
}
