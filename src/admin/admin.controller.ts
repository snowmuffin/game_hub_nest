import {
  Controller,
  Get,
  Patch,
  UseGuards,
  Param,
  Query,
  Body,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, MinRole } from '../auth/roles.decorator';
import { UserRole } from '../entities/shared/user-role.enum';
import { AdminUserService } from './admin-user.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminUserService: AdminUserService) {}

  /**
   * Only users with MODERATOR role or higher can access
   */
  @Get('moderate')
  @MinRole(UserRole.MODERATOR)
  moderateContent() {
    return { message: 'Moderation panel access granted' };
  }

  /**
   * Only users with GAME_ADMIN role or higher can access
   */
  @Get('game-admin')
  @MinRole(UserRole.GAME_ADMIN)
  gameAdminPanel() {
    return { message: 'Game admin panel access granted' };
  }

  /**
   * Only users with SERVER_ADMIN role or higher can access
   */
  @Get('server-admin')
  @MinRole(UserRole.SERVER_ADMIN)
  serverAdminPanel() {
    return { message: 'Server admin panel access granted' };
  }

  /**
   * Only users with specific roles can access (multiple roles allowed)
   */
  @Get('premium-or-admin')
  @Roles(UserRole.PREMIUM, UserRole.GAME_ADMIN, UserRole.SERVER_ADMIN)
  premiumOrAdminFeatures() {
    return { message: 'Premium or admin features access granted' };
  }

  /**
   * Only SUPER_ADMIN can access this endpoint
   */
  @Get('super-admin')
  @MinRole(UserRole.SUPER_ADMIN)
  superAdminPanel() {
    return { message: 'Super admin panel access granted' };
  }

  /**
   * Get all Space Engineers users with storage information
   * GAME_ADMIN role or higher required
   */
  @Get('space-engineers/users')
  @MinRole(UserRole.GAME_ADMIN)
  async getSpaceEngineersUsers(
    @Request() req: { user?: { roles?: UserRole[] } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '50');
    const roles = req.user?.roles ?? [];
    return this.adminUserService.getSpaceEngineersUsers(
      roles,
      pageNum,
      limitNum,
    );
  }

  /**
   * Get specific user's Space Engineers inventory by user ID
   * GAME_ADMIN role or higher required
   */
  @Get('space-engineers/users/:userId/inventory')
  @MinRole(UserRole.GAME_ADMIN)
  async getUserInventory(
    @Request() req: { user?: { roles?: UserRole[] } },
    @Param('userId') userId: string,
  ) {
    const roles = req.user?.roles ?? [];
    return this.adminUserService.getUserSpaceEngineersInventory(
      roles,
      parseInt(userId),
    );
  }

  /**
   * Get specific user's Space Engineers inventory by Steam ID
   * GAME_ADMIN role or higher required
   */
  @Get('space-engineers/steam/:steamId/inventory')
  @MinRole(UserRole.GAME_ADMIN)
  async getUserInventoryBySteamId(
    @Request() req: { user?: { roles?: UserRole[] } },
    @Param('steamId') steamId: string,
  ) {
    const roles = req.user?.roles ?? [];
    return this.adminUserService.getUserBySteamId(roles, steamId);
  }

  /**
   * Search users by username
   * GAME_ADMIN role or higher required
   */
  @Get('users/search')
  @MinRole(UserRole.GAME_ADMIN)
  async searchUsers(
    @Request() req: { user?: { roles?: UserRole[] } },
    @Query('username') username: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '20');
    const roles = req.user?.roles ?? [];
    return this.adminUserService.searchUsersByUsername(
      roles,
      username,
      pageNum,
      limitNum,
    );
  }

  /**
   * Verify admin access and return session info for frontend
   */
  @Get('verify-access')
  async verifyAccess(@Request() req: { user?: { id?: number } }) {
    // req.user.id is set by JwtAuthGuard
    const userId = Number(req.user?.id ?? 0);
    const result = await this.adminUserService.verifyAccess(userId);

    if (!result.isAdmin) {
      // Consistent with the failure shapes provided in the spec
      // But since route is JWT-protected, return Forbidden if not admin
      throw new ForbiddenException('Administrator privileges required');
    }

    return result;
  }

  /**
   * Get all Space Engineers items with pagination and filtering
   * GAME_ADMIN role or higher required
   */
  @Get('space-engineers/items')
  @MinRole(UserRole.GAME_ADMIN)
  async getSpaceEngineersItems(
    @Request() req: { user?: { roles?: UserRole[] } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('rarityMin') rarityMin?: string,
    @Query('rarityMax') rarityMax?: string,
  ) {
    const roles = req.user?.roles ?? [];
    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '50');
    return this.adminUserService.getSpaceEngineersItems(
      roles,
      pageNum,
      limitNum,
      search,
      category,
      rarityMin ? parseInt(rarityMin) : undefined,
      rarityMax ? parseInt(rarityMax) : undefined,
    );
  }

  /**
   * Update Space Engineers item properties
   * GAME_ADMIN role or higher required
   */
  @Patch('space-engineers/items/:itemId')
  @MinRole(UserRole.GAME_ADMIN)
  async updateSpaceEngineersItem(
    @Request() req: { user?: { roles?: UserRole[] } },
    @Param('itemId') itemId: string,
    @Body() updateData: { rarity?: number; description?: string; category?: string },
  ) {
    const roles = req.user?.roles ?? [];
    return this.adminUserService.updateSpaceEngineersItem(
      roles,
      parseInt(itemId),
      updateData,
    );
  }
}
