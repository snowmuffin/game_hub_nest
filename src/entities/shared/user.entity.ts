import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from './user-role.enum';

/**
 * User Entity
 *
 * Represents a user account within the game hub system.
 * Users can authenticate through multiple methods (Steam, email/password)
 * and maintain profiles across different games and servers.
 * Each user has a unique identifier and can accumulate scores/achievements.
 */
@Entity({ name: 'users' })
export class User {
  /** Primary key - unique identifier for the user account */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Unique username for user identification and display
   * Used for login and as a display name across the platform
   */
  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  /**
   * User's email address for account recovery and notifications
   * Optional field that can be used for email-based authentication
   */
  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  email: string;

  /**
   * Hashed password for email-based authentication
   * Stored as encrypted hash for security purposes
   */
  @Column({ type: 'varchar', nullable: true })
  password: string;

  /**
   * Unique Steam ID for Steam-based authentication
   * Primary authentication method linking to Steam platform
   */
  @Column({ type: 'varchar', length: 50, unique: true })
  steam_id: string;

  /**
   * User's accumulated score or reputation points
   * Can represent achievements, experience points, or overall platform activity
   */
  @Column({ type: 'float', default: 0 })
  score: number;

  /** Timestamp when the user account was created */
  @CreateDateColumn()
  created_at: Date;

  /** Timestamp when the user account was last updated */
  @UpdateDateColumn()
  updated_at: Date;

  /**
   * Timestamp of the user's last activity (e.g., login or meaningful action)
   * Nullable for legacy rows; set to current time on create/login.
   */
  @Column({ type: 'timestamptz', nullable: true })
  last_active_at: Date | null;

  /**
   * Roles assigned to the user (RBAC basic support)
   * Stored as text[] in Postgres. Default contains basic USER role.
   * Examples: [UserRole.USER], [UserRole.USER, UserRole.ADMIN].
   */
  @Column({ type: 'text', array: true, default: `{${UserRole.USER}}` })
  roles: UserRole[];
}
