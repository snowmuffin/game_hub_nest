import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../shared/user.entity';

/**
 * SpaceEngineersOnlineStorage Entity
 *
 * Represents a player's online storage container in Space Engineers.
 * Provides persistent storage that exists outside of individual game worlds,
 * allowing players to store items across different servers and game sessions.
 * Each player has their own dedicated storage space linked to their Steam ID,
 * enabling cross-server item persistence and inventory management.
 */
@Entity({ name: 'online_storage', schema: 'space_engineers' })
export class SpaceEngineersOnlineStorage {
  /** Primary key - unique identifier for the storage container */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Steam ID of the player who owns this storage container
   * Links the storage to a specific player account across all servers
   * Ensures storage persistence regardless of server or game session
   */
  @Column({ name: 'steam_id', type: 'varchar', length: 50 })
  steamId: string;

  /**
   * Many-to-one relationship: multiple storage containers can belong to one user
   * Joins on steamId to enable user account linkage and ownership verification
   * Provides access to user profile and authentication information
   */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'steam_id', referencedColumnName: 'steam_id' })
  user: User;
}
