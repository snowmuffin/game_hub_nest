import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValheimBuilding } from './valheim-building.entity';

export interface CreateBuildingDto {
  userId: string;
  serverId: string;
  buildingName: string;
  buildingType: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  health?: number;
  maxHealth?: number;
  materialsUsed?: Record<string, number>;
}

export interface UpdateBuildingDto {
  buildingName?: string;
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  health?: number;
  materialsUsed?: Record<string, number>;
  isActive?: boolean;
}

@Injectable()
export class ValheimBuildingService {
  constructor(
    @InjectRepository(ValheimBuilding)
    private buildingRepository: Repository<ValheimBuilding>,
  ) {}

  async createBuilding(createBuildingDto: CreateBuildingDto): Promise<ValheimBuilding> {
    const building = this.buildingRepository.create(createBuildingDto);
    return await this.buildingRepository.save(building);
  }

  async findByUserId(userId: string): Promise<ValheimBuilding[]> {
    return await this.buildingRepository.find({
      where: { userId, isActive: true },
      relations: ['user', 'server'],
    });
  }

  async findByServer(serverId: string): Promise<ValheimBuilding[]> {
    return await this.buildingRepository.find({
      where: { serverId, isActive: true },
      relations: ['user', 'server'],
    });
  }

  async findByUserAndServer(userId: string, serverId: string): Promise<ValheimBuilding[]> {
    return await this.buildingRepository.find({
      where: { userId, serverId, isActive: true },
      relations: ['user', 'server'],
    });
  }

  async findById(id: string): Promise<ValheimBuilding | null> {
    return await this.buildingRepository.findOne({
      where: { id },
      relations: ['user', 'server'],
    });
  }

  async updateBuilding(id: string, updateBuildingDto: UpdateBuildingDto): Promise<ValheimBuilding | null> {
    await this.buildingRepository.update(id, updateBuildingDto);
    return await this.findById(id);
  }

  async deleteBuilding(id: string): Promise<void> {
    await this.buildingRepository.update(id, { isActive: false });
  }

  async destroyBuilding(id: string): Promise<void> {
    await this.buildingRepository.delete(id);
  }

  async findByType(buildingType: string, serverId?: string): Promise<ValheimBuilding[]> {
    const where: any = { buildingType, isActive: true };
    if (serverId) {
      where.serverId = serverId;
    }

    return await this.buildingRepository.find({
      where,
      relations: ['user', 'server'],
    });
  }

  async damageBuildingOveTime(id: string, damageAmount: number): Promise<ValheimBuilding | null> {
    const building = await this.findById(id);
    if (!building) return null;

    const newHealth = Math.max(0, building.health - damageAmount);
    const isActive = newHealth > 0;

    return await this.updateBuilding(id, { 
      health: newHealth, 
      isActive 
    });
  }

  async repairBuilding(id: string, repairAmount: number): Promise<ValheimBuilding | null> {
    const building = await this.findById(id);
    if (!building) return null;

    const newHealth = Math.min(building.maxHealth, building.health + repairAmount);

    return await this.updateBuilding(id, { 
      health: newHealth,
      isActive: true 
    });
  }
}
