import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DropTableService } from './drop-table.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('space-engineers/admin/drop-table')
@UseGuards(JwtAuthGuard)
export class DropTableController {
  constructor(private readonly dropTableService: DropTableService) {}

  @Get()
  async getAllDropTableItems(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('rarity') rarity?: number,
    @Query('is_active') isActive?: boolean,
  ) {
    try {
      return await this.dropTableService.getDropTableItems({
        page,
        limit,
        rarity,
        isActive,
      });
    } catch (error) {
      throw new HttpException(
        `Failed to get drop table items: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getDropTableItem(@Param('id') id: number) {
    try {
      const item = await this.dropTableService.getDropTableItemById(id);
      if (!item) {
        throw new HttpException(
          'Drop table item not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return item;
    } catch (error) {
      throw new HttpException(
        `Failed to get drop table item: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('available-items')
  async getAvailableItems(
    @Query('search') search?: string,
    @Query('rarity') rarity?: number,
  ) {
    try {
      return await this.dropTableService.getAvailableItemsFromItemsTable({
        search,
        rarity,
      });
    } catch (error) {
      throw new HttpException(
        `Failed to get available items: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async addDropTableItem(
    @Body()
    createDropTableDto: {
      item_id: string;
      drop_rate_multiplier?: number;
      is_active?: boolean;
      description?: string;
    },
  ) {
    try {
      return await this.dropTableService.addDropTableItem(createDropTableDto);
    } catch (error) {
      throw new HttpException(
        `Failed to add drop table item: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id')
  async updateDropTableItem(
    @Param('id') id: number,
    @Body()
    updateDropTableDto: {
      drop_rate_multiplier?: number;
      is_active?: boolean;
      description?: string;
    },
  ) {
    try {
      return await this.dropTableService.updateDropTableItem(
        id,
        updateDropTableDto,
      );
    } catch (error) {
      throw new HttpException(
        `Failed to update drop table item: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async removeDropTableItem(@Param('id') id: number) {
    try {
      await this.dropTableService.removeDropTableItem(id);
      return { message: 'Drop table item removed successfully' };
    } catch (error) {
      throw new HttpException(
        `Failed to remove drop table item: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('migrate-hardcoded')
  async migrateFromHardcodedDropTable() {
    try {
      const result =
        await this.dropTableService.migrateFromHardcodedDropTable();
      return {
        message: 'Migration completed successfully',
        result,
      };
    } catch (error) {
      throw new HttpException(
        `Migration failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats/summary')
  async getDropTableStats() {
    try {
      return await this.dropTableService.getDropTableStats();
    } catch (error) {
      throw new HttpException(
        `Failed to get drop table stats: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
