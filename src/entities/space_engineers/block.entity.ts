import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'blocks', schema: 'space_engineers' })
@Index(['typeId', 'subtypeId'])
export class SpaceEngineersBlock {
  @PrimaryGeneratedColumn()
  id: number;

  // Core identity
  @Column({ name: 'type_id', type: 'varchar', length: 100 })
  typeId: string;

  @Column({ name: 'subtype_id', type: 'varchar', length: 150, nullable: true })
  subtypeId?: string | null;

  // Display
  @Column({ name: 'display_name', type: 'varchar', length: 255 })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon?: string | null;

  // Classification
  @Column({ name: 'cube_size', type: 'varchar', length: 20, nullable: true })
  cubeSize?: string | null;

  @Column({
    name: 'block_topology',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  blockTopology?: string | null;

  // Geometry
  @Column({ name: 'size_x', type: 'integer', nullable: true })
  sizeX?: number | null;

  @Column({ name: 'size_y', type: 'integer', nullable: true })
  sizeY?: number | null;

  @Column({ name: 'size_z', type: 'integer', nullable: true })
  sizeZ?: number | null;

  @Column({ name: 'model_offset_x', type: 'double precision', nullable: true })
  modelOffsetX?: number | null;

  @Column({ name: 'model_offset_y', type: 'double precision', nullable: true })
  modelOffsetY?: number | null;

  @Column({ name: 'model_offset_z', type: 'double precision', nullable: true })
  modelOffsetZ?: number | null;

  // Assets & audio
  @Column({ type: 'varchar', length: 255, nullable: true })
  sound?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  model?: string | null;

  // Composition
  @Column({ type: 'jsonb', nullable: true })
  components?:
    | (
        | {
            Subtype: string;
            Count: number;
            DeconstructId?: { TypeId: string; SubtypeId: string };
          }
        | Record<string, unknown>
      )[]
    | null;

  @Column({ name: 'critical_component', type: 'jsonb', nullable: true })
  criticalComponent?:
    | { Subtype: string; Index: number }
    | Record<string, unknown>
    | null;

  // Placement
  @Column({ name: 'mount_points', type: 'jsonb', nullable: true })
  mountPoints?: Array<Record<string, unknown>> | null;

  // Build visuals
  @Column({ name: 'build_progress_models', type: 'jsonb', nullable: true })
  buildProgressModels?: Array<Record<string, unknown>> | null;

  // Pairing and symmetry
  @Column({
    name: 'block_pair_name',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  blockPairName?: string | null;

  @Column({ name: 'mirroring_y', type: 'varchar', length: 5, nullable: true })
  mirroringY?: string | null;

  @Column({ name: 'mirroring_z', type: 'varchar', length: 5, nullable: true })
  mirroringZ?: string | null;

  // Build/Cost
  @Column({ name: 'edge_type', type: 'varchar', length: 20, nullable: true })
  edgeType?: string | null;

  @Column({ name: 'build_time_seconds', type: 'integer', nullable: true })
  buildTimeSeconds?: number | null;

  // Power & physics
  @Column({
    name: 'resource_sink_group',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  resourceSinkGroup?: string | null;

  @Column({
    name: 'resource_source_group',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  resourceSourceGroup?: string | null;

  @Column({ name: 'min_field_size', type: 'jsonb', nullable: true })
  minFieldSize?: { x: number; y: number; z: number } | null;

  @Column({ name: 'max_field_size', type: 'jsonb', nullable: true })
  maxFieldSize?: { x: number; y: number; z: number } | null;

  @Column({
    name: 'min_gravity_accel',
    type: 'double precision',
    nullable: true,
  })
  minGravityAcceleration?: number | null;

  @Column({
    name: 'max_gravity_accel',
    type: 'double precision',
    nullable: true,
  })
  maxGravityAcceleration?: number | null;

  @Column({
    name: 'required_power_input',
    type: 'double precision',
    nullable: true,
  })
  requiredPowerInput?: number | null;

  @Column({
    name: 'base_power_input',
    type: 'double precision',
    nullable: true,
  })
  basePowerInput?: number | null;

  @Column({
    name: 'consumption_power',
    type: 'double precision',
    nullable: true,
  })
  consumptionPower?: number | null;

  @Column({ name: 'min_radius', type: 'integer', nullable: true })
  minRadius?: number | null;

  @Column({ name: 'max_radius', type: 'integer', nullable: true })
  maxRadius?: number | null;

  // FX & misc
  @Column({
    name: 'damage_effect_name',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  damageEffectName?: string | null;

  @Column({
    name: 'damaged_sound',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  damagedSound?: string | null;

  @Column({
    name: 'destroy_effect',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  destroyEffect?: string | null;

  @Column({
    name: 'destroy_sound',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  destroySound?: string | null;

  @Column({
    name: 'emissive_color_preset',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  emissiveColorPreset?: string | null;

  @Column({ type: 'integer', nullable: true })
  pcu?: number | null;

  @Column({ name: 'is_air_tight', type: 'boolean', nullable: true })
  isAirTight?: boolean | null;

  @Column({ name: 'public', type: 'boolean', nullable: true })
  public?: boolean | null;

  // Anything not explicitly mapped
  @Column({ type: 'jsonb', nullable: true })
  extras?: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
