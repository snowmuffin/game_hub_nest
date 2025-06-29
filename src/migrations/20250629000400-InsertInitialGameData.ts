import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertInitialGameData20250629000400 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 기본 게임들 추가
    await queryRunner.query(`
      INSERT INTO spaceengineers.games (code, name, description, is_active) VALUES
      ('space_engineers', 'Space Engineers', 'Space-based sandbox game about engineering, construction, exploration and survival', true),
      ('minecraft', 'Minecraft', 'Sandbox video game developed by Mojang Studios', true),
      ('valheim', 'Valheim', 'Survival and sandbox video game by Iron Gate Studio', true)
    `);

    // Space Engineers 서버들 추가
    await queryRunner.query(`
      INSERT INTO spaceengineers.game_servers (game_id, code, name, description, is_active) VALUES
      ((SELECT id FROM spaceengineers.games WHERE code = 'space_engineers'), 'main', 'Main Server', 'Primary Space Engineers server', true),
      ((SELECT id FROM spaceengineers.games WHERE code = 'space_engineers'), 'creative', 'Creative Server', 'Creative mode server for building', true),
      ((SELECT id FROM spaceengineers.games WHERE code = 'space_engineers'), 'survival', 'Survival Server', 'Hardcore survival server', true)
    `);

    // 기본 화폐들 추가
    await queryRunner.query(`
      INSERT INTO spaceengineers.currencies (game_id, code, name, symbol, type, decimal_places, is_active, created_at, updated_at) VALUES
      -- 글로벌 화폐
      (NULL, 'USD', 'US Dollar', '$', 'GLOBAL', 2, true, now(), now()),
      (NULL, 'EUR', 'Euro', '€', 'GLOBAL', 2, true, now(), now()),
      (NULL, 'KRW', 'Korean Won', '₩', 'GLOBAL', 0, true, now(), now()),
      
      -- Space Engineers 화폐 (10자 제한으로 짧게)
      ((SELECT id FROM spaceengineers.games WHERE code = 'space_engineers'), 'SEC', 'Space Credits', 'SC', 'GAME_SPECIFIC', 2, true, now(), now()),
      ((SELECT id FROM spaceengineers.games WHERE code = 'space_engineers'), 'SEG', 'Gold Ore', 'Au', 'GAME_SPECIFIC', 4, true, now(), now()),
      ((SELECT id FROM spaceengineers.games WHERE code = 'space_engineers'), 'SEP', 'Platinum Ore', 'Pt', 'GAME_SPECIFIC', 4, true, now(), now()),
      
      -- Minecraft 화폐
      ((SELECT id FROM spaceengineers.games WHERE code = 'minecraft'), 'MCE', 'Emerald', '💎', 'GAME_SPECIFIC', 0, true, now(), now()),
      ((SELECT id FROM spaceengineers.games WHERE code = 'minecraft'), 'MCD', 'Diamond', '💠', 'GAME_SPECIFIC', 0, true, now(), now()),
      
      -- Valheim 화폐
      ((SELECT id FROM spaceengineers.games WHERE code = 'valheim'), 'VHC', 'Coins', 'C', 'GAME_SPECIFIC', 0, true, now(), now())
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM spaceengineers.currencies`);
    await queryRunner.query(`DELETE FROM spaceengineers.game_servers`);
    await queryRunner.query(`DELETE FROM spaceengineers.games`);
  }
}
