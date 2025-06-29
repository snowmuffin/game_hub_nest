import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateValheimTables1751198000000 implements MigrationInterface {
  name = 'CreateValheimTables1751198000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Valheim Items 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'items',
        schema: 'valheim',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'item_code',
            type: 'varchar',
            length: '100',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['WEAPON', 'TOOL', 'ARMOR', 'FOOD', 'MATERIAL', 'BUILDING', 'CONSUMABLE', 'TROPHY', 'MISC'],
            default: "'MISC'",
          },
          {
            name: 'max_quality',
            type: 'enum',
            enum: ['1', '2', '3', '4', '5'],
            default: "'1'",
          },
          {
            name: 'max_stack',
            type: 'int',
            default: 1,
          },
          {
            name: 'weight',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'value',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'crafting_recipe',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'stats',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'icon_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'is_tradeable',
            type: 'boolean',
            default: true,
          },
          {
            name: 'is_teleportable',
            type: 'boolean',
            default: false,
          },
          {
            name: 'biome',
            type: 'text',
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
      }),
      true
    );

    // 2. Valheim Inventories 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'inventories',
        schema: 'valheim',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'item_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'quantity',
            type: 'int',
            default: 1,
          },
          {
            name: 'quality',
            type: 'enum',
            enum: ['1', '2', '3', '4', '5'],
            default: "'1'",
          },
          {
            name: 'durability',
            type: 'int',
            default: 100,
          },
          {
            name: 'storage_type',
            type: 'varchar',
            length: '50',
            default: "'inventory'",
          },
          {
            name: 'storage_location',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'enchantments',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'metadata',
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
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedSchema: 'public',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['item_id'],
            referencedTableName: 'items',
            referencedSchema: 'valheim',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true
    );

    // 3. Valheim Characters 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'characters',
        schema: 'valheim',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'bigint',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'character_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'level',
            type: 'int',
            default: 1,
          },
          {
            name: 'experience',
            type: 'bigint',
            default: 0,
          },
          // 기본 스탯
          {
            name: 'health',
            type: 'int',
            default: 25,
          },
          {
            name: 'stamina',
            type: 'int',
            default: 100,
          },
          {
            name: 'eitr',
            type: 'int',
            default: 25,
          },
          // 스킬들
          {
            name: 'skill_axes',
            type: 'int',
            default: 0,
          },
          {
            name: 'skill_bows',
            type: 'int',
            default: 0,
          },
          {
            name: 'skill_clubs',
            type: 'int',
            default: 0,
          },
          {
            name: 'skill_knives',
            type: 'int',
            default: 0,
          },
          {
            name: 'skill_polearms',
            type: 'int',
            default: 0,
          },
          {
            name: 'skill_spears',
            type: 'int',
            default: 0,
          },
          {
            name: 'skill_swords',
            type: 'int',
            default: 0,
          },
          {
            name: 'skill_unarmed',
            type: 'int',
            default: 0,
          },
          {
            name: 'skill_blocking',
            type: 'int',
            default: 0,
          },
          {
            name: 'skill_jump',
            type: 'int',
            default: 0,
          },
          {
            name: 'skill_run',
            type: 'int',
            default: 0,
          },
          {
            name: 'skill_sneak',
            type: 'int',
            default: 0,
          },
          {
            name: 'skill_swim',
            type: 'int',
            default: 0,
          },
          {
            name: 'skill_fishing',
            type: 'int',
            default: 0,
          },
          {
            name: 'skill_wood_cutting',
            type: 'int',
            default: 0,
          },
          {
            name: 'skill_cooking',
            type: 'int',
            default: 0,
          },
          {
            name: 'skill_farming',
            type: 'int',
            default: 0,
          },
          // 위치 정보
          {
            name: 'position_x',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'position_y',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'position_z',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'current_biome',
            type: 'varchar',
            length: '100',
            default: "'Meadows'",
          },
          // 게임 진행 상황
          {
            name: 'defeated_bosses',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'discovered_locations',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'unlocked_recipes',
            type: 'json',
            isNullable: true,
          },
          // 플레이 통계
          {
            name: 'play_time_seconds',
            type: 'int',
            default: 0,
          },
          {
            name: 'deaths',
            type: 'int',
            default: 0,
          },
          {
            name: 'enemies_killed',
            type: 'int',
            default: 0,
          },
          {
            name: 'distance_walked',
            type: 'int',
            default: 0,
          },
          {
            name: 'items_crafted',
            type: 'int',
            default: 0,
          },
          // 기타
          {
            name: 'metadata',
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
            referencedSchema: 'public',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true
    );

    // 4. 인덱스 생성
    await queryRunner.createIndex(
      'valheim_inventories',
      new TableIndex({
        name: 'idx_valheim_inventory_user_item',
        columnNames: ['user_id', 'item_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 인덱스 삭제
    await queryRunner.dropIndex('valheim_inventories', 'idx_valheim_inventory_user_item');

    // 테이블 삭제 (역순)
    await queryRunner.dropTable('valheim_characters');
    await queryRunner.dropTable('valheim_inventories');
    await queryRunner.dropTable('valheim_items');
  }
}
