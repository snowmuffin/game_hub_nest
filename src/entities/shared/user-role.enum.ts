/**
 * User Role Enumeration
 *
 * Defines the available roles that can be assigned to users in the game hub system.
 * Roles follow a hierarchical structure where higher roles include permissions of lower roles.
 */
export enum UserRole {
  /** Basic user with read-only access to public content */
  GUEST = 'GUEST',

  /** Standard authenticated user with basic permissions */
  USER = 'USER',

  /** Premium user with additional features and privileges */
  PREMIUM = 'PREMIUM',

  /** Server moderator with server-specific moderation powers */
  MODERATOR = 'MODERATOR',

  /** Game administrator with game-specific management permissions */
  GAME_ADMIN = 'GAME_ADMIN',

  /** Server administrator with full server management permissions */
  SERVER_ADMIN = 'SERVER_ADMIN',

  /** Platform administrator with full system access */
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',

  /** Super administrator with unrestricted access to all features */
  SUPER_ADMIN = 'SUPER_ADMIN',
}

/**
 * Role Hierarchy Configuration
 * Defines which roles inherit permissions from other roles
 */
export const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  [UserRole.GUEST]: [],
  [UserRole.USER]: [UserRole.GUEST],
  [UserRole.PREMIUM]: [UserRole.USER, UserRole.GUEST],
  [UserRole.MODERATOR]: [UserRole.USER, UserRole.GUEST],
  [UserRole.GAME_ADMIN]: [UserRole.MODERATOR, UserRole.USER, UserRole.GUEST],
  [UserRole.SERVER_ADMIN]: [
    UserRole.GAME_ADMIN,
    UserRole.MODERATOR,
    UserRole.USER,
    UserRole.GUEST,
  ],
  [UserRole.PLATFORM_ADMIN]: [
    UserRole.SERVER_ADMIN,
    UserRole.GAME_ADMIN,
    UserRole.MODERATOR,
    UserRole.USER,
    UserRole.GUEST,
  ],
  [UserRole.SUPER_ADMIN]: [
    UserRole.PLATFORM_ADMIN,
    UserRole.SERVER_ADMIN,
    UserRole.GAME_ADMIN,
    UserRole.MODERATOR,
    UserRole.USER,
    UserRole.GUEST,
  ],
};

/**
 * Role Permissions Configuration
 * Defines specific permissions for each role
 */
export const ROLE_PERMISSIONS = {
  [UserRole.GUEST]: ['view_public_content', 'view_server_status'],

  [UserRole.USER]: [
    'create_account',
    'update_profile',
    'view_personal_data',
    'participate_in_games',
    'view_leaderboards',
    'submit_bug_reports',
  ],

  [UserRole.PREMIUM]: [
    'access_premium_features',
    'priority_queue',
    'custom_profile_themes',
    'advanced_statistics',
  ],

  [UserRole.MODERATOR]: [
    'moderate_chat',
    'kick_users',
    'temporary_ban_users',
    'view_user_reports',
    'manage_user_warnings',
  ],

  [UserRole.GAME_ADMIN]: [
    'manage_game_settings',
    'spawn_items',
    'teleport_players',
    'manage_world_data',
    'access_admin_commands',
  ],

  [UserRole.SERVER_ADMIN]: [
    'manage_server_config',
    'restart_server',
    'manage_server_mods',
    'view_server_logs',
    'manage_backups',
    'permanent_ban_users',
  ],

  [UserRole.PLATFORM_ADMIN]: [
    'manage_all_servers',
    'manage_user_accounts',
    'view_system_analytics',
    'manage_platform_settings',
    'access_financial_data',
  ],

  [UserRole.SUPER_ADMIN]: [
    'full_system_access',
    'manage_admin_accounts',
    'system_maintenance',
    'database_access',
    'security_management',
  ],
};

/**
 * Helper function to check if a user has a specific role or higher
 */
export function hasRoleOrHigher(
  userRoles: string[],
  requiredRole: UserRole,
): boolean {
  const userRoleEnums = userRoles.map((role) => role as UserRole);

  // Check if user has the exact role
  if (userRoleEnums.includes(requiredRole)) {
    return true;
  }

  // Check if user has a higher role that includes the required role
  for (const userRole of userRoleEnums) {
    if (ROLE_HIERARCHY[userRole]?.includes(requiredRole)) {
      return true;
    }
  }

  return false;
}

/**
 * Helper function to get all permissions for a user based on their roles
 */
export function getUserPermissions(userRoles: string[]): string[] {
  const permissions = new Set<string>();

  for (const role of userRoles) {
    const roleEnum = role as UserRole;

    // Add direct permissions for this role
    if (ROLE_PERMISSIONS[roleEnum]) {
      ROLE_PERMISSIONS[roleEnum].forEach((permission) =>
        permissions.add(permission),
      );
    }

    // Add permissions from inherited roles
    if (ROLE_HIERARCHY[roleEnum]) {
      for (const inheritedRole of ROLE_HIERARCHY[roleEnum]) {
        if (ROLE_PERMISSIONS[inheritedRole]) {
          ROLE_PERMISSIONS[inheritedRole].forEach((permission) =>
            permissions.add(permission),
          );
        }
      }
    }
  }

  return Array.from(permissions);
}
