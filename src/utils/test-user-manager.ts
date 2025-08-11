import { DataSource } from 'typeorm';
import { User } from '../entities/shared/user.entity';
import { AppDataSource } from '../data-source';

/**
 * 테스트 전용 사용자 관리 유틸리티
 */
export class TestUserManager {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = AppDataSource;
  }

  async initialize() {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }
  }

  /**
   * 테스트 사용자 생성 또는 조회
   * @param steamId 스팀 ID (기본값: test_user_999999)
   * @param username 사용자명 (기본값: TestUser)
   * @returns 생성되거나 기존 테스트 사용자
   */
  async createOrGetTestUser(
    steamId: string = 'test_user_999999',
    username: string = 'TestUser',
  ): Promise<User> {
    const userRepository = this.dataSource.getRepository(User);

    // 기존 테스트 사용자 확인
    let testUser = await userRepository.findOne({
      where: { steam_id: steamId },
    });

    if (testUser) {
      console.log(
        `✅ Existing test user found: ID ${testUser.id}, Steam ID: ${steamId}`,
      );
      return testUser;
    }

    // 새 테스트 사용자 생성
    testUser = new User();
    testUser.steam_id = steamId;
    testUser.username = username;
    testUser.email = `${username.toLowerCase()}@test.com`;
    testUser.score = 0;
    testUser.created_at = new Date();
    testUser.updated_at = new Date();

    testUser = await userRepository.save(testUser);
    console.log(
      `🆕 New test user created: ID ${testUser.id}, Steam ID: ${steamId}`,
    );

    return testUser;
  }

  /**
   * 테스트 사용자 삭제
   * @param steamId 삭제할 테스트 사용자의 스팀 ID
   */
  async deleteTestUser(steamId: string): Promise<void> {
    const userRepository = this.dataSource.getRepository(User);

    const testUser = await userRepository.findOne({
      where: { steam_id: steamId },
    });

    if (testUser) {
      await userRepository.remove(testUser);
      console.log(
        `🗑️ Test user deleted: ID ${testUser.id}, Steam ID: ${steamId}`,
      );
    } else {
      console.log(`❌ Test user not found: Steam ID ${steamId}`);
    }
  }

  /**
   * 모든 테스트 사용자 삭제 (steam_id가 'test_'로 시작하는 사용자들)
   */
  async cleanupAllTestUsers(): Promise<void> {
    const userRepository = this.dataSource.getRepository(User);

    // 쿼리빌더 사용
    const testUsersQuery = await userRepository
      .createQueryBuilder('user')
      .where('user.steam_id LIKE :pattern', { pattern: 'test_%' })
      .getMany();

    if (testUsersQuery.length > 0) {
      await userRepository.remove(testUsersQuery);
      console.log(`🧹 Cleaned up ${testUsersQuery.length} test users`);
    } else {
      console.log(`✨ No test users to clean up`);
    }
  }

  /**
   * 테스트 사용자 목록 조회
   */
  async listTestUsers(): Promise<User[]> {
    const userRepository = this.dataSource.getRepository(User);

    const testUsers = await userRepository
      .createQueryBuilder('user')
      .where('user.steam_id LIKE :pattern', { pattern: 'test_%' })
      .getMany();

    return testUsers;
  }

  async close() {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }
}

// CLI 스크립트로 사용할 수 있도록
if (require.main === module) {
  async function main() {
    const manager = new TestUserManager();

    try {
      await manager.initialize();

      const args = process.argv.slice(2);
      const command = args[0];

      switch (command) {
        case 'create': {
          const steamId = args[1] || 'test_user_999999';
          const username = args[2] || 'TestUser';
          const user = await manager.createOrGetTestUser(steamId, username);
          console.log(`Test user ready: ID ${user.id}`);
          break;
        }

        case 'list': {
          const users = await manager.listTestUsers();
          console.log(`Found ${users.length} test users:`);
          users.forEach((user) => {
            console.log(
              `  - ID: ${user.id}, Steam ID: ${user.steam_id}, Username: ${user.username}`,
            );
          });
          break;
        }

        case 'cleanup': {
          await manager.cleanupAllTestUsers();
          break;
        }

        case 'delete': {
          const deleteId = args[1];
          if (!deleteId) {
            console.error('Error: Please provide steam_id to delete');
            process.exit(1);
          }
          await manager.deleteTestUser(deleteId);
          break;
        }

        default:
          console.log(`
Usage: npx ts-node src/utils/test-user-manager.ts <command> [args]

Commands:
  create [steam_id] [username]  - Create or get test user
  list                         - List all test users  
  delete <steam_id>           - Delete specific test user
  cleanup                     - Delete all test users

Examples:
  npx ts-node src/utils/test-user-manager.ts create
  npx ts-node src/utils/test-user-manager.ts create test_user_123 MyTestUser
  npx ts-node src/utils/test-user-manager.ts list
  npx ts-node src/utils/test-user-manager.ts cleanup
          `);
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    } finally {
      await manager.close();
    }
  }

  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}
