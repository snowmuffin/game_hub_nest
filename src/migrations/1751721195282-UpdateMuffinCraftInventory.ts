import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMuffinCraftInventory1751721195282 implements MigrationInterface {
    name = 'UpdateMuffinCraftInventory1751721195282'

    private async dropConstraintIfExists(queryRunner: QueryRunner, tableName: string, constraintName: string): Promise<void> {
        const [schema, table] = tableName.includes('.') ? tableName.split('.') : ['public', tableName];
        
        try {
            const result = await queryRunner.query(`
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = $1 AND table_name = $2 AND table_schema = $3
            `, [constraintName, table, schema]) as any[];
            
            if (result.length > 0) {
                console.log(`Dropping constraint ${constraintName} on table ${tableName}...`);
                await queryRunner.query(`ALTER TABLE "${tableName}" DROP CONSTRAINT "${constraintName}"`);
            } else {
                console.log(`Constraint ${constraintName} on table ${tableName} does not exist, skipping...`);
            }
        } catch {
            console.log(`Error checking/dropping constraint ${constraintName} on table ${tableName}, skipping...`);
        }
    }

    private async dropIndexIfExists(queryRunner: QueryRunner, indexName: string): Promise<void> {
        const [schema, index] = indexName.includes('.') ? indexName.split('.') : ['public', indexName];
        
        try {
            const result = await queryRunner.query(`
                SELECT 1 FROM pg_indexes 
                WHERE schemaname = $1 AND indexname = $2
            `, [schema, index]) as any[];
            
            if (result.length > 0) {
                console.log(`Dropping index ${indexName}...`);
                await queryRunner.query(`DROP INDEX "${indexName}"`);
            } else {
                console.log(`Index ${indexName} does not exist, skipping...`);
            }
        } catch {
            console.log(`Error checking/dropping index ${indexName}, skipping...`);
        }
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Use PostgreSQL's DO blocks with proper error handling
        // Drop all constraints and indexes with IF EXISTS checks in a single block
        await queryRunner.query(`DO $$ 
        BEGIN
            -- Drop foreign key constraints if they exist
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_580fc7e0080d61ad92882081282' AND table_name = 'game_servers' AND table_schema = 'public') THEN
                ALTER TABLE "game_servers" DROP CONSTRAINT "FK_580fc7e0080d61ad92882081282";
            END IF;
            
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_bb2a1e2eb0a51d4dded3cf35391' AND table_name = 'currencies' AND table_schema = 'public') THEN
                ALTER TABLE "currencies" DROP CONSTRAINT "FK_bb2a1e2eb0a51d4dded3cf35391";
            END IF;
            
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_177421f143d995e48c2a978e069' AND table_name = 'wallets' AND table_schema = 'public') THEN
                ALTER TABLE "wallets" DROP CONSTRAINT "FK_177421f143d995e48c2a978e069";
            END IF;
            
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_66e93d6289a730a2bade3b979a3' AND table_name = 'wallets' AND table_schema = 'public') THEN
                ALTER TABLE "wallets" DROP CONSTRAINT "FK_66e93d6289a730a2bade3b979a3";
            END IF;
            
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_b3167c57663ae949d67436465b3' AND table_name = 'wallets' AND table_schema = 'public') THEN
                ALTER TABLE "wallets" DROP CONSTRAINT "FK_b3167c57663ae949d67436465b3";
            END IF;
            
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_4796762c619893704abbc3dce65' AND table_name = 'wallet_transactions' AND table_schema = 'public') THEN
                ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_4796762c619893704abbc3dce65";
            END IF;
            
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_c6e648aeaab79e4213def02aba8' AND table_name = 'characters' AND table_schema = 'valheim') THEN
                ALTER TABLE "valheim"."characters" DROP CONSTRAINT "FK_c6e648aeaab79e4213def02aba8";
            END IF;
            
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_0af24dcac4257167eebaf5695ed' AND table_name = 'inventories' AND table_schema = 'valheim') THEN
                ALTER TABLE "valheim"."inventories" DROP CONSTRAINT "FK_0af24dcac4257167eebaf5695ed";
            END IF;
            
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_0d4c1be204420da2aa3ef859487' AND table_name = 'inventories' AND table_schema = 'valheim') THEN
                ALTER TABLE "valheim"."inventories" DROP CONSTRAINT "FK_0d4c1be204420da2aa3ef859487";
            END IF;
        END $$;`);

        // Drop indexes using IF EXISTS
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_game_servers_game_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_game_servers_code"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_currencies_game_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_currencies_type"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_wallets_unique_combination"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_wallet_transactions_wallet_id_created_at"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_wallet_transactions_user_id_created_at"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_wallet_transactions_type_created_at"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "space_engineers"."IDX_DROP_TABLE_ITEM_ID"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "space_engineers"."IDX_DROP_TABLE_RARITY"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "space_engineers"."IDX_DROP_TABLE_IS_ACTIVE"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "valheim"."idx_valheim_inventory_user_item"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_minecraft_username_auth"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_muffincraft_auth_codes_authCode"`);
        await queryRunner.query(`CREATE TABLE "valheim"."worlds" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "server_id" integer NOT NULL, "world_name" character varying(100) NOT NULL, "world_seed" character varying(50) NOT NULL, "world_size" integer NOT NULL DEFAULT '10000', "day_count" integer NOT NULL DEFAULT '1', "time_of_day" double precision NOT NULL DEFAULT '0.5', "defeated_bosses" json NOT NULL DEFAULT '[]', "discovered_locations" json NOT NULL DEFAULT '[]', "global_keys" json NOT NULL DEFAULT '[]', "weather_state" character varying(50) NOT NULL DEFAULT 'Clear', "is_hardcore" boolean NOT NULL DEFAULT false, "player_count" integer NOT NULL DEFAULT '0', "max_players" integer NOT NULL DEFAULT '10', "world_data" json, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8b447f7a2b28d3567db893ae7a6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "valheim"."biomes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "world_id" uuid NOT NULL, "biome_name" character varying(50) NOT NULL, "position_x" double precision NOT NULL, "position_y" double precision NOT NULL, "size_radius" double precision NOT NULL, "is_explored" boolean NOT NULL DEFAULT false, "exploration_percentage" double precision NOT NULL DEFAULT '0', "biome_data" json, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8d336dcc9ea04699345ebc9bd76" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "valheim"."boss_encounters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "world_id" uuid NOT NULL, "boss_name" character varying(50) NOT NULL, "position_x" double precision NOT NULL, "position_y" double precision NOT NULL, "position_z" double precision NOT NULL, "is_defeated" boolean NOT NULL DEFAULT false, "defeated_at" TIMESTAMP, "defeated_by_users" json NOT NULL DEFAULT '[]', "attempts" integer NOT NULL DEFAULT '0', "boss_data" json, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fef2f11c417829ad20a34c52f18" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "valheim"."character_skills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "character_id" integer NOT NULL, "skill_name" character varying(50) NOT NULL, "skill_level" integer NOT NULL DEFAULT '1', "skill_experience" double precision NOT NULL DEFAULT '0', "accumulated_experience" double precision NOT NULL DEFAULT '0', "death_penalty_applied" double precision NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_941a4450f93ed54425c28340d43" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "valheim"."buildings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" integer NOT NULL, "server_id" integer NOT NULL, "building_name" character varying(100) NOT NULL, "building_type" character varying(50) NOT NULL, "position_x" double precision NOT NULL, "position_y" double precision NOT NULL, "position_z" double precision NOT NULL, "rotation_x" double precision NOT NULL DEFAULT '0', "rotation_y" double precision NOT NULL DEFAULT '0', "rotation_z" double precision NOT NULL DEFAULT '0', "health" double precision NOT NULL DEFAULT '100', "max_health" double precision NOT NULL DEFAULT '100', "materials_used" json, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bc65c1acce268c383e41a69003a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "muffin_craft_inventory" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "playerId" integer, "minecraftUsername" character varying, "itemId" character varying NOT NULL, "itemName" character varying NOT NULL, "quantity" integer NOT NULL, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_9e46c9a1cc07419ec8a6e7bfb02" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "muffin_craft_currency" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" numeric(20,2) NOT NULL DEFAULT '0', "currencyType" character varying(50) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "transactionHistory" jsonb, "userId" integer, CONSTRAINT "PK_bb93f1b4631e2fac8fa53af752f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "minecraft_uuid" character varying(36)`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_427ce47b56e04782619404f41cb" UNIQUE ("minecraft_uuid")`);
        await queryRunner.query(`ALTER TABLE "valheim"."characters" ADD "world_id" uuid`);
        
        // Drop constraints with conditional checks
        await queryRunner.query(`DO $$ 
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_92558c08091598f7a4439586cda' AND table_name = 'wallets' AND table_schema = 'public') THEN
                ALTER TABLE "wallets" DROP CONSTRAINT "FK_92558c08091598f7a4439586cda";
            END IF;
        END $$;`);
        
        await queryRunner.query(`DO $$ 
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'PK_a3ffb1c0c8416b9fc6f907b7433' AND table_name = 'users' AND table_schema = 'public') THEN
                ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433";
            END IF;
        END $$;`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`);
        
        await queryRunner.query(`DO $$ 
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'UQ_fe0bb3f6520ee0469504521e710' AND table_name = 'users' AND table_schema = 'public') THEN
                ALTER TABLE "users" DROP CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710";
            END IF;
        END $$;`);
        
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "username" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username")`);
        
        await queryRunner.query(`DO $$ 
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'UQ_97672ac88f789774dd47f7c8be3' AND table_name = 'users' AND table_schema = 'public') THEN
                ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3";
            END IF;
        END $$;`);
        
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "email" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
        
        await queryRunner.query(`DO $$ 
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'UQ_54fe0ca3c43bc032e3333d12a90' AND table_name = 'users' AND table_schema = 'public') THEN
                ALTER TABLE "users" DROP CONSTRAINT "UQ_54fe0ca3c43bc032e3333d12a90";
            END IF;
        END $$;`);
        
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "steam_id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "steam_id" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_54fe0ca3c43bc032e3333d12a90" UNIQUE ("steam_id")`);
        
        await queryRunner.query(`DO $$ 
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'PK_d528c54860c4182db13548e08c4' AND table_name = 'currencies' AND table_schema = 'public') THEN
                ALTER TABLE "currencies" DROP CONSTRAINT "PK_d528c54860c4182db13548e08c4";
            END IF;
        END $$;`);
        await queryRunner.query(`ALTER TABLE "currencies" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "currencies" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "currencies" ADD CONSTRAINT "PK_d528c54860c4182db13548e08c4" PRIMARY KEY ("id")`);
        
        await queryRunner.query(`DO $$ 
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_c57d19129968160f4db28fc8b28' AND table_name = 'wallet_transactions' AND table_schema = 'public') THEN
                ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_c57d19129968160f4db28fc8b28";
            END IF;
        END $$;`);
        
        await queryRunner.query(`DO $$ 
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'PK_8402e5df5a30a229380e83e4f7e' AND table_name = 'wallets' AND table_schema = 'public') THEN
                ALTER TABLE "wallets" DROP CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e";
            END IF;
        END $$;`);
        
        await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id")`);
        
        await queryRunner.query(`DO $$ 
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'PK_5120f131bde2cda940ec1a621db' AND table_name = 'wallet_transactions' AND table_schema = 'public') THEN
                ALTER TABLE "wallet_transactions" DROP CONSTRAINT "PK_5120f131bde2cda940ec1a621db";
            END IF;
        END $$;`);
        
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD CONSTRAINT "PK_5120f131bde2cda940ec1a621db" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP COLUMN "wallet_id"`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD "wallet_id" integer NOT NULL`);
        
        await queryRunner.query(`DO $$ 
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'UQ_c6e648aeaab79e4213def02aba8' AND table_name = 'characters' AND table_schema = 'valheim') THEN
                ALTER TABLE "valheim"."characters" DROP CONSTRAINT "UQ_c6e648aeaab79e4213def02aba8";
            END IF;
        END $$;`);
        await queryRunner.query(`ALTER TABLE "valheim"."characters" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "valheim"."characters" ADD "user_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "valheim"."characters" ADD CONSTRAINT "UQ_c6e648aeaab79e4213def02aba8" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "space_engineers"."drop_table" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "space_engineers"."drop_table" ALTER COLUMN "updated_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "valheim"."inventories" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "valheim"."inventories" ADD "user_id" integer NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e1e0e38336f606568476ebd25d" ON "wallets" ("user_id", "game_id", "server_id", "currency_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_1630db47097e0241c894ffaaec" ON "wallet_transactions" ("transaction_type", "created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_1a08a767565429af6fe9400ca2" ON "wallet_transactions" ("user_id", "created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_6956721ecd7d2f8bd5a1d99046" ON "wallet_transactions" ("wallet_id", "created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_69cabe204d8e564d9a9b2320a1" ON "space_engineers"."drop_table" ("rarity") `);
        await queryRunner.query(`CREATE INDEX "IDX_298414d3c5235a8362216a7dce" ON "space_engineers"."drop_table" ("item_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_ed5fcf21bb6f51d9d134711a8a" ON "valheim"."inventories" ("user_id", "item_id") `);
        await queryRunner.query(`CREATE INDEX "idx_muffincraft_auth_minecraft_username" ON "muffincraft_auth_codes" ("minecraftUsername") `);
        await queryRunner.query(`ALTER TABLE "game_servers" ADD CONSTRAINT "FK_580fc7e0080d61ad92882081282" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "currencies" ADD CONSTRAINT "FK_bb2a1e2eb0a51d4dded3cf35391" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_92558c08091598f7a4439586cda" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_177421f143d995e48c2a978e069" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_66e93d6289a730a2bade3b979a3" FOREIGN KEY ("server_id") REFERENCES "game_servers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_b3167c57663ae949d67436465b3" FOREIGN KEY ("currency_id") REFERENCES "currencies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD CONSTRAINT "FK_c57d19129968160f4db28fc8b28" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD CONSTRAINT "FK_4796762c619893704abbc3dce65" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "valheim"."worlds" ADD CONSTRAINT "FK_4bf0a898ce8f481af73a5060794" FOREIGN KEY ("server_id") REFERENCES "game_servers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "valheim"."biomes" ADD CONSTRAINT "FK_01a73852ffbe791b35bbbfdade9" FOREIGN KEY ("world_id") REFERENCES "valheim"."worlds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "valheim"."boss_encounters" ADD CONSTRAINT "FK_d63b837cc3c260413cd2e6d6911" FOREIGN KEY ("world_id") REFERENCES "valheim"."worlds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "valheim"."characters" ADD CONSTRAINT "FK_c6e648aeaab79e4213def02aba8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "valheim"."characters" ADD CONSTRAINT "FK_d21b478ef6ebdd04d331fe49495" FOREIGN KEY ("world_id") REFERENCES "valheim"."worlds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "valheim"."character_skills" ADD CONSTRAINT "FK_a427aa019526f37178f804e0625" FOREIGN KEY ("character_id") REFERENCES "valheim"."characters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "valheim"."buildings" ADD CONSTRAINT "FK_8225684e3ec7d4bcd1c73e5c480" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "valheim"."buildings" ADD CONSTRAINT "FK_1ba35a9441d0d11da71709677fd" FOREIGN KEY ("server_id") REFERENCES "game_servers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "valheim"."inventories" ADD CONSTRAINT "FK_0af24dcac4257167eebaf5695ed" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "valheim"."inventories" ADD CONSTRAINT "FK_0d4c1be204420da2aa3ef859487" FOREIGN KEY ("item_id") REFERENCES "valheim"."items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "muffin_craft_inventory" ADD CONSTRAINT "FK_b5bd1b11ac846b8c6577a7e0e1d" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "muffin_craft_currency" ADD CONSTRAINT "FK_57b3bc1a41b7a838da73735e4b7" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "muffin_craft_currency" DROP CONSTRAINT "FK_57b3bc1a41b7a838da73735e4b7"`);
        await queryRunner.query(`ALTER TABLE "muffin_craft_inventory" DROP CONSTRAINT "FK_b5bd1b11ac846b8c6577a7e0e1d"`);
        await queryRunner.query(`ALTER TABLE "valheim"."inventories" DROP CONSTRAINT "FK_0d4c1be204420da2aa3ef859487"`);
        await queryRunner.query(`ALTER TABLE "valheim"."inventories" DROP CONSTRAINT "FK_0af24dcac4257167eebaf5695ed"`);
        await queryRunner.query(`ALTER TABLE "valheim"."buildings" DROP CONSTRAINT "FK_1ba35a9441d0d11da71709677fd"`);
        await queryRunner.query(`ALTER TABLE "valheim"."buildings" DROP CONSTRAINT "FK_8225684e3ec7d4bcd1c73e5c480"`);
        await queryRunner.query(`ALTER TABLE "valheim"."character_skills" DROP CONSTRAINT "FK_a427aa019526f37178f804e0625"`);
        await queryRunner.query(`ALTER TABLE "valheim"."characters" DROP CONSTRAINT "FK_d21b478ef6ebdd04d331fe49495"`);
        await queryRunner.query(`ALTER TABLE "valheim"."characters" DROP CONSTRAINT "FK_c6e648aeaab79e4213def02aba8"`);
        await queryRunner.query(`ALTER TABLE "valheim"."boss_encounters" DROP CONSTRAINT "FK_d63b837cc3c260413cd2e6d6911"`);
        await queryRunner.query(`ALTER TABLE "valheim"."biomes" DROP CONSTRAINT "FK_01a73852ffbe791b35bbbfdade9"`);
        await queryRunner.query(`ALTER TABLE "valheim"."worlds" DROP CONSTRAINT "FK_4bf0a898ce8f481af73a5060794"`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_4796762c619893704abbc3dce65"`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_c57d19129968160f4db28fc8b28"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_b3167c57663ae949d67436465b3"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_66e93d6289a730a2bade3b979a3"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_177421f143d995e48c2a978e069"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_92558c08091598f7a4439586cda"`);
        await queryRunner.query(`ALTER TABLE "currencies" DROP CONSTRAINT "FK_bb2a1e2eb0a51d4dded3cf35391"`);
        await queryRunner.query(`ALTER TABLE "game_servers" DROP CONSTRAINT "FK_580fc7e0080d61ad92882081282"`);
        await queryRunner.query(`DROP INDEX "public"."idx_muffincraft_auth_minecraft_username"`);
        await queryRunner.query(`DROP INDEX "valheim"."IDX_ed5fcf21bb6f51d9d134711a8a"`);
        await queryRunner.query(`DROP INDEX "space_engineers"."IDX_298414d3c5235a8362216a7dce"`);
        await queryRunner.query(`DROP INDEX "space_engineers"."IDX_69cabe204d8e564d9a9b2320a1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6956721ecd7d2f8bd5a1d99046"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1a08a767565429af6fe9400ca2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1630db47097e0241c894ffaaec"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e1e0e38336f606568476ebd25d"`);
        await queryRunner.query(`ALTER TABLE "valheim"."inventories" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "valheim"."inventories" ADD "user_id" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "space_engineers"."drop_table" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "space_engineers"."drop_table" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "valheim"."characters" DROP CONSTRAINT "UQ_c6e648aeaab79e4213def02aba8"`);
        await queryRunner.query(`ALTER TABLE "valheim"."characters" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "valheim"."characters" ADD "user_id" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "valheim"."characters" ADD CONSTRAINT "UQ_c6e648aeaab79e4213def02aba8" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP COLUMN "wallet_id"`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD "wallet_id" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP CONSTRAINT "PK_5120f131bde2cda940ec1a621db"`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD "id" BIGSERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD CONSTRAINT "PK_5120f131bde2cda940ec1a621db" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD "id" BIGSERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD CONSTRAINT "FK_c57d19129968160f4db28fc8b28" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "currencies" DROP CONSTRAINT "PK_d528c54860c4182db13548e08c4"`);
        await queryRunner.query(`ALTER TABLE "currencies" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "currencies" ADD "id" BIGSERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "currencies" ADD CONSTRAINT "PK_d528c54860c4182db13548e08c4" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_54fe0ca3c43bc032e3333d12a90"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "steam_id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "steam_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_54fe0ca3c43bc032e3333d12a90" UNIQUE ("steam_id")`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "email" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "username" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username")`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "id" BIGSERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_92558c08091598f7a4439586cda" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "valheim"."characters" DROP COLUMN "world_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_427ce47b56e04782619404f41cb"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "minecraft_uuid"`);
        await queryRunner.query(`DROP TABLE "muffin_craft_currency"`);
        await queryRunner.query(`DROP TABLE "muffin_craft_inventory"`);
        await queryRunner.query(`DROP TABLE "valheim"."buildings"`);
        await queryRunner.query(`DROP TABLE "valheim"."character_skills"`);
        await queryRunner.query(`DROP TABLE "valheim"."boss_encounters"`);
        await queryRunner.query(`DROP TABLE "valheim"."biomes"`);
        await queryRunner.query(`DROP TABLE "valheim"."worlds"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_muffincraft_auth_codes_authCode" ON "muffincraft_auth_codes" ("authCode") `);
        await queryRunner.query(`CREATE INDEX "idx_minecraft_username_auth" ON "muffincraft_auth_codes" ("minecraftUsername") `);
        await queryRunner.query(`CREATE INDEX "idx_valheim_inventory_user_item" ON "valheim"."inventories" ("user_id", "item_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_DROP_TABLE_IS_ACTIVE" ON "space_engineers"."drop_table" ("is_active") `);
        await queryRunner.query(`CREATE INDEX "IDX_DROP_TABLE_RARITY" ON "space_engineers"."drop_table" ("rarity") `);
        await queryRunner.query(`CREATE INDEX "IDX_DROP_TABLE_ITEM_ID" ON "space_engineers"."drop_table" ("item_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_wallet_transactions_type_created_at" ON "wallet_transactions" ("transaction_type", "created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_wallet_transactions_user_id_created_at" ON "wallet_transactions" ("user_id", "created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_wallet_transactions_wallet_id_created_at" ON "wallet_transactions" ("wallet_id", "created_at") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_wallets_unique_combination" ON "wallets" ("user_id", "game_id", "server_id", "currency_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_currencies_type" ON "currencies" ("type") `);
        await queryRunner.query(`CREATE INDEX "IDX_currencies_game_id" ON "currencies" ("game_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_game_servers_code" ON "game_servers" ("game_id", "code") `);
        await queryRunner.query(`CREATE INDEX "IDX_game_servers_game_id" ON "game_servers" ("game_id") `);
        await queryRunner.query(`ALTER TABLE "valheim"."inventories" ADD CONSTRAINT "FK_0d4c1be204420da2aa3ef859487" FOREIGN KEY ("item_id") REFERENCES "valheim"."items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "valheim"."inventories" ADD CONSTRAINT "FK_0af24dcac4257167eebaf5695ed" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "valheim"."characters" ADD CONSTRAINT "FK_c6e648aeaab79e4213def02aba8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD CONSTRAINT "FK_4796762c619893704abbc3dce65" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_b3167c57663ae949d67436465b3" FOREIGN KEY ("currency_id") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_66e93d6289a730a2bade3b979a3" FOREIGN KEY ("server_id") REFERENCES "game_servers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_177421f143d995e48c2a978e069" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "currencies" ADD CONSTRAINT "FK_bb2a1e2eb0a51d4dded3cf35391" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_servers" ADD CONSTRAINT "FK_580fc7e0080d61ad92882081282" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
