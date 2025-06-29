import logger from '../../utils/logger';

const dropTable: Record<string, number> = {
  PrototechFrame: 11, PrototechPanel: 4, PrototechCapacitor: 4, PrototechPropulsionUnit: 4,
  PrototechMachinery: 4, PrototechCircuitry: 4, PrototechCoolingUnit: 8,
  DefenseUpgradeModule_Level1: 5, DefenseUpgradeModule_Level2: 6, DefenseUpgradeModule_Level3: 7,
  DefenseUpgradeModule_Level4: 8, DefenseUpgradeModule_Level5: 9, DefenseUpgradeModule_Level6: 10,
  DefenseUpgradeModule_Level7: 11, DefenseUpgradeModule_Level8: 12, DefenseUpgradeModule_Level9: 13,
  DefenseUpgradeModule_Level10: 14,
  AttackUpgradeModule_Level1: 5, AttackUpgradeModule_Level2: 6, AttackUpgradeModule_Level3: 7,
  AttackUpgradeModule_Level4: 8, AttackUpgradeModule_Level5: 9, AttackUpgradeModule_Level6: 10,
  AttackUpgradeModule_Level7: 11, AttackUpgradeModule_Level8: 12, AttackUpgradeModule_Level9: 13,
  AttackUpgradeModule_Level10: 14,
  PowerEfficiencyUpgradeModule_Level1: 5, PowerEfficiencyUpgradeModule_Level2: 6, PowerEfficiencyUpgradeModule_Level3: 7,
  PowerEfficiencyUpgradeModule_Level4: 8, PowerEfficiencyUpgradeModule_Level5: 9, PowerEfficiencyUpgradeModule_Level6: 10,
  PowerEfficiencyUpgradeModule_Level7: 11, PowerEfficiencyUpgradeModule_Level8: 12, PowerEfficiencyUpgradeModule_Level9: 13,
  PowerEfficiencyUpgradeModule_Level10: 14,
  BerserkerModule_Level1: 11, BerserkerModule_Level2: 12, BerserkerModule_Level3: 13,
  BerserkerModule_Level4: 14, BerserkerModule_Level5: 15, BerserkerModule_Level6: 16,
  BerserkerModule_Level7: 17, BerserkerModule_Level8: 18, BerserkerModule_Level9: 19,
  BerserkerModule_Level10: 20,
  SpeedModule_Level1: 11, SpeedModule_Level2: 12, SpeedModule_Level3: 13,
  SpeedModule_Level4: 14, SpeedModule_Level5: 15, SpeedModule_Level6: 16,
  SpeedModule_Level7: 17, SpeedModule_Level8: 18, SpeedModule_Level9: 19,
  SpeedModule_Level10: 20,
  FortressModule_Level1: 11, FortressModule_Level2: 12, FortressModule_Level3: 13,
  FortressModule_Level4: 14, FortressModule_Level5: 15, FortressModule_Level6: 16,
  FortressModule_Level7: 17, FortressModule_Level8: 18, FortressModule_Level9: 19,
  FortressModule_Level10: 20,
  Prime_Matter: 3, prototech_scrap: 3,
  ingot_cerium: 4, ingot_lanthanum: 4, ingot_uranium: 3, ingot_platinum: 3, ingot_gold: 2, ingot_silver: 2,
};

export function getDrop(damage: number, mult: number, maxRarity: number): string | null {
  logger.info(`getDrop called with damage: ${damage}, mult: ${mult}, maxRarity: ${maxRarity}`);

  const minDropChance = 0.001;
  const maxDropChance = 0.7;
  const minDamage = 1;
  const maxDamage = 50;

  const dropChance = Math.min(
    maxDropChance,
    Math.max(minDropChance, ((damage - minDamage) / (maxDamage - minDamage)) * (maxDropChance - minDropChance) + minDropChance),
  );

  const randomChance = Math.random();
  if (randomChance > dropChance) {
    logger.info('No item dropped based on dropChance.');
    return null;
  }

  let adjustedWeights: Record<string, number> = {};
  let totalWeight = 0;

  for (const [item, rarity] of Object.entries(dropTable)) {
    if (rarity > maxRarity) continue;
    const adjustedWeight = Math.pow(mult, rarity);
    adjustedWeights[item] = adjustedWeight;
    totalWeight += adjustedWeight;
  }

  let accumulatedProbability = 0;
  const randomValue = Math.random() * totalWeight;

  for (const [item, weight] of Object.entries(adjustedWeights)) {
    accumulatedProbability += weight;
    if (randomValue <= accumulatedProbability) {
      logger.info(`Item dropped: ${item}`);
      return item;
    }
  }

  logger.warn('No item dropped after weight calculation. This should not happen.');
  return null;
}