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
import { SpaceEngineersItem } from '../entities/space_engineers/item.entity';
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

export interface VerifyAccessResponse {
  isAdmin: boolean;
  adminData?: {
    steamId: string;
    username: string;
    isAdmin: boolean;
    adminLevel: number; // 1=ADMIN(GAME/SERVER/PLATFORM), 2=SUPER_ADMIN
    lastAdminAccess: string; // ISO 8601
  };
  sessionExpiry?: string; // ISO 8601
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
    @InjectRepository(SpaceEngineersItem)
    private readonly itemRepository: Repository<SpaceEngineersItem>,
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

  /**
   * Verify access for admin UI contract
   */
  async verifyAccess(userId: number): Promise<VerifyAccessResponse> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return { isAdmin: false };
    }

    const roles = user.roles || [];
    const isSuperAdmin = roles.includes(UserRole.SUPER_ADMIN);
    const isAnyAdmin =
      isSuperAdmin ||
      roles.includes(UserRole.PLATFORM_ADMIN) ||
      roles.includes(UserRole.SERVER_ADMIN) ||
      roles.includes(UserRole.GAME_ADMIN);

    if (!isAnyAdmin) {
      return { isAdmin: false };
    }

    const now = Date.now();
    const sessionExpiry = new Date(now + 30 * 60 * 1000).toISOString();
    const lastAdminAccess = new Date(now).toISOString();

    // Map to admin level: 2 = SUPER_ADMIN, 1 = others
    const adminLevel = isSuperAdmin ? 2 : 1;

    return {
      isAdmin: true,
      adminData: {
        steamId: user.steam_id,
        username: user.username,
        isAdmin: true,
        adminLevel,
        lastAdminAccess,
      },
      sessionExpiry,
    };
  }

  /**
   * Get all Space Engineers items with pagination and filtering
   */
  async getSpaceEngineersItems(
    adminUserRoles: UserRole[],
    page: number = 1,
    limit: number = 50,
    search?: string,
    category?: string,
    rarityMin?: number,
    rarityMax?: number,
  ): Promise<{
    items: Array<{
      id: number;
      indexName: string;
      displayName: string;
      rarity: number;
      description: string | null;
      category: string | null;
      icons: unknown;
      createdAt: Date;
      updatedAt: Date;
    }>;
    totalItems: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    this.verifyAdminPermission(adminUserRoles);

    const qb = this.itemRepository.createQueryBuilder('item');

    // Apply search filter
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      qb.andWhere(
        '(item.displayName ILIKE :search OR item.indexName ILIKE :search)',
        { search: searchTerm },
      );
    }

    // Apply category filter
    if (category && category.trim()) {
      qb.andWhere('item.category = :category', { category: category.trim() });
    }

    // Apply rarity filters
    if (rarityMin !== undefined) {
      qb.andWhere('item.rarity >= :rarityMin', { rarityMin });
    }
    if (rarityMax !== undefined) {
      qb.andWhere('item.rarity <= :rarityMax', { rarityMax });
    }

    // Get total count
    const totalItems = await qb.getCount();

    // Apply pagination
    qb.orderBy('item.displayName', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const items = await qb.getMany();

    return {
      items: items.map((item) => ({
        id: item.id,
        indexName: item.indexName,
        displayName: item.displayName,
        rarity: item.rarity,
        description: item.description,
        category: item.category,
        icons: item.icons,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  /**
   * Update Space Engineers item properties
   */
  async updateSpaceEngineersItem(
    adminUserRoles: UserRole[],
    itemId: number,
    updateData: { rarity?: number; description?: string; category?: string },
  ): Promise<{
    id: number;
    indexName: string;
    displayName: string;
    rarity: number;
    description: string | null;
    category: string | null;
    updatedAt: Date;
  }> {
    this.verifyAdminPermission(adminUserRoles);

    const item = await this.itemRepository.findOne({ where: { id: itemId } });

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }

    // Update fields if provided
    if (updateData.rarity !== undefined) {
      item.rarity = updateData.rarity;
    }
    if (updateData.description !== undefined) {
      item.description = updateData.description;
    }
    if (updateData.category !== undefined) {
      item.category = updateData.category;
    }

    await this.itemRepository.save(item);

    this.logger.log(
      `Item ${item.id} (${item.displayName}) updated by admin. Changes: ${JSON.stringify(updateData)}`,
    );

    return {
      id: item.id,
      indexName: item.indexName,
      displayName: item.displayName,
      rarity: item.rarity,
      description: item.description,
      category: item.category,
      updatedAt: item.updatedAt,
    };
  }
}
