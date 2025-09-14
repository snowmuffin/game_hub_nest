import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, hasRoleOrHigher } from '../entities/shared/user-role.enum';
import { User } from '../entities/shared/user.entity';
import { ROLES_KEY } from './roles.decorator';

interface RequestWithUser extends Request {
  user?: User;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // No roles required, allow access
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      return false; // No user, deny access
    }

    // Check if user has any of the required roles or higher
    return requiredRoles.some((role) =>
      hasRoleOrHigher(user.roles || [], role),
    );
  }
}
