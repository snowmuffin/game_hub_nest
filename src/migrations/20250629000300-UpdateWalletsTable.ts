import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class UpdateWalletsTable20250629000300 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 🛡️ 안전 조치: 기존 wallets 테이블 백업
    const walletsTableExists = await queryRunner.hasTable('wallets');
    if (walletsTableExists) {
      console.log('📋 Backing up existing wallets table...');
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS wallets_backup_${Date.now()} AS 
        SELECT * FROM wallets;
      `);
      console.log('✅ Wallets backup completed!');
      
      // 기존 wallets 테이블 삭제
      await queryRunner.dropTable('wallets', true);
      console.log('🗑️ Old wallets table dropped');
    }

    // 새로운 wallets 테이블 생성
    console.log('🏗️ Creating new wallets table...');
    await queryRunner.createTable(
      new Table({
        name: 'wallets',
        
        columns: [
          { name: 'id', type: 'bigint', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'user_id', type: 'int', isNullable: false },
          { name: 'game_id', type: 'int', isNullable: false },
          { name: 'server_id', type: 'int', isNullable: true },
          { name: 'currency_id', type: 'int', isNullable: false },
          { name: 'balance', type: 'decimal', precision: 20, scale: 8, default: 0 },
          { name: 'locked_balance', type: 'decimal', precision: 20, scale: 8, default: 0 },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'metadata', type: 'json', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true
    );

    // wallet_transactions 테이블 생성
    console.log('🏗️ Creating wallet_transactions table...');
    await queryRunner.createTable(
      new Table({
        name: 'wallet_transactions',
        
        columns: [
          { name: 'id', type: 'bigint', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'wallet_id', type: 'bigint', isNullable: false },
          { name: 'user_id', type: 'int', isNullable: false },
          { 
            name: 'transaction_type', 
            type: 'enum', 
            enum: ['DEPOSIT', 'WITHDRAW', 'TRANSFER_IN', 'TRANSFER_OUT', 'PURCHASE', 'SALE', 'REWARD', 'PENALTY']
          },
          { name: 'amount', type: 'decimal', precision: 20, scale: 8 },
          { name: 'balance_before', type: 'decimal', precision: 20, scale: 8 },
          { name: 'balance_after', type: 'decimal', precision: 20, scale: 8 },
          { name: 'description', type: 'varchar', length: '500', isNullable: true },
          { name: 'reference_id', type: 'varchar', length: '100', isNullable: true },
          { 
            name: 'status', 
            type: 'enum', 
            enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
            default: "'COMPLETED'"
          },
          { name: 'metadata', type: 'json', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true
    );

    // 외래 키들 추가
    console.log('🔗 Adding foreign keys...');
    
    // wallets -> users
    await queryRunner.createForeignKey(
      'wallets',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        
        onDelete: 'CASCADE',
      })
    );

    // wallets -> games
    await queryRunner.createForeignKey(
      'wallets',
      new TableForeignKey({
        columnNames: ['game_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'games',
        
        onDelete: 'CASCADE',
      })
    );

    // wallets -> game_servers
    await queryRunner.createForeignKey(
      'wallets',
      new TableForeignKey({
        columnNames: ['server_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'game_servers',
        
        onDelete: 'CASCADE',
      })
    );

    // wallets -> currencies
    await queryRunner.createForeignKey(
      'wallets',
      new TableForeignKey({
        columnNames: ['currency_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'currencies',
        
        onDelete: 'RESTRICT',
      })
    );

    // wallet_transactions -> wallets
    await queryRunner.createForeignKey(
      'wallet_transactions',
      new TableForeignKey({
        columnNames: ['wallet_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'wallets',
        
        onDelete: 'CASCADE',
      })
    );

    // wallet_transactions -> users
    await queryRunner.createForeignKey(
      'wallet_transactions',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        
        onDelete: 'CASCADE',
      })
    );

    // 인덱스들 추가
    console.log('📊 Adding indexes...');
    
    // wallets 테이블의 고유 인덱스 (user + game + server + currency 조합)
    await queryRunner.createIndex(
      'wallets',
      new TableIndex({
        name: 'IDX_wallets_unique_combination',
        columnNames: ['user_id', 'game_id', 'server_id', 'currency_id'],
        isUnique: true,
      })
    );

    // wallet_transactions 테이블의 인덱스들
    await queryRunner.createIndex(
      'wallet_transactions',
      new TableIndex({
        name: 'IDX_wallet_transactions_wallet_id_created_at',
        columnNames: ['wallet_id', 'created_at'],
      })
    );

    await queryRunner.createIndex(
      'wallet_transactions',
      new TableIndex({
        name: 'IDX_wallet_transactions_user_id_created_at',
        columnNames: ['user_id', 'created_at'],
      })
    );

    await queryRunner.createIndex(
      'wallet_transactions',
      new TableIndex({
        name: 'IDX_wallet_transactions_type_created_at',
        columnNames: ['transaction_type', 'created_at'],
      })
    );

    console.log('✅ Wallets table migration completed successfully!');
    console.log('💡 Note: Old wallets data has been backed up to wallets_backup_* table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Rolling back wallets table changes...');
    
    await queryRunner.dropTable('wallet_transactions');
    await queryRunner.dropTable('wallets');
    
    // 백업 테이블에서 복구 시도
    const backupTables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'wallets_backup_%'
      ORDER BY table_name DESC
      LIMIT 1;
    `);
    
    if (backupTables.length > 0) {
      const backupTableName = backupTables[0].table_name;
      console.log(`🔄 Restoring from backup: ${backupTableName}`);
      
      await queryRunner.query(`
        CREATE TABLE wallets AS 
        SELECT * FROM ${backupTableName};
      `);
      
      console.log('✅ Wallets table restored from backup');
    } else {
      console.log('⚠️ No backup table found, creating empty wallets table');
      
      // 원래 구조로 복구 (기본 구조)
      await queryRunner.createTable(
        new Table({
          name: 'wallets',
          
          columns: [
            { name: 'id', type: 'bigint', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'user_id', type: 'int', isNullable: false },
            { name: 'balance', type: 'decimal', precision: 10, scale: 2, default: 0 },
            { name: 'currency_id', type: 'int', isNullable: false },
            { name: 'created_at', type: 'timestamp', default: 'now()' },
            { name: 'updated_at', type: 'timestamp', default: 'now()' },
          ],
        }),
        true
      );
    }
    
    console.log('🔄 Rollback completed');
  }
}
