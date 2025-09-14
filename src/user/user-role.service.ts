import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/shared/user.entity';
import { UserRole, hasRoleOrHigher } from '../entities/shared/user-role.enum';

@Injectable()
export class UserRoleService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Add a role to a user
   */
  async addRoleToUser(userId: number, role: UserRole): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.roles.includes(role)) {
      user.roles.push(role);
      return this.userRepository.save(user);
    }

    return user;
  }

  /**
   * Remove a role from a user
   */
  async removeRoleFromUser(userId: number, role: UserRole): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.roles = user.roles.filter((r) => r !== role);
    return this.userRepository.save(user);
  }

  /**
   * Set user roles (replace all existing roles)
   */
  async setUserRoles(userId: number, roles: UserRole[]): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate roles
    const validRoles = Object.values(UserRole);
    const invalidRoles = roles.filter((role) => !validRoles.includes(role));

    if (invalidRoles.length > 0) {
      throw new BadRequestException(
        `Invalid roles: ${invalidRoles.join(', ')}`,
      );
    }

    user.roles = roles;
    return this.userRepository.save(user);
  }

  /**
   * Check if user has a specific role or higher
   */
  async userHasRoleOrHigher(
    userId: number,
    requiredRole: UserRole,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return false;
    }

    return hasRoleOrHigher(user.roles, requiredRole);
  }

  /**
   * Get all users with a specific role
   */
  async getUsersByRole(role: UserRole): Promise<User[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where(':role = ANY(user.roles)', { role })
      .getMany();

    return users;
  }

  /**
   * Promote user to the next role level (if applicable)
   */
  async promoteUser(userId: number, newRole: UserRole): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Add the new role if not already present
    if (!user.roles.includes(newRole)) {
      user.roles.push(newRole);
    }

    return this.userRepository.save(user);
  }

  /**
   * Get role statistics
   */
  async getRoleStatistics(): Promise<Record<UserRole, number>> {
    const statistics: Record<UserRole, number> = {} as Record<UserRole, number>;

    for (const role of Object.values(UserRole)) {
      const count = await this.userRepository
        .createQueryBuilder('user')
        .where(':role = ANY(user.roles)', { role })
        .getCount();

      statistics[role] = count;
    }

    return statistics;
  }
}
