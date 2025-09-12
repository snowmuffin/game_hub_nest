import logger from '../../utils/logger';
import { AppDataSource } from '../../data-source';
import { LessThanOrEqual, Repository } from 'typeorm';
import { SpaceEngineersDropTable } from '@entities/space_engineers/drop-table.entity';

// Legacy table removed per requirement: force error when DB entries are missing

export interface GetDropOptions {
  /** limit drop pool by server; null means global-only; undefined means global or this server */
  serverId?: number | null;
  /** provide a custom repository (useful for testing/DI) */
  repository?: Repository<SpaceEngineersDropTable>;
}

/**
 * Returns a dropped item name using the DB-backed drop table.
 * Falls back to legacy static table if DB/repository is not available.
 */
export async function getDrop(
  damage: number,
  mult: number,
  maxRarity: number,
  options: GetDropOptions = {},
): Promise<string | null> {
  logger.info(
    `getDrop called with damage: ${damage}, mult: ${mult}, maxRarity: ${maxRarity}, serverId: ${options.serverId ?? 'any'}`,
  );

  const minDropChance = 0.001;
  const maxDropChance = 0.7;
  const minDamage = 1;
  const maxDamage = 50;

  const dropChance = Math.min(
    maxDropChance,
    Math.max(
      minDropChance,
      ((damage - minDamage) / (maxDamage - minDamage)) *
        (maxDropChance - minDropChance) +
        minDropChance,
    ),
  );

  const randomChance = Math.random();
  if (randomChance > dropChance) {
    logger.info('No item dropped based on dropChance.');
    return null;
  }

  try {
    const repository =
      options.repository ??
      (AppDataSource.isInitialized
        ? AppDataSource.getRepository(SpaceEngineersDropTable)
        : null);
    if (!repository) {
      const msg =
        'AppDataSource is not initialized and no repository provided. Cannot compute drop.';
      logger.error(msg);
      throw new Error(msg);
    }

    // Build WHERE conditions
    const where = [] as any[];
    if (options.serverId === null) {
      // Only global
      where.push({
        isActive: true,
        rarity: LessThanOrEqual(maxRarity),
        serverId: null,
      });
    } else if (typeof options.serverId === 'number') {
      // This server OR global
      where.push(
        {
          isActive: true,
          rarity: LessThanOrEqual(maxRarity),
          serverId: options.serverId,
        },
        {
          isActive: true,
          rarity: LessThanOrEqual(maxRarity),
          serverId: null,
        },
      );
    } else {
      // Any active entry within rarity (ignore server)
      where.push({
        isActive: true,
        rarity: LessThanOrEqual(maxRarity),
      });
    }

    const entries = await repository.find({ where });

    if (!entries.length) {
      const msg = 'No active drop table entries found for given constraints.';
      logger.error(msg);
      throw new Error(msg);
    }

    const weights: Record<string, number> = {};
    let totalWeight = 0;

    for (const e of entries) {
      const drRaw = e.dropRateMultiplier as unknown as number | string;
      const dropRate =
        typeof drRaw === 'string' ? parseFloat(drRaw) : Number(drRaw ?? 1);
      const adjustedWeight =
        Math.pow(mult, e.rarity) *
        (isFinite(dropRate) && dropRate > 0 ? dropRate : 1);
      if (adjustedWeight <= 0) continue;
      weights[e.itemName] = (weights[e.itemName] ?? 0) + adjustedWeight;
      totalWeight += adjustedWeight;
    }

    if (totalWeight <= 0) {
      const msg = 'Total weight is zero after processing DB entries.';
      logger.error(msg);
      throw new Error(msg);
    }

    const randomValue = Math.random() * totalWeight;
    let acc = 0;
    for (const [item, weight] of Object.entries(weights)) {
      acc += weight;
      if (randomValue <= acc) {
        logger.info(`Item dropped (DB): ${item}`);
        return item;
      }
    }

    logger.warn(
      'No item selected after DB weight calculation. This should not happen.',
    );
    return null;
  } catch (err) {
    const msg = `Error using DB drop table: ${
      err instanceof Error ? err.message : String(err)
    }`;
    logger.error(msg);
    throw err instanceof Error ? err : new Error(msg);
  }
}
