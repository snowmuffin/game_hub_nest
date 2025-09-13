import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSpaceEngineersBlocks1726300000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createSchema('space_engineers', true);
    await queryRunner.createTable(
      new Table({
        name: 'space_engineers.blocks',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          {
            name: 'type_id',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'subtype_id',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },
          {
            name: 'display_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'icon', type: 'varchar', length: '255', isNullable: true },
          {
            name: 'cube_size',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'block_topology',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          { name: 'size_x', type: 'integer', isNullable: true },
          { name: 'size_y', type: 'integer', isNullable: true },
          { name: 'size_z', type: 'integer', isNullable: true },
          {
            name: 'model_offset_x',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'model_offset_y',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'model_offset_z',
            type: 'double precision',
            isNullable: true,
          },
          { name: 'sound', type: 'varchar', length: '255', isNullable: true },
          { name: 'model', type: 'varchar', length: '255', isNullable: true },
          { name: 'components', type: 'jsonb', isNullable: true },
          { name: 'critical_component', type: 'jsonb', isNullable: true },
          { name: 'mount_points', type: 'jsonb', isNullable: true },
          { name: 'build_progress_models', type: 'jsonb', isNullable: true },
          {
            name: 'block_pair_name',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },
          {
            name: 'mirroring_y',
            type: 'varchar',
            length: '5',
            isNullable: true,
          },
          {
            name: 'mirroring_z',
            type: 'varchar',
            length: '5',
            isNullable: true,
          },
          {
            name: 'edge_type',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          { name: 'build_time_seconds', type: 'integer', isNullable: true },
          {
            name: 'resource_sink_group',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'resource_source_group',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          { name: 'min_field_size', type: 'jsonb', isNullable: true },
          { name: 'max_field_size', type: 'jsonb', isNullable: true },
          {
            name: 'min_gravity_accel',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'max_gravity_accel',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'required_power_input',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'base_power_input',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'consumption_power',
            type: 'double precision',
            isNullable: true,
          },
          { name: 'min_radius', type: 'integer', isNullable: true },
          { name: 'max_radius', type: 'integer', isNullable: true },
          {
            name: 'damage_effect_name',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },
          {
            name: 'damaged_sound',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },
          {
            name: 'destroy_effect',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },
          {
            name: 'destroy_sound',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },
          {
            name: 'emissive_color_preset',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          { name: 'pcu', type: 'integer', isNullable: true },
          { name: 'is_air_tight', type: 'boolean', isNullable: true },
          { name: 'public', type: 'boolean', isNullable: true },
          { name: 'extras', type: 'jsonb', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'IDX_blocks_type_subtype',
            columnNames: ['type_id', 'subtype_id'],
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('space_engineers.blocks', true);
  }
}
