import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchemaSetup1723363200000 implements MigrationInterface {
  name = 'InitialSchemaSetup1723363200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create schemas for different games
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "space_engineers"`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "valheim"`);

    // ============================
    // SHARED SCHEMA (public)
    // ============================

    // Create users table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL NOT NULL,
        "username" character varying(100) NOT NULL,
        "email" character varying(100),
        "password" character varying,
        "steam_id" character varying(50) NOT NULL,
        "avatar_url" character varying(255),
        "total_score" integer NOT NULL DEFAULT 0,
        "is_admin" boolean NOT NULL DEFAULT false,
        "is_active" boolean NOT NULL DEFAULT true,
        "last_login" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "UQ_steam_id" UNIQUE ("steam_id")
      )
    `);

    // Create games table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "games" (
        "id" SERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "slug" character varying(50) NOT NULL,
        "description" text,
        "icon_url" character varying(255),
        "banner_url" character varying(255),
        "is_active" boolean NOT NULL DEFAULT true,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_c9b16b62917b5595af982d66337" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_games_slug" UNIQUE ("slug")
      )
    `);

    // Create game_servers table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "game_servers" (
        "id" SERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "host" character varying(255) NOT NULL,
        "port" integer NOT NULL,
        "description" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "player_count" integer NOT NULL DEFAULT 0,
        "max_players" integer NOT NULL DEFAULT 0,
        "last_ping" TIMESTAMP,
        "game_id" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_game_servers" PRIMARY KEY ("id"),
        CONSTRAINT "FK_game_servers_game" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE SET NULL
      )
    `);

    // Create currencies table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "currencies" (
        "id" SERIAL NOT NULL,
        "code" character varying(10) NOT NULL,
        "name" character varying(50) NOT NULL,
        "symbol" character varying(5) NOT NULL,
        "exchange_rate" decimal(10,4) NOT NULL DEFAULT 1.0000,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_currencies" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_currencies_code" UNIQUE ("code")
      )
    `);

    // Create wallets table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "wallets" (
        "id" SERIAL NOT NULL,
        "balance" decimal(12,2) NOT NULL DEFAULT 0.00,
        "currency_id" integer NOT NULL,
        "user_id" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_wallets" PRIMARY KEY ("id"),
        CONSTRAINT "FK_wallets_currency" FOREIGN KEY ("currency_id") REFERENCES "currencies"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_wallets_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_wallets_user_currency" UNIQUE ("user_id", "currency_id")
      )
    `);

    // Create wallet_transactions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "wallet_transactions" (
        "id" SERIAL NOT NULL,
        "amount" decimal(12,2) NOT NULL,
        "type" character varying(20) NOT NULL,
        "description" character varying(255),
        "reference_id" character varying(100),
        "wallet_id" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_wallet_transactions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_wallet_transactions_wallet" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE
      )
    `);

    // ============================
    // SPACE ENGINEERS SCHEMA
    // ============================

    // Create space_engineers.items table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "space_engineers"."items" (
        "id" SERIAL NOT NULL,
        "name" character varying(200) NOT NULL,
        "item_id" character varying(100) NOT NULL,
        "category" character varying(50),
        "subcategory" character varying(50),
        "description" text,
        "volume" decimal(10,4),
        "mass" decimal(10,4),
        "image_url" character varying(500),
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_space_engineers_items" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_space_engineers_items_item_id" UNIQUE ("item_id")
      )
    `);

    // Create space_engineers.drop_table table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "space_engineers"."drop_table" (
        "id" SERIAL NOT NULL,
        "name" character varying(200) NOT NULL,
        "total_weight" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_space_engineers_drop_table" PRIMARY KEY ("id")
      )
    `);

    // Create space_engineers.marketplace_items table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "space_engineers"."marketplace_items" (
        "id" SERIAL NOT NULL,
        "price" decimal(10,2) NOT NULL,
        "stock_quantity" integer NOT NULL DEFAULT 0,
        "is_available" boolean NOT NULL DEFAULT true,
        "item_id" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_space_engineers_marketplace_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_marketplace_items_item" FOREIGN KEY ("item_id") REFERENCES "space_engineers"."items"("id") ON DELETE CASCADE
      )
    `);

    // Create space_engineers.online_storage table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "space_engineers"."online_storage" (
        "id" SERIAL NOT NULL,
        "name" character varying(200) NOT NULL,
        "capacity" integer NOT NULL DEFAULT 1000,
        "current_volume" decimal(12,4) NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "user_id" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_space_engineers_online_storage" PRIMARY KEY ("id"),
        CONSTRAINT "FK_online_storage_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create space_engineers.online_storage_items table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "space_engineers"."online_storage_items" (
        "id" SERIAL NOT NULL,
        "quantity" integer NOT NULL DEFAULT 1,
        "storage_id" integer,
        "item_id" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_space_engineers_online_storage_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_storage_items_storage" FOREIGN KEY ("storage_id") REFERENCES "space_engineers"."online_storage"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_storage_items_item" FOREIGN KEY ("item_id") REFERENCES "space_engineers"."items"("id") ON DELETE CASCADE
      )
    `);

    // Create space_engineers.item_download_log table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "space_engineers"."item_download_log" (
        "id" SERIAL NOT NULL,
        "quantity" integer NOT NULL,
        "download_time" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" integer,
        "item_id" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_space_engineers_item_download_log" PRIMARY KEY ("id"),
        CONSTRAINT "FK_download_log_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_download_log_item" FOREIGN KEY ("item_id") REFERENCES "space_engineers"."items"("id") ON DELETE CASCADE
      )
    `);

    // ============================
    // VALHEIM SCHEMA
    // ============================

    // Create valheim.characters table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "valheim"."characters" (
        "id" SERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "level" integer NOT NULL DEFAULT 1,
        "experience" bigint NOT NULL DEFAULT 0,
        "health" decimal(8,2) NOT NULL DEFAULT 100.00,
        "max_health" decimal(8,2) NOT NULL DEFAULT 100.00,
        "stamina" decimal(8,2) NOT NULL DEFAULT 100.00,
        "max_stamina" decimal(8,2) NOT NULL DEFAULT 100.00,
        "position_x" decimal(12,4) NOT NULL DEFAULT 0,
        "position_y" decimal(12,4) NOT NULL DEFAULT 0,
        "position_z" decimal(12,4) NOT NULL DEFAULT 0,
        "world_name" character varying(100),
        "is_active" boolean NOT NULL DEFAULT true,
        "user_id" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_valheim_characters" PRIMARY KEY ("id"),
        CONSTRAINT "FK_valheim_characters_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create valheim.character_skills table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "valheim"."character_skills" (
        "id" SERIAL NOT NULL,
        "skill_name" character varying(50) NOT NULL,
        "level" integer NOT NULL DEFAULT 1,
        "experience" decimal(12,4) NOT NULL DEFAULT 0,
        "character_id" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_valheim_character_skills" PRIMARY KEY ("id"),
        CONSTRAINT "FK_character_skills_character" FOREIGN KEY ("character_id") REFERENCES "valheim"."characters"("id") ON DELETE CASCADE
      )
    `);

    // Create valheim.items table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "valheim"."items" (
        "id" SERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "internal_name" character varying(100) NOT NULL,
        "category" character varying(50),
        "subcategory" character varying(50),
        "description" text,
        "max_stack" integer NOT NULL DEFAULT 1,
        "weight" decimal(8,4) NOT NULL DEFAULT 0,
        "value" integer NOT NULL DEFAULT 0,
        "durability" integer,
        "icon_url" character varying(500),
        "is_craftable" boolean NOT NULL DEFAULT false,
        "is_teleportable" boolean NOT NULL DEFAULT true,
        "tier" integer NOT NULL DEFAULT 1,
        "rarity" character varying(20) NOT NULL DEFAULT 'common',
        "damage" decimal(8,2),
        "block_armor" decimal(8,2),
        "slash_armor" decimal(8,2),
        "pierce_armor" decimal(8,2),
        "blunt_armor" decimal(8,2),
        "fire_armor" decimal(8,2),
        "frost_armor" decimal(8,2),
        "lightning_armor" decimal(8,2),
        "poison_armor" decimal(8,2),
        "spirit_armor" decimal(8,2),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_valheim_items" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_valheim_items_internal_name" UNIQUE ("internal_name")
      )
    `);

    // Create valheim.inventories table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "valheim"."inventories" (
        "id" SERIAL NOT NULL,
        "slot_number" integer NOT NULL,
        "quantity" integer NOT NULL DEFAULT 1,
        "durability" decimal(8,2),
        "quality" integer NOT NULL DEFAULT 1,
        "variant" integer NOT NULL DEFAULT 0,
        "crafting_station_level" integer NOT NULL DEFAULT 1,
        "character_id" integer,
        "item_id" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_valheim_inventories" PRIMARY KEY ("id"),
        CONSTRAINT "FK_inventories_character" FOREIGN KEY ("character_id") REFERENCES "valheim"."characters"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_inventories_item" FOREIGN KEY ("item_id") REFERENCES "valheim"."items"("id") ON DELETE CASCADE
      )
    `);

    // Create valheim.buildings table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "valheim"."buildings" (
        "id" SERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "prefab_name" character varying(100) NOT NULL,
        "category" character varying(50),
        "health" decimal(8,2) NOT NULL DEFAULT 100.00,
        "max_health" decimal(8,2) NOT NULL DEFAULT 100.00,
        "position_x" decimal(12,4) NOT NULL DEFAULT 0,
        "position_y" decimal(12,4) NOT NULL DEFAULT 0,
        "position_z" decimal(12,4) NOT NULL DEFAULT 0,
        "rotation_x" decimal(8,4) NOT NULL DEFAULT 0,
        "rotation_y" decimal(8,4) NOT NULL DEFAULT 0,
        "rotation_z" decimal(8,4) NOT NULL DEFAULT 0,
        "rotation_w" decimal(8,4) NOT NULL DEFAULT 1,
        "is_active" boolean NOT NULL DEFAULT true,
        "character_id" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_valheim_buildings" PRIMARY KEY ("id"),
        CONSTRAINT "FK_buildings_character" FOREIGN KEY ("character_id") REFERENCES "valheim"."characters"("id") ON DELETE CASCADE
      )
    `);

    // Create valheim.worlds table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "valheim"."worlds" (
        "id" SERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "seed" bigint NOT NULL,
        "day_count" integer NOT NULL DEFAULT 0,
        "world_time" decimal(12,4) NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "user_id" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_valheim_worlds" PRIMARY KEY ("id"),
        CONSTRAINT "FK_worlds_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create valheim.biomes table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "valheim"."biomes" (
        "id" SERIAL NOT NULL,
        "name" character varying(50) NOT NULL,
        "type" character varying(30) NOT NULL,
        "difficulty_level" integer NOT NULL DEFAULT 1,
        "min_altitude" decimal(8,2),
        "max_altitude" decimal(8,2),
        "temperature_range" character varying(20),
        "resources" text,
        "creatures" text,
        "description" text,
        "color_code" character varying(7),
        "is_boss_biome" boolean NOT NULL DEFAULT false,
        "world_id" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_valheim_biomes" PRIMARY KEY ("id"),
        CONSTRAINT "FK_biomes_world" FOREIGN KEY ("world_id") REFERENCES "valheim"."worlds"("id") ON DELETE CASCADE
      )
    `);

    // Create valheim.boss_encounters table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "valheim"."boss_encounters" (
        "id" SERIAL NOT NULL,
        "boss_name" character varying(50) NOT NULL,
        "difficulty" integer NOT NULL DEFAULT 1,
        "encounter_time" TIMESTAMP NOT NULL DEFAULT now(),
        "duration_seconds" integer,
        "is_victory" boolean NOT NULL DEFAULT false,
        "damage_dealt" bigint NOT NULL DEFAULT 0,
        "damage_taken" bigint NOT NULL DEFAULT 0,
        "loot_gained" text,
        "position_x" decimal(12,4),
        "position_y" decimal(12,4),
        "position_z" decimal(12,4),
        "world_id" integer,
        "character_id" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_valheim_boss_encounters" PRIMARY KEY ("id"),
        CONSTRAINT "FK_boss_encounters_world" FOREIGN KEY ("world_id") REFERENCES "valheim"."worlds"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_boss_encounters_character" FOREIGN KEY ("character_id") REFERENCES "valheim"."characters"("id") ON DELETE CASCADE
      )
    `);

    // Insert initial data
    await this.insertInitialData(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all tables in reverse order
    await queryRunner.query(`
      DROP TABLE IF EXISTS "valheim"."boss_encounters"
    `);
    await queryRunner.query(`
      DROP TABLE IF EXISTS "valheim"."biomes"
    `);
    await queryRunner.query(`
      DROP TABLE IF EXISTS "valheim"."worlds"
    `);
    await queryRunner.query(`
      DROP TABLE IF EXISTS "valheim"."buildings"
    `);
    await queryRunner.query(`
      DROP TABLE IF EXISTS "valheim"."inventories"
    `);
    await queryRunner.query(`
      DROP TABLE IF EXISTS "valheim"."items"
    `);
    await queryRunner.query(`
      DROP TABLE IF EXISTS "valheim"."character_skills"
    `);
    await queryRunner.query(`
      DROP TABLE IF EXISTS "valheim"."characters"
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "space_engineers"."item_download_log"
    `);
    await queryRunner.query(`
      DROP TABLE IF EXISTS "space_engineers"."online_storage_items"
    `);
    await queryRunner.query(`
      DROP TABLE IF EXISTS "space_engineers"."online_storage"
    `);
    await queryRunner.query(`
      DROP TABLE IF EXISTS "space_engineers"."marketplace_items"
    `);
    await queryRunner.query(`
      DROP TABLE IF EXISTS "space_engineers"."drop_table"
    `);
    await queryRunner.query(`
      DROP TABLE IF EXISTS "space_engineers"."items"
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS "wallet_transactions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "wallets"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "currencies"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "game_servers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "games"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    // Drop schemas
    await queryRunner.query(`DROP SCHEMA IF EXISTS "valheim" CASCADE`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS "space_engineers" CASCADE`);
  }

  private async insertInitialData(queryRunner: QueryRunner): Promise<void> {
    // Insert default games
    await queryRunner.query(`
      INSERT INTO "games" ("name", "slug", "description", "is_active", "sort_order") VALUES
      ('Space Engineers', 'space-engineers', 'A sandbox game about engineering, construction and maintenance of space works', true, 1),
      ('Valheim', 'valheim', 'A brutal exploration and survival game for solo play or 2-10 players', true, 2)
      ON CONFLICT ("slug") DO NOTHING
    `);

    // Insert default currency
    await queryRunner.query(`
      INSERT INTO "currencies" ("code", "name", "symbol", "exchange_rate", "is_active") VALUES
      ('USD', 'US Dollar', '$', 1.0000, true),
      ('KRW', 'Korean Won', '₩', 1300.0000, true)
      ON CONFLICT ("code") DO NOTHING
    `);
  }
}
