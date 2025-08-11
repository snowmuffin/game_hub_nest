import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateExistingWalletData20250629000500
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Starting existing wallet data migration...');

    // 백업 테이블에서 기존 데이터 확인
    const backupTables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'wallets_backup_%'
      ORDER BY table_name DESC
      LIMIT 1;
    `);

    if (backupTables.length === 0) {
      console.log('ℹ️ No backup wallet data found, skipping migration');
      return;
    }

    const backupTableName = backupTables[0].table_name;
    console.log(`📋 Found backup table: ${backupTableName}`);

    // Space Engineers 게임 ID 가져오기
    const spaceEngineersGame = await queryRunner.query(`
      SELECT id FROM games WHERE code = 'space_engineers' LIMIT 1;
    `);

    if (spaceEngineersGame.length === 0) {
      console.log('⚠️ Space Engineers game not found, creating it first...');
      await queryRunner.query(`
        INSERT INTO games (code, name, description, is_active) 
        VALUES ('space_engineers', 'Space Engineers', 'Legacy game entry', true);
      `);

      const newGame = await queryRunner.query(`
        SELECT id FROM games WHERE code = 'space_engineers' LIMIT 1;
      `);
      var gameId = newGame[0].id;
    } else {
      var gameId = spaceEngineersGame[0].id;
    }

    // Space Engineers Credits 화폐 ID 가져오기 (또는 생성)
    let currencyResult = await queryRunner.query(`
      SELECT id FROM currencies WHERE code = 'SE_CREDITS' LIMIT 1;
    `);

    if (currencyResult.length === 0) {
      console.log('💰 Creating SE_CREDITS currency...');
      await queryRunner.query(`
        INSERT INTO currencies (game_id, code, name, symbol, type, decimal_places, is_active, created_at, updated_at) 
        VALUES (${gameId}, 'SE_CREDITS', 'Space Credits', 'SC', 'GAME_SPECIFIC', 2, true, now(), now());
      `);

      currencyResult = await queryRunner.query(`
        SELECT id FROM currencies WHERE code = 'SE_CREDITS' LIMIT 1;
      `);
    }

    const currencyId = currencyResult[0].id;

    // 기존 지갑 데이터를 새 구조로 변환
    console.log('🔄 Converting wallet data to new structure...');

    const convertedData = await queryRunner.query(`
      SELECT 
        user_id,
        ${gameId} as game_id,
        NULL as server_id,
        ${currencyId} as currency_id,
        balance,
        0 as locked_balance,
        true as is_active,
        NULL as metadata,
        created_at,
        updated_at
      FROM ${backupTableName}
      WHERE user_id IS NOT NULL;
    `);

    if (convertedData.length > 0) {
      console.log(`💾 Migrating ${convertedData.length} wallet records...`);

      for (const wallet of convertedData) {
        try {
          await queryRunner.query(`
            INSERT INTO wallets (
              user_id, game_id, server_id, currency_id, balance, locked_balance, 
              is_active, metadata, created_at, updated_at
            ) VALUES (
              ${wallet.user_id}, ${wallet.game_id}, ${wallet.server_id}, ${wallet.currency_id}, 
              ${wallet.balance}, ${wallet.locked_balance}, ${wallet.is_active}, 
              ${wallet.metadata ? `'${JSON.stringify(wallet.metadata)}'` : 'NULL'}, 
              '${wallet.created_at.toISOString()}', '${wallet.updated_at.toISOString()}'
            ) ON CONFLICT (user_id, game_id, server_id, currency_id) DO NOTHING;
          `);
        } catch (error) {
          console.log(
            `⚠️ Error migrating wallet for user ${wallet.user_id}: ${error.message}`,
          );
          // 개별 지갑 오류는 로그만 남기고 계속 진행
        }
      }

      console.log('✅ Wallet data migration completed successfully!');
    } else {
      console.log('ℹ️ No valid wallet data found to migrate');
    }

    // 마이그레이션 성공 로그
    const finalCount = await queryRunner.query(`
      SELECT COUNT(*) as count FROM wallets;
    `);

    console.log(`📊 Total wallets after migration: ${finalCount[0].count}`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Rolling back wallet data migration...');

    // 마이그레이션된 데이터만 삭제 (Space Engineers 게임의 지갑들)
    const spaceEngineersGame = await queryRunner.query(`
      SELECT id FROM games WHERE code = 'space_engineers' LIMIT 1;
    `);

    if (spaceEngineersGame.length > 0) {
      const gameId = spaceEngineersGame[0].id;
      await queryRunner.query(`
        DELETE FROM wallets WHERE game_id = ${gameId};
      `);
      console.log('✅ Migrated wallet data rolled back');
    }
  }
}
