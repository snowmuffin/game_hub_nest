import { Controller, Get, Query } from '@nestjs/common';
import { DropTableService } from './drop-table.service';
import { getDropFromDB } from './dropUtils';

@Controller('space-engineers/test/drop')
export class DropTestController {
  constructor(private readonly dropTableService: DropTableService) {}

  @Get('legacy')
  async testLegacyDrop(
    @Query('damage') damage: number = 25,
    @Query('mult') mult: number = 0.85,
    @Query('maxRarity') maxRarity: number = 10
  ) {
    const { getDrop } = await import('./dropUtils');
    const result = getDrop(damage, mult, maxRarity);
    return {
      method: 'legacy',
      damage,
      mult,
      maxRarity,
      result
    };
  }

  @Get('db')
  async testDbDrop(
    @Query('damage') damage: number = 25,
    @Query('mult') mult: number = 0.85,
    @Query('maxRarity') maxRarity: number = 10
  ) {
    const result = await getDropFromDB(damage, mult, maxRarity);
    return {
      method: 'db',
      damage,
      mult,
      maxRarity,
      result
    };
  }

  @Get('direct')
  async testDirectDbDrop(
    @Query('damage') damage: number = 25,
    @Query('mult') mult: number = 0.85,
    @Query('maxRarity') maxRarity: number = 10
  ) {
    const result = await this.dropTableService.calculateGameDrop(damage, mult, maxRarity);
    return {
      method: 'direct-db',
      damage,
      mult,
      maxRarity,
      result
    };
  }

  @Get('compare')
  async compareMethods(
    @Query('damage') damage: number = 25,
    @Query('mult') mult: number = 0.85,
    @Query('maxRarity') maxRarity: number = 10,
    @Query('iterations') iterations: number = 10
  ) {
    const { getDrop } = await import('./dropUtils');
    
    const legacyResults: (string | null)[] = [];
    const dbResults: (string | null)[] = [];
    const directDbResults: (string | null)[] = [];

    for (let i = 0; i < iterations; i++) {
      legacyResults.push(await getDrop(damage, mult, maxRarity));
      dbResults.push(await getDropFromDB(damage, mult, maxRarity));
      directDbResults.push(await this.dropTableService.calculateGameDrop(damage, mult, maxRarity));
    }

    return {
      damage,
      mult,
      maxRarity,
      iterations,
      results: {
        legacy: legacyResults,
        db: dbResults,
        directDb: directDbResults
      },
      stats: {
        legacy: {
          drops: legacyResults.filter(r => r !== null).length,
          uniqueItems: [...new Set(legacyResults.filter(r => r !== null))].length
        },
        db: {
          drops: dbResults.filter(r => r !== null).length,
          uniqueItems: [...new Set(dbResults.filter(r => r !== null))].length
        },
        directDb: {
          drops: directDbResults.filter(r => r !== null).length,
          uniqueItems: [...new Set(directDbResults.filter(r => r !== null))].length
        }
      }
    };
  }
}
