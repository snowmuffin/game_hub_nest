# User Role System

Role-Based Access Control (RBAC) system for the game hub platform.

## Role Structure

### Role Hierarchy

```
GUEST          - Basic user (unauthenticated)
  └── USER     - Authenticated user
      ├── PREMIUM      - Premium user
      └── MODERATOR    - Server moderator
          └── GAME_ADMIN      - Game administrator
              └── SERVER_ADMIN      - Server administrator
                  └── PLATFORM_ADMIN   - Platform administrator
                      └── SUPER_ADMIN  - Super administrator
```

### Role Permissions

#### GUEST
- `view_public_content` - View public content
- `view_server_status` - View server status

#### USER
- GUEST permissions + additional permissions:
- `create_account` - Create account
- `update_profile` - Update profile
- `view_personal_data` - View personal data
- `participate_in_games` - Participate in games
- `view_leaderboards` - View leaderboards
- `submit_bug_reports` - Submit bug reports

#### PREMIUM
- USER permissions + additional permissions:
- `access_premium_features` - Access premium features
- `priority_queue` - Priority queue access
- `custom_profile_themes` - Custom profile themes
- `advanced_statistics` - Advanced statistics

#### MODERATOR
- USER permissions + additional permissions:
- `moderate_chat` - Moderate chat
- `kick_users` - Kick users
- `temporary_ban_users` - Temporary ban users
- `view_user_reports` - View user reports
- `manage_user_warnings` - Manage user warnings

#### GAME_ADMIN
- MODERATOR + USER permissions + additional permissions:
- `manage_game_settings` - Manage game settings
- `spawn_items` - Spawn items
- `teleport_players` - Teleport players
- `manage_world_data` - Manage world data
- `access_admin_commands` - Access admin commands

#### SERVER_ADMIN
- GAME_ADMIN + all lower permissions + additional permissions:
- `manage_server_config` - Manage server configuration
- `restart_server` - Restart server
- `manage_server_mods` - Manage server mods
- `view_server_logs` - View server logs
- `manage_backups` - Manage backups
- `permanent_ban_users` - Permanently ban users

#### PLATFORM_ADMIN
- SERVER_ADMIN + all lower permissions + additional permissions:
- `manage_all_servers` - Manage all servers
- `manage_user_accounts` - Manage user accounts
- `view_system_analytics` - View system analytics
- `manage_platform_settings` - Manage platform settings
- `access_financial_data` - Access financial data

#### SUPER_ADMIN
- All permissions + additional permissions:
- `full_system_access` - Full system access
- `manage_admin_accounts` - Manage admin accounts
- `system_maintenance` - System maintenance
- `database_access` - Database access
- `security_management` - Security management

## Usage

### 1. Role Protection in Controllers

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, MinRole } from '../auth/roles.decorator';
import { UserRole } from '../entities/shared/user-role.enum';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  // Minimum MODERATOR role required
  @Get('moderate')
  @MinRole(UserRole.MODERATOR)
  moderateContent() {
    return { message: 'Moderation panel access granted' };
  }

  // Allow specific roles only (one of multiple roles)
  @Get('premium-features')
  @Roles(UserRole.PREMIUM, UserRole.GAME_ADMIN)
  premiumFeatures() {
    return { message: 'Premium features access granted' };
  }
}
```

### 2. Role Management Service

```typescript
import { UserRoleService } from './user/user-role.service';

// Add role to user
await userRoleService.addRoleToUser(userId, UserRole.MODERATOR);

// Set user roles (replace existing roles)
await userRoleService.setUserRoles(userId, [UserRole.USER, UserRole.PREMIUM]);

// Check user role
const hasRole = await userRoleService.userHasRoleOrHigher(userId, UserRole.GAME_ADMIN);

// Get all users with specific role
const admins = await userRoleService.getUsersByRole(UserRole.GAME_ADMIN);
```

### 3. Permission Check Helper Functions

```typescript
import { hasRoleOrHigher, getUserPermissions } from '../entities/shared/user-role.enum';

// Check if user has specific role or higher
const canModerate = hasRoleOrHigher(user.roles, UserRole.MODERATOR);

// Get all user permissions
const permissions = getUserPermissions(user.roles);
```

## File Structure

```
src/
├── entities/shared/
│   ├── user.entity.ts          # User entity (includes roles field)
│   └── user-role.enum.ts       # Role definitions and helper functions
├── auth/
│   ├── roles.decorator.ts      # @Roles, @MinRole decorators
│   └── roles.guard.ts          # Role-based guard
├── user/
│   └── user-role.service.ts    # Role management service
└── admin/
    └── admin.controller.ts     # Admin controller example
```

## Database Schema

```sql
-- users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  steam_id VARCHAR(50) UNIQUE NOT NULL,
  score FLOAT DEFAULT 0,
  roles TEXT[] DEFAULT '{USER}',  -- Role array
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ
);
```

## Migration

To update existing users' roles:

```sql
-- Set all existing users to USER role
UPDATE users SET roles = '{USER}' WHERE roles = '{USER}' OR roles IS NULL;

-- Grant admin role to specific user
UPDATE users SET roles = '{USER,GAME_ADMIN}' WHERE steam_id = 'your_steam_id';
```

## Security Considerations

1. **Principle of Least Privilege**: Grant users only the minimum roles they need
2. **Role Hierarchy Usage**: Higher roles automatically include lower role permissions
3. **Audit Logging**: Record role changes for audit purposes (implement if needed)
4. **Session Invalidation**: Consider invalidating existing JWT tokens when roles change
