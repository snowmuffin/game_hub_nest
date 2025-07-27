import { DataSource } from 'typeorm';
import { User } from '../user/user.entity';
import { AppDataSource } from '../data-source';

/**
 * Test user management utility
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
   * Create or retrieve test user
   * @param steamId Steam ID (default: test_user_999999)
   * @param username Username (default: TestUser)
   * @returns Created or existing test user
   */
  async createOrGetTestUser(
    steamId: string = 'test_user_999999',
    username: string = 'TestUser',
  ): Promise<User> {
    const userRepository = this.dataSource.getRepository(User);

    // Check for existing test user
    let testUser = await userRepository.findOne({
      where: { steam_id: steamId },
    });

    if (testUser) {
      console.log(
        `✅ Existing test user found: ID ${testUser.id}, Steam ID: ${steamId}`,
      );
      return testUser;
    }

    // Create new test user
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
   * Delete test user
   * @param steamId Steam ID of the test user to delete
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
   * Delete all test users (users whose steam_id starts with 'test_')
   */
  async cleanupAllTestUsers(): Promise<void> {
    const userRepository = this.dataSource.getRepository(User);

    // Use query builder to handle LIKE pattern
    const testUsers = await userRepository
      .createQueryBuilder('user')
      .where('user.steam_id LIKE :pattern', { pattern: 'test_%' })
      .getMany();

    if (testUsers.length > 0) {
      await userRepository.remove(testUsers);
      console.log(`🧹 Cleaned up ${testUsers.length} test users`);
    } else {
      console.log(`✨ No test users to clean up`);
    }
  }

  /**
   * Retrieve list of test users
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

// CLI script support
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

  void main();
}
