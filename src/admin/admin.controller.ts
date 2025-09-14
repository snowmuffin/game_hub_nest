import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, MinRole } from '../auth/roles.decorator';
import { UserRole } from '../entities/shared/user-role.enum';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
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
}
