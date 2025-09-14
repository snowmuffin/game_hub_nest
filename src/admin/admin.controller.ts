import {
  Controller,
  Get,
  UseGuards,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, MinRole } from '../auth/roles.decorator';
import { UserRole } from '../entities/shared/user-role.enum';
import { AdminUserService } from './admin-user.service';

interface AuthenticatedRequest {
  user: {
    id: number;
    username: string;
    steamId: string;
    roles: UserRole[];
  };
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminUserService: AdminUserService) {}

  /**
   * Verify admin access and return admin session information
   * Requires JWT authentication, minimum role validation performed inside
   */
  @Get('verify-access')
  @UseGuards(JwtAuthGuard) // Only JWT authentication, role check inside service
  async verifyAdminAccess(@Request() req: AuthenticatedRequest) {
    return await this.adminUserService.verifyAdminAccess(req.user);
  }

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
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '50');
    
    return this.adminUserService.getSpaceEngineersUsers(
      req.user.roles,
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
    @Request() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ) {
    return this.adminUserService.getUserSpaceEngineersInventory(
      req.user.roles,
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
    @Request() req: AuthenticatedRequest,
    @Param('steamId') steamId: string,
  ) {
    return this.adminUserService.getUserBySteamId(req.user.roles, steamId);
  }

  /**
   * Search users by username
   * GAME_ADMIN role or higher required
   */
  @Get('users/search')
  @MinRole(UserRole.GAME_ADMIN)
  async searchUsers(
    @Request() req: AuthenticatedRequest,
    @Query('username') username: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '20');
    
    return this.adminUserService.searchUsersByUsername(
      req.user.roles,
      username,
      pageNum,
      limitNum,
    );
  }
}
