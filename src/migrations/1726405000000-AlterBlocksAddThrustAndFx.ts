import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterBlocksAddThrustAndFx1726405000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = 'space_engineers.blocks';
    const addIfMissing = async (name: string, column: TableColumn) => {
      const exists = await queryRunner.hasColumn(table, name);
      if (!exists) {
        await queryRunner.addColumn(table, column);
      }
    };

    const cols: Array<[string, TableColumn]> = [
      [
        'gui_visible',
        new TableColumn({
          name: 'gui_visible',
          type: 'boolean',
          isNullable: true,
        }),
      ],
      [
        'thruster_type',
        new TableColumn({
          name: 'thruster_type',
          type: 'varchar',
          length: '50',
          isNullable: true,
        }),
      ],
      [
        'silenceable_by_ship_sound_system',
        new TableColumn({
          name: 'silenceable_by_ship_sound_system',
          type: 'boolean',
          isNullable: true,
        }),
      ],
      [
        'force_magnitude',
        new TableColumn({
          name: 'force_magnitude',
          type: 'double precision',
          isNullable: true,
        }),
      ],
      [
        'max_power_consumption',
        new TableColumn({
          name: 'max_power_consumption',
          type: 'double precision',
          isNullable: true,
        }),
      ],
      [
        'min_power_consumption',
        new TableColumn({
          name: 'min_power_consumption',
          type: 'double precision',
          isNullable: true,
        }),
      ],
      [
        'slowdown_factor',
        new TableColumn({
          name: 'slowdown_factor',
          type: 'double precision',
          isNullable: true,
        }),
      ],
      [
        'min_planetary_influence',
        new TableColumn({
          name: 'min_planetary_influence',
          type: 'double precision',
          isNullable: true,
        }),
      ],
      [
        'max_planetary_influence',
        new TableColumn({
          name: 'max_planetary_influence',
          type: 'double precision',
          isNullable: true,
        }),
      ],
      [
        'effectiveness_at_min_influence',
        new TableColumn({
          name: 'effectiveness_at_min_influence',
          type: 'double precision',
          isNullable: true,
        }),
      ],
      [
        'effectiveness_at_max_influence',
        new TableColumn({
          name: 'effectiveness_at_max_influence',
          type: 'double precision',
          isNullable: true,
        }),
      ],
      [
        'needs_atmosphere_for_influence',
        new TableColumn({
          name: 'needs_atmosphere_for_influence',
          type: 'boolean',
          isNullable: true,
        }),
      ],
      [
        'flame_damage_length_scale',
        new TableColumn({
          name: 'flame_damage_length_scale',
          type: 'double precision',
          isNullable: true,
        }),
      ],
      [
        'flame_damage',
        new TableColumn({
          name: 'flame_damage',
          type: 'double precision',
          isNullable: true,
        }),
      ],
      [
        'flame_length_scale',
        new TableColumn({
          name: 'flame_length_scale',
          type: 'double precision',
          isNullable: true,
        }),
      ],
      [
        'flame_idle_color',
        new TableColumn({
          name: 'flame_idle_color',
          type: 'jsonb',
          isNullable: true,
        }),
      ],
      [
        'flame_full_color',
        new TableColumn({
          name: 'flame_full_color',
          type: 'jsonb',
          isNullable: true,
        }),
      ],
      [
        'flame_point_material',
        new TableColumn({
          name: 'flame_point_material',
          type: 'varchar',
          length: '100',
          isNullable: true,
        }),
      ],
      [
        'flame_length_material',
        new TableColumn({
          name: 'flame_length_material',
          type: 'varchar',
          length: '100',
          isNullable: true,
        }),
      ],
      [
        'flame_flare',
        new TableColumn({
          name: 'flame_flare',
          type: 'varchar',
          length: '150',
          isNullable: true,
        }),
      ],
      [
        'flame_visibility_distance',
        new TableColumn({
          name: 'flame_visibility_distance',
          type: 'integer',
          isNullable: true,
        }),
      ],
      [
        'flame_glare_query_size',
        new TableColumn({
          name: 'flame_glare_query_size',
          type: 'double precision',
          isNullable: true,
        }),
      ],
      [
        'primary_sound',
        new TableColumn({
          name: 'primary_sound',
          type: 'varchar',
          length: '150',
          isNullable: true,
        }),
      ],
      [
        'voxel_placement',
        new TableColumn({
          name: 'voxel_placement',
          type: 'jsonb',
          isNullable: true,
        }),
      ],
      [
        'center',
        new TableColumn({ name: 'center', type: 'jsonb', isNullable: true }),
      ],
      [
        'tiered_update_times',
        new TableColumn({
          name: 'tiered_update_times',
          type: 'jsonb',
          isNullable: true,
        }),
      ],
      [
        'targeting_groups',
        new TableColumn({
          name: 'targeting_groups',
          type: 'jsonb',
          isNullable: true,
        }),
      ],
      [
        'fuel_converter',
        new TableColumn({
          name: 'fuel_converter',
          type: 'jsonb',
          isNullable: true,
        }),
      ],
      [
        'propeller_uses_propeller_system',
        new TableColumn({
          name: 'propeller_uses_propeller_system',
          type: 'boolean',
          isNullable: true,
        }),
      ],
      [
        'propeller_subpart_entity_name',
        new TableColumn({
          name: 'propeller_subpart_entity_name',
          type: 'varchar',
          length: '200',
          isNullable: true,
        }),
      ],
      [
        'propeller_rps_full_speed',
        new TableColumn({
          name: 'propeller_rps_full_speed',
          type: 'double precision',
          isNullable: true,
        }),
      ],
      [
        'propeller_rps_idle_speed',
        new TableColumn({
          name: 'propeller_rps_idle_speed',
          type: 'double precision',
          isNullable: true,
        }),
      ],
      [
        'propeller_accel_time',
        new TableColumn({
          name: 'propeller_accel_time',
          type: 'double precision',
          isNullable: true,
        }),
      ],
      [
        'propeller_decel_time',
        new TableColumn({
          name: 'propeller_decel_time',
          type: 'double precision',
          isNullable: true,
        }),
      ],
      [
        'propeller_max_visible_distance',
        new TableColumn({
          name: 'propeller_max_visible_distance',
          type: 'integer',
          isNullable: true,
        }),
      ],
    ];

    for (const [name, col] of cols) {
      await addIfMissing(name, col);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = 'space_engineers.blocks';
    const dropIfExists = async (name: string) => {
      const exists = await queryRunner.hasColumn(table, name);
      if (exists) {
        await queryRunner.dropColumn(table, name);
      }
    };

    const names = [
      'gui_visible',
      'thruster_type',
      'silenceable_by_ship_sound_system',
      'force_magnitude',
      'max_power_consumption',
      'min_power_consumption',
      'slowdown_factor',
      'min_planetary_influence',
      'max_planetary_influence',
      'effectiveness_at_min_influence',
      'effectiveness_at_max_influence',
      'needs_atmosphere_for_influence',
      'flame_damage_length_scale',
      'flame_damage',
      'flame_length_scale',
      'flame_idle_color',
      'flame_full_color',
      'flame_point_material',
      'flame_length_material',
      'flame_flare',
      'flame_visibility_distance',
      'flame_glare_query_size',
      'primary_sound',
      'voxel_placement',
      'center',
      'tiered_update_times',
      'targeting_groups',
      'fuel_converter',
      'propeller_uses_propeller_system',
      'propeller_subpart_entity_name',
      'propeller_rps_full_speed',
      'propeller_rps_idle_speed',
      'propeller_accel_time',
      'propeller_decel_time',
      'propeller_max_visible_distance',
    ];

    for (const name of names) {
      await dropIfExists(name);
    }
  }
}
