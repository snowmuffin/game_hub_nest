import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../entities/shared/user-role.enum';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for a route or controller
 * @param roles - Array of roles that are allowed to access the endpoint
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Decorator to specify minimum role level for a route or controller
 * @param role - Minimum role required to access the endpoint
 */
export const MinRole = (role: UserRole) => SetMetadata(ROLES_KEY, [role]);
