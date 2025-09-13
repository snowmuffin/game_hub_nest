import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

// Basic pagination query
export class ListBlocksQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  take?: number;

  // Simple filters
  @IsOptional()
  @IsString()
  typeId?: string;

  @IsOptional()
  @IsString()
  subtypeId?: string;
}

class Vector3Dto {
  @Type(() => Number)
  @IsNumber()
  x: number;

  @Type(() => Number)
  @IsNumber()
  y: number;

  @Type(() => Number)
  @IsNumber()
  z: number;
}

export class CreateBlockDto {
  // Core identity
  @IsString()
  @MaxLength(100)
  typeId: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  subtypeId?: string | null;

  // Display
  @IsString()
  @MaxLength(255)
  displayName: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  icon?: string | null;

  // Classification
  @IsOptional()
  @IsString()
  cubeSize?: string | null;

  @IsOptional()
  @IsString()
  blockTopology?: string | null;

  // Geometry
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sizeX?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sizeY?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sizeZ?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  modelOffsetX?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  modelOffsetY?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  modelOffsetZ?: number | null;

  // Assets & audio
  @IsOptional()
  @IsString()
  sound?: string | null;

  @IsOptional()
  @IsString()
  model?: string | null;

  // Composition
  @IsOptional()
  @IsObject()
  components?: Array<Record<string, unknown>> | null;

  @IsOptional()
  @IsObject()
  criticalComponent?: Record<string, unknown> | null;

  // Placement
  @IsOptional()
  @IsObject()
  mountPoints?: Array<Record<string, unknown>> | null;

  // Build visuals
  @IsOptional()
  @IsObject()
  buildProgressModels?: Array<Record<string, unknown>> | null;

  // Pairing and symmetry
  @IsOptional()
  @IsString()
  blockPairName?: string | null;

  @IsOptional()
  @IsString()
  mirroringY?: string | null;

  @IsOptional()
  @IsString()
  mirroringZ?: string | null;

  // Build/Cost
  @IsOptional()
  @IsString()
  edgeType?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  buildTimeSeconds?: number | null;

  // Power & physics
  @IsOptional()
  @IsString()
  resourceSinkGroup?: string | null;

  @IsOptional()
  @IsString()
  resourceSourceGroup?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => Vector3Dto)
  minFieldSize?: Vector3Dto | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => Vector3Dto)
  maxFieldSize?: Vector3Dto | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minGravityAcceleration?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxGravityAcceleration?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  requiredPowerInput?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  basePowerInput?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  consumptionPower?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minRadius?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxRadius?: number | null;

  // FX & misc
  @IsOptional()
  @IsString()
  damageEffectName?: string | null;

  @IsOptional()
  @IsString()
  damagedSound?: string | null;

  @IsOptional()
  @IsString()
  destroyEffect?: string | null;

  @IsOptional()
  @IsString()
  destroySound?: string | null;

  @IsOptional()
  @IsString()
  emissiveColorPreset?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pcu?: number | null;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isAirTight?: boolean | null;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  public?: boolean | null;

  // Anything not explicitly mapped
  @IsOptional()
  @IsObject()
  extras?: Record<string, unknown> | null;
}
