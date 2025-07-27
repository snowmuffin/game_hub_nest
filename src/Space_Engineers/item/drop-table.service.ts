import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { DropTable } from './drop-table.entity';

@Injectable()
export class DropTableService {
  constructor(
    @InjectRepository(DropTable)
    private dropTableRepository: Repository<DropTable>,
  ) {}

  async findAll(): Promise<DropTable[]> {
    return this.dropTableRepository.find({
      where: { is_active: true },
      order: { rarity: 'ASC', item_name: 'ASC' },
    });
  }

  async findByRarity(maxRarity: number): Promise<DropTable[]> {
    const whereCondition: any = { is_active: true };
    if (maxRarity) {
      whereCondition.rarity = LessThanOrEqual(maxRarity);
    }

    return this.dropTableRepository.find({
      where: whereCondition,
      order: { rarity: 'ASC' },
    });
  }

  async create(createDropTableDto: Partial<DropTable>): Promise<DropTable> {
    const dropTable = this.dropTableRepository.create(createDropTableDto);
    return this.dropTableRepository.save(dropTable);
  }

  async update(
    id: number,
    updateDropTableDto: Partial<DropTable>,
  ): Promise<DropTable> {
    const dropTable = await this.dropTableRepository.findOne({ where: { id } });
    if (!dropTable) {
      throw new NotFoundException(`Drop table entry with ID ${id} not found`);
    }

    Object.assign(dropTable, updateDropTableDto);
    return this.dropTableRepository.save(dropTable);
  }

  async remove(id: number): Promise<void> {
    const dropTable = await this.dropTableRepository.findOne({ where: { id } });
    if (!dropTable) {
      throw new NotFoundException(`Drop table entry with ID ${id} not found`);
    }

    // Soft delete by setting is_active to false
    dropTable.is_active = false;
    await this.dropTableRepository.save(dropTable);
  }

  // 게임에서 사용할 드롭 계산 메서드
  async calculateGameDrop(
    damage: number,
    mult: number,
    maxRarity: number,
  ): Promise<string | null> {
    const minDropChance = 0.001;
    const maxDropChance = 0.7;
    const minDamage = 1;
    const maxDamage = 50;

    // 드롭 확률 계산
    const dropChance = Math.min(
      maxDropChance,
      Math.max(
        minDropChance,
        ((damage - minDamage) / (maxDamage - minDamage)) *
          (maxDropChance - minDropChance) +
          minDropChance,
      ),
    );

    const randomChance = Math.random();
    if (randomChance > dropChance) {
      return null;
    }

    // 데이터베이스에서 드롭 가능한 아이템들 가져오기
    const dropItems = await this.dropTableRepository
      .createQueryBuilder('drop_table')
      .where('drop_table.is_active = :isActive', { isActive: true })
      .andWhere('drop_table.rarity <= :maxRarity', { maxRarity })
      .getMany();

    if (dropItems.length === 0) {
      return null;
    }

    // 가중치 계산
    const adjustedWeights: Record<string, number> = {};
    let totalWeight = 0;

    for (const item of dropItems) {
      const adjustedWeight =
        Math.pow(mult, item.rarity) * item.drop_rate_multiplier;
      adjustedWeights[item.item_id] = adjustedWeight;
      totalWeight += adjustedWeight;
    }

    // 아이템 선택
    let accumulatedProbability = 0;
    const randomValue = Math.random() * totalWeight;

    for (const [itemId, weight] of Object.entries(adjustedWeights)) {
      accumulatedProbability += weight;
      if (randomValue <= accumulatedProbability) {
        return itemId;
      }
    }

    return null;
  }

  // Admin functionality methods
  async getDropTableItems(options: {
    page: number;
    limit: number;
    rarity?: number;
    isActive?: boolean;
  }): Promise<{
    items: DropTable[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page, limit, rarity, isActive } = options;
    const skip = (page - 1) * limit;

    const queryBuilder =
      this.dropTableRepository.createQueryBuilder('drop_table');

    if (rarity !== undefined) {
      queryBuilder.andWhere('drop_table.rarity = :rarity', { rarity });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('drop_table.is_active = :isActive', { isActive });
    }

    queryBuilder
      .orderBy('drop_table.rarity', 'ASC')
      .addOrderBy('drop_table.item_name', 'ASC')
      .skip(skip)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDropTableItemById(id: number): Promise<DropTable | null> {
    return this.dropTableRepository.findOne({ where: { id } });
  }

  async getAvailableItemsFromItemsTable(options: {
    search?: string;
    rarity?: number;
  }): Promise<any[]> {
    // items 테이블에서 아이템 조회 (space_engineers 스키마)
    const queryBuilder = this.dropTableRepository.manager
      .createQueryBuilder()
      .select([
        'items.itemId as item_id',
        'items.displayName as display_name',
        'items.rarity',
        'items.description',
      ])
      .from('space_engineers.items', 'items');

    if (options.search) {
      queryBuilder.andWhere(
        '(items.itemId ILIKE :search OR items.displayName ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    if (options.rarity !== undefined) {
      queryBuilder.andWhere('items.rarity = :rarity', {
        rarity: options.rarity,
      });
    }

    // 이미 드롭 테이블에 있는 아이템들 제외
    const existingItemIds = await this.dropTableRepository
      .createQueryBuilder('drop_table')
      .select('drop_table.item_id')
      .getRawMany();

    if (existingItemIds.length > 0) {
      queryBuilder.andWhere('items.itemId NOT IN (:...existingIds)', {
        existingIds: existingItemIds.map((item) => item.item_id),
      });
    }

    queryBuilder
      .orderBy('items.rarity', 'ASC')
      .addOrderBy('items.displayName', 'ASC');

    return queryBuilder.getRawMany();
  }

  async addDropTableItem(createDropTableDto: {
    item_id: string;
    drop_rate_multiplier?: number;
    is_active?: boolean;
    description?: string;
  }): Promise<DropTable> {
    // items 테이블에서 해당 아이템이 존재하는지 확인
    const itemExists = await this.dropTableRepository.manager
      .createQueryBuilder()
      .select('1')
      .from('space_engineers.items', 'items')
      .where('items.itemId = :itemId', { itemId: createDropTableDto.item_id })
      .getRawOne();

    if (!itemExists) {
      throw new BadRequestException(
        `Item with ID ${createDropTableDto.item_id} does not exist in items table`,
      );
    }

    // 이미 드롭 테이블에 있는지 확인
    const existingDropItem = await this.dropTableRepository.findOne({
      where: { item_id: createDropTableDto.item_id },
    });

    if (existingDropItem) {
      throw new BadRequestException(
        `Item with ID ${createDropTableDto.item_id} already exists in drop table`,
      );
    }

    // items 테이블에서 아이템 정보 가져오기
    const itemInfo = await this.dropTableRepository.manager
      .createQueryBuilder()
      .select(['items.itemId', 'items.displayName', 'items.rarity'])
      .from('space_engineers.items', 'items')
      .where('items.itemId = :itemId', { itemId: createDropTableDto.item_id })
      .getRawOne();

    const dropTableItem = this.dropTableRepository.create({
      item_id: createDropTableDto.item_id,
      item_name: itemInfo.displayName || createDropTableDto.item_id,
      rarity: itemInfo.rarity,
      drop_rate_multiplier: createDropTableDto.drop_rate_multiplier || 1.0,
      is_active:
        createDropTableDto.is_active !== undefined
          ? createDropTableDto.is_active
          : true,
      description: createDropTableDto.description || '',
    });

    return this.dropTableRepository.save(dropTableItem);
  }

  async updateDropTableItem(
    id: number,
    updateDropTableDto: {
      drop_rate_multiplier?: number;
      is_active?: boolean;
      description?: string;
    },
  ): Promise<DropTable> {
    const dropTable = await this.dropTableRepository.findOne({ where: { id } });
    if (!dropTable) {
      throw new NotFoundException(`Drop table item with ID ${id} not found`);
    }

    if (updateDropTableDto.drop_rate_multiplier !== undefined) {
      dropTable.drop_rate_multiplier = updateDropTableDto.drop_rate_multiplier;
    }
    if (updateDropTableDto.is_active !== undefined) {
      dropTable.is_active = updateDropTableDto.is_active;
    }
    if (updateDropTableDto.description !== undefined) {
      dropTable.description = updateDropTableDto.description;
    }

    return this.dropTableRepository.save(dropTable);
  }

  async removeDropTableItem(id: number): Promise<void> {
    const dropTable = await this.dropTableRepository.findOne({ where: { id } });
    if (!dropTable) {
      throw new NotFoundException(`Drop table item with ID ${id} not found`);
    }

    // 완전 삭제 또는 soft delete 선택 가능
    await this.dropTableRepository.remove(dropTable);
  }

  async getDropTableStats(): Promise<{
    totalItems: number;
    activeItems: number;
    inactiveItems: number;
    rarityDistribution: { rarity: number; count: number }[];
    averageDropRate: number;
  }> {
    const totalItems = await this.dropTableRepository.count();
    const activeItems = await this.dropTableRepository.count({
      where: { is_active: true },
    });
    const inactiveItems = totalItems - activeItems;

    const rarityDistribution = await this.dropTableRepository
      .createQueryBuilder('drop_table')
      .select('drop_table.rarity', 'rarity')
      .addSelect('COUNT(*)', 'count')
      .groupBy('drop_table.rarity')
      .orderBy('drop_table.rarity', 'ASC')
      .getRawMany();

    const avgResult = await this.dropTableRepository
      .createQueryBuilder('drop_table')
      .select('AVG(drop_table.drop_rate_multiplier)', 'avg')
      .where('drop_table.is_active = :isActive', { isActive: true })
      .getRawOne();

    return {
      totalItems,
      activeItems,
      inactiveItems,
      rarityDistribution: rarityDistribution.map((item) => ({
        rarity: parseInt(item.rarity),
        count: parseInt(item.count),
      })),
      averageDropRate: parseFloat(avgResult.avg) || 0,
    };
  }

  // 기존 하드코딩된 드롭 테이블을 데이터베이스로 마이그레이션하는 메서드
  async migrateFromHardcodedDropTable(): Promise<{
    migratedCount: number;
    skippedCount: number;
    errors: string[];
  }> {
    const hardcodedDropTable: Record<string, number> = {
      PrototechFrame: 11,
      PrototechPanel: 4,
      PrototechCapacitor: 4,
      PrototechPropulsionUnit: 4,
      PrototechMachinery: 4,
      PrototechCircuitry: 4,
      PrototechCoolingUnit: 8,
      DefenseUpgradeModule_Level1: 5,
      DefenseUpgradeModule_Level2: 6,
      DefenseUpgradeModule_Level3: 7,
      DefenseUpgradeModule_Level4: 8,
      DefenseUpgradeModule_Level5: 9,
      DefenseUpgradeModule_Level6: 10,
      DefenseUpgradeModule_Level7: 11,
      DefenseUpgradeModule_Level8: 12,
      DefenseUpgradeModule_Level9: 13,
      DefenseUpgradeModule_Level10: 14,
      AttackUpgradeModule_Level1: 5,
      AttackUpgradeModule_Level2: 6,
      AttackUpgradeModule_Level3: 7,
      AttackUpgradeModule_Level4: 8,
      AttackUpgradeModule_Level5: 9,
      AttackUpgradeModule_Level6: 10,
      AttackUpgradeModule_Level7: 11,
      AttackUpgradeModule_Level8: 12,
      AttackUpgradeModule_Level9: 13,
      AttackUpgradeModule_Level10: 14,
      PowerEfficiencyUpgradeModule_Level1: 5,
      PowerEfficiencyUpgradeModule_Level2: 6,
      PowerEfficiencyUpgradeModule_Level3: 7,
      PowerEfficiencyUpgradeModule_Level4: 8,
      PowerEfficiencyUpgradeModule_Level5: 9,
      PowerEfficiencyUpgradeModule_Level6: 10,
      PowerEfficiencyUpgradeModule_Level7: 11,
      PowerEfficiencyUpgradeModule_Level8: 12,
      PowerEfficiencyUpgradeModule_Level9: 13,
      PowerEfficiencyUpgradeModule_Level10: 14,
      BerserkerModule_Level1: 11,
      BerserkerModule_Level2: 12,
      BerserkerModule_Level3: 13,
      BerserkerModule_Level4: 14,
      BerserkerModule_Level5: 15,
      BerserkerModule_Level6: 16,
      BerserkerModule_Level7: 17,
      BerserkerModule_Level8: 18,
      BerserkerModule_Level9: 19,
      BerserkerModule_Level10: 20,
      SpeedModule_Level1: 11,
      SpeedModule_Level2: 12,
      SpeedModule_Level3: 13,
      SpeedModule_Level4: 14,
      SpeedModule_Level5: 15,
      SpeedModule_Level6: 16,
      SpeedModule_Level7: 17,
      SpeedModule_Level8: 18,
      SpeedModule_Level9: 19,
      SpeedModule_Level10: 20,
      FortressModule_Level1: 11,
      FortressModule_Level2: 12,
      FortressModule_Level3: 13,
      FortressModule_Level4: 14,
      FortressModule_Level5: 15,
      FortressModule_Level6: 16,
      FortressModule_Level7: 17,
      FortressModule_Level8: 18,
      FortressModule_Level9: 19,
      FortressModule_Level10: 20,
      Prime_Matter: 3,
      prototech_scrap: 3,
      ingot_cerium: 4,
      ingot_lanthanum: 4,
      ingot_uranium: 3,
      ingot_platinum: 3,
      ingot_gold: 2,
      ingot_silver: 2,
    };

    let migratedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const [itemId, rarity] of Object.entries(hardcodedDropTable)) {
      try {
        // 이미 존재하는지 확인
        const existingItem = await this.dropTableRepository.findOne({
          where: { item_id: itemId },
        });

        if (!existingItem) {
          await this.dropTableRepository.save({
            item_id: itemId,
            item_name: itemId.replace(/_/g, ' '),
            rarity: rarity,
            drop_rate_multiplier: 1.0,
            is_active: true,
            description: `Migrated from hardcoded drop table`,
          });
          migratedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        errors.push(`Failed to migrate ${itemId}: ${error.message}`);
      }
    }

    return { migratedCount, skippedCount, errors };
  }
}
