import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from '../entities/shared/user.entity';
import { SpaceEngineersOnlineStorage } from '../entities/space_engineers/online-storage.entity';
import { SpaceEngineersOnlineStorageItem } from '../entities/space_engineers/online-storage-item.entity';
import { UserRole, hasRoleOrHigher } from '../entities/shared/user-role.enum';

export interface StorageInfo {
  id: number;
  totalItems: number;
  uniqueItems: number;
  items: Array<{
    id: number;
    displayName: string;
    indexName: string;
    category: string;
    rarity: number;
    quantity: number;
    description: string;
    icons: unknown;
  }>;
}

export interface UserInventoryDto {
  user: {
    id: number;
    username: string;
    steamId: string;
    email: string;
    score: number;
    roles: UserRole[];
    lastActiveAt: Date | null;
    createdAt: Date;
  };
  storage: StorageInfo | null;
}

export interface UserListDto {
  users: Array<{
    id: number;
    username: string;
    steamId: string;
    email: string;
    score: number;
    roles: UserRole[];
    lastActiveAt: Date | null;
    createdAt: Date;
    hasSpaceEngineersStorage: boolean;
    storageItemCount: number;
  }>;
  totalUsers: number;
  spaceEngineersUsers: number;
}

@Injectable()
export class AdminUserService {
  private readonly logger = new Logger(AdminUserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SpaceEngineersOnlineStorage)
    private readonly storageRepository: Repository<SpaceEngineersOnlineStorage>,
    @InjectRepository(SpaceEngineersOnlineStorageItem)
    private readonly storageItemRepository: Repository<SpaceEngineersOnlineStorageItem>,
  ) {}

  /**
   * Verify admin permissions
   */
  private verifyAdminPermission(userRoles: UserRole[]): void {
    if (!hasRoleOrHigher(userRoles, UserRole.GAME_ADMIN)) {
      throw new ForbiddenException(
        'Insufficient permissions. GAME_ADMIN role or higher required.',
      );
    }
  }

  /**
   * Get all users with Space Engineers storage information
   */
  async getSpaceEngineersUsers(
    adminUserRoles: UserRole[],
    page: number = 1,
    limit: number = 50,
  ): Promise<UserListDto> {
    this.verifyAdminPermission(adminUserRoles);

    const [users, totalUsers] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { last_active_at: 'DESC' },
    });

    const usersWithStorage = await Promise.all(
      users.map(async (user) => {
        const storage = await this.storageRepository.findOne({
          where: { steamId: user.steam_id },
        });

        let storageItemCount = 0;
        if (storage) {
          storageItemCount = await this.storageItemRepository.count({
            where: { storageId: storage.id },
          });
        }

        return {
          id: user.id,
          username: user.username,
          steamId: user.steam_id,
          email: user.email,
          score: user.score,
          roles: user.roles,
          lastActiveAt: user.last_active_at,
          createdAt: user.created_at,
          hasSpaceEngineersStorage: !!storage,
          storageItemCount,
        };
      }),
    );

    const spaceEngineersUsers = usersWithStorage.filter(
      (user) => user.hasSpaceEngineersStorage,
    ).length;

    this.logger.log(
      `Admin retrieved ${users.length} users, ${spaceEngineersUsers} with Space Engineers storage`,
    );

    return {
      users: usersWithStorage,
      totalUsers,
      spaceEngineersUsers,
    };
  }

  /**
   * Get specific user's Space Engineers inventory
   */
  async getUserSpaceEngineersInventory(
    adminUserRoles: UserRole[],
    userId: number,
  ): Promise<UserInventoryDto> {
    this.verifyAdminPermission(adminUserRoles);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const storage = await this.storageRepository.findOne({
      where: { steamId: user.steam_id },
    });

    let storageData: StorageInfo | null = null;

    if (storage) {
      const storageItems = await this.storageItemRepository.find({
        where: { storageId: storage.id },
        relations: ['item'],
      });

      const items = storageItems.map((storageItem) => ({
        id: storageItem.item.id,
        displayName: storageItem.item.displayName,
        indexName: storageItem.item.indexName,
        category: storageItem.item.category || 'Unknown',
        rarity: storageItem.item.rarity,
        quantity: storageItem.quantity,
        description: storageItem.item.description || '',
        icons: storageItem.item.icons as unknown,
      }));

      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

      storageData = {
        id: storage.id,
        totalItems,
        uniqueItems: items.length,
        items: items.sort((a, b) => b.quantity - a.quantity), // Sort by quantity descending
      };
    }

    this.logger.log(
      `Admin retrieved inventory for user ${user.username} (${user.steam_id})`,
    );

    return {
      user: {
        id: user.id,
        username: user.username,
        steamId: user.steam_id,
        email: user.email,
        score: user.score,
        roles: user.roles,
        lastActiveAt: user.last_active_at,
        createdAt: user.created_at,
      },
      storage: storageData,
    };
  }

  /**
   * Get user by Steam ID
   */
  async getUserBySteamId(
    adminUserRoles: UserRole[],
    steamId: string,
  ): Promise<UserInventoryDto> {
    this.verifyAdminPermission(adminUserRoles);

    const user = await this.userRepository.findOne({
      where: { steam_id: steamId },
    });

    if (!user) {
      throw new NotFoundException(`User with Steam ID ${steamId} not found`);
    }

    return this.getUserSpaceEngineersInventory(adminUserRoles, user.id);
  }

  /**
   * Search users by username
   */
  async searchUsersByUsername(
    adminUserRoles: UserRole[],
    username: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<UserListDto> {
    this.verifyAdminPermission(adminUserRoles);

    const [users, totalUsers] = await this.userRepository.findAndCount({
      where: {
        username: Like(`%${username}%`),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { last_active_at: 'DESC' },
    });

    const usersWithStorage = await Promise.all(
      users.map(async (user) => {
        const storage = await this.storageRepository.findOne({
          where: { steamId: user.steam_id },
        });

        let storageItemCount = 0;
        if (storage) {
          storageItemCount = await this.storageItemRepository.count({
            where: { storageId: storage.id },
          });
        }

        return {
          id: user.id,
          username: user.username,
          steamId: user.steam_id,
          email: user.email,
          score: user.score,
          roles: user.roles,
          lastActiveAt: user.last_active_at,
          createdAt: user.created_at,
          hasSpaceEngineersStorage: !!storage,
          storageItemCount,
        };
      }),
    );

    const spaceEngineersUsers = usersWithStorage.filter(
      (user) => user.hasSpaceEngineersStorage,
    ).length;

    this.logger.log(
      `Admin searched users by username '${username}': found ${users.length} users`,
    );

    return {
      users: usersWithStorage,
      totalUsers,
      spaceEngineersUsers,
    };
  }
}
