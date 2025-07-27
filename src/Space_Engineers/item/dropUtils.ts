import logger from '../../utils/logger';
import { DropTableService } from './drop-table.service';

// Singleton instance for DropTableService
let dropTableServiceInstance: DropTableService | null = null;

/**
 * Initialize the drop table service for DB-based drops
 * This should be called during application startup
 */
export function initializeDropTableService(
  dropTableService: DropTableService,
): void {
  dropTableServiceInstance = dropTableService;
}

/**
 * Get drop using database-based drop table
 * This is the recommended method for calculating drops
 */
export async function getDropFromDB(
  damage: number,
  mult: number,
  maxRarity: number,
): Promise<string | null> {
  if (!dropTableServiceInstance) {
    logger.error(
      'DropTableService not initialized. Call initializeDropTableService() first.',
    );
    return null;
  }

  try {
    return await dropTableServiceInstance.calculateGameDrop(
      damage,
      mult,
      maxRarity,
    );
  } catch (error) {
    logger.error(`Failed to calculate drop from DB: ${error.message}`);
    return null;
  }
}

/**
 * Legacy drop calculation function - kept for backward compatibility
 * @deprecated Use getDropFromDB() for new implementations
 */
export async function getDrop(
  damage: number,
  mult: number,
  maxRarity: number,
): Promise<string | null> {
  logger.warn('getDrop() is deprecated. Use getDropFromDB() instead.');
  return await getDropFromDB(damage, mult, maxRarity);
}
