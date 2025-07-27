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
  ValheimBuildingService,
  CreateBuildingDto,
  UpdateBuildingDto,
} from './valheim-building.service';
import { ValheimBuilding } from './valheim-building.entity';

@Controller('valheim/buildings')
@UseGuards(JwtAuthGuard)
export class ValheimBuildingController {
  constructor(private readonly buildingService: ValheimBuildingService) {}

  @Post()
  async createBuilding(
    @Body() createBuildingDto: CreateBuildingDto,
  ): Promise<ValheimBuilding> {
    return await this.buildingService.createBuilding(createBuildingDto);
  }

  @Get('user/:userId')
  async getBuildingsByUser(
    @Param('userId') userId: string,
  ): Promise<ValheimBuilding[]> {
    return await this.buildingService.findByUserId(userId);
  }

  @Get('server/:serverId')
  async getBuildingsByServer(
    @Param('serverId') serverId: string,
  ): Promise<ValheimBuilding[]> {
    return await this.buildingService.findByServer(serverId);
  }

  @Get('user/:userId/server/:serverId')
  async getBuildingsByUserAndServer(
    @Param('userId') userId: string,
    @Param('serverId') serverId: string,
  ): Promise<ValheimBuilding[]> {
    return await this.buildingService.findByUserAndServer(userId, serverId);
  }

  @Get('type/:buildingType')
  async getBuildingsByType(
    @Param('buildingType') buildingType: string,
    @Query('serverId') serverId?: string,
  ): Promise<ValheimBuilding[]> {
    return await this.buildingService.findByType(buildingType, serverId);
  }

  @Get(':id')
  async getBuildingById(
    @Param('id') id: string,
  ): Promise<ValheimBuilding | null> {
    return await this.buildingService.findById(id);
  }

  @Put(':id')
  async updateBuilding(
    @Param('id') id: string,
    @Body() updateBuildingDto: UpdateBuildingDto,
  ): Promise<ValheimBuilding | null> {
    return await this.buildingService.updateBuilding(id, updateBuildingDto);
  }

  @Delete(':id')
  async deleteBuilding(@Param('id') id: string): Promise<{ message: string }> {
    await this.buildingService.deleteBuilding(id);
    return { message: 'Building deactivated successfully' };
  }

  @Delete(':id/destroy')
  async destroyBuilding(@Param('id') id: string): Promise<{ message: string }> {
    await this.buildingService.destroyBuilding(id);
    return { message: 'Building permanently destroyed' };
  }

  @Put(':id/damage')
  async damageBuilding(
    @Param('id') id: string,
    @Body('damageAmount') damageAmount: number,
  ): Promise<ValheimBuilding | null> {
    return await this.buildingService.damageBuildingOveTime(id, damageAmount);
  }

  @Put(':id/repair')
  async repairBuilding(
    @Param('id') id: string,
    @Body('repairAmount') repairAmount: number,
  ): Promise<ValheimBuilding | null> {
    return await this.buildingService.repairBuilding(id, repairAmount);
  }
}
