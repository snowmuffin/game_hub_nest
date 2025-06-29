import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateValheimExtendedTables1751198100000 implements MigrationInterface {
  name = 'CreateValheimExtendedTables1751198100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Valheim Buildings 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'valheim_buildings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'server_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'building_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'building_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'position_x',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'position_y',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'position_z',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'rotation_x',
            type: 'float',
            default: 0,
          },
          {
            name: 'rotation_y',
            type: 'float',
            default: 0,
          },
          {
            name: 'rotation_z',
            type: 'float',
            default: 0,
          },
          {
            name: 'health',
            type: 'float',
            default: 100,
          },
          {
            name: 'max_health',
            type: 'float',
            default: 100,
          },
          {
            name: 'materials_used',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['server_id'],
            referencedTableName: 'game_servers',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true
    );

    // 2. Valheim Worlds 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'valheim_worlds',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'server_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'world_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'world_seed',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'world_size',
            type: 'int',
            default: 10000,
          },
          {
            name: 'day_count',
            type: 'int',
            default: 1,
          },
          {
            name: 'time_of_day',
            type: 'float',
            default: 0.5,
          },
          {
            name: 'defeated_bosses',
            type: 'json',
            default: "'[]'",
          },
          {
            name: 'discovered_locations',
            type: 'json',
            default: "'[]'",
          },
          {
            name: 'global_keys',
            type: 'json',
            default: "'[]'",
          },
          {
            name: 'weather_state',
            type: 'varchar',
            length: '50',
            default: "'Clear'",
          },
          {
            name: 'is_hardcore',
            type: 'boolean',
            default: false,
          },
          {
            name: 'player_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'max_players',
            type: 'int',
            default: 10,
          },
          {
            name: 'world_data',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['server_id'],
            referencedTableName: 'game_servers',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true
    );

    // 3. Valheim Biomes 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'valheim_biomes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'world_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'biome_name',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'position_x',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'position_y',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'size_radius',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'is_explored',
            type: 'boolean',
            default: false,
          },
          {
            name: 'exploration_percentage',
            type: 'float',
            default: 0,
          },
          {
            name: 'biome_data',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['world_id'],
            referencedTableName: 'valheim_worlds',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true
    );

    // 4. Valheim Boss Encounters 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'valheim_boss_encounters',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'world_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'boss_name',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'position_x',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'position_y',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'position_z',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'is_defeated',
            type: 'boolean',
            default: false,
          },
          {
            name: 'defeated_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'defeated_by_users',
            type: 'json',
            default: "'[]'",
          },
          {
            name: 'attempts',
            type: 'int',
            default: 0,
          },
          {
            name: 'boss_data',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['world_id'],
            referencedTableName: 'valheim_worlds',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true
    );

    // 5. Valheim Character Skills 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'valheim_character_skills',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'character_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'skill_name',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'skill_level',
            type: 'int',
            default: 1,
          },
          {
            name: 'skill_experience',
            type: 'float',
            default: 0,
          },
          {
            name: 'accumulated_experience',
            type: 'float',
            default: 0,
          },
          {
            name: 'death_penalty_applied',
            type: 'float',
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['character_id'],
            referencedTableName: 'valheim_characters',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true
    );

    // 6. Valheim Characters 테이블에 world_id 컬럼 추가
    await queryRunner.query(`
      ALTER TABLE valheim_characters 
      ADD COLUMN world_id uuid,
      ADD CONSTRAINT FK_valheim_characters_world 
      FOREIGN KEY (world_id) REFERENCES valheim_worlds(id) ON DELETE SET NULL
    `);

    // 7. 인덱스 생성
    await queryRunner.createIndex(
      'valheim_buildings',
      new TableIndex({
        name: 'idx_valheim_buildings_user_server',
        columnNames: ['user_id', 'server_id'],
      })
    );

    await queryRunner.createIndex(
      'valheim_buildings',
      new TableIndex({
        name: 'idx_valheim_buildings_type',
        columnNames: ['building_type'],
      })
    );

    await queryRunner.createIndex(
      'valheim_worlds',
      new TableIndex({
        name: 'idx_valheim_worlds_server',
        columnNames: ['server_id'],
      })
    );

    await queryRunner.createIndex(
      'valheim_biomes',
      new TableIndex({
        name: 'idx_valheim_biomes_world',
        columnNames: ['world_id'],
      })
    );

    await queryRunner.createIndex(
      'valheim_boss_encounters',
      new TableIndex({
        name: 'idx_valheim_boss_encounters_world',
        columnNames: ['world_id'],
      })
    );

    await queryRunner.createIndex(
      'valheim_boss_encounters',
      new TableIndex({
        name: 'idx_valheim_boss_encounters_defeated',
        columnNames: ['is_defeated'],
      })
    );

    await queryRunner.createIndex(
      'valheim_character_skills',
      new TableIndex({
        name: 'idx_valheim_skills_character',
        columnNames: ['character_id'],
      })
    );

    await queryRunner.createIndex(
      'valheim_character_skills',
      new TableIndex({
        name: 'idx_valheim_skills_character_skill',
        columnNames: ['character_id', 'skill_name'],
      })
    );

    await queryRunner.createIndex(
      'valheim_character_skills',
      new TableIndex({
        name: 'idx_valheim_skills_leaderboard',
        columnNames: ['skill_name', 'skill_level'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 인덱스 삭제
    await queryRunner.dropIndex('valheim_character_skills', 'idx_valheim_skills_leaderboard');
    await queryRunner.dropIndex('valheim_character_skills', 'idx_valheim_skills_character_skill');
    await queryRunner.dropIndex('valheim_character_skills', 'idx_valheim_skills_character');
    await queryRunner.dropIndex('valheim_boss_encounters', 'idx_valheim_boss_encounters_defeated');
    await queryRunner.dropIndex('valheim_boss_encounters', 'idx_valheim_boss_encounters_world');
    await queryRunner.dropIndex('valheim_biomes', 'idx_valheim_biomes_world');
    await queryRunner.dropIndex('valheim_worlds', 'idx_valheim_worlds_server');
    await queryRunner.dropIndex('valheim_buildings', 'idx_valheim_buildings_type');
    await queryRunner.dropIndex('valheim_buildings', 'idx_valheim_buildings_user_server');

    // world_id 컬럼 삭제
    await queryRunner.query(`
      ALTER TABLE valheim_characters 
      DROP CONSTRAINT IF EXISTS FK_valheim_characters_world,
      DROP COLUMN IF EXISTS world_id
    `);

    // 테이블 삭제 (역순)
    await queryRunner.dropTable('valheim_character_skills');
    await queryRunner.dropTable('valheim_boss_encounters');
    await queryRunner.dropTable('valheim_biomes');
    await queryRunner.dropTable('valheim_worlds');
    await queryRunner.dropTable('valheim_buildings');
  }
}
