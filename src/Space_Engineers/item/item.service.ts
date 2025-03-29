import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@entities/user.entity';

@Injectable()
export class ItemService {
  private readonly logger = new Logger(ItemService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 아이템 조회
  async getItems(steamId: string): Promise<any> {
    this.logger.log(`Fetching items for Steam ID: ${steamId}`);
    const query = `
      SELECT * FROM online_storage WHERE steam_id = $1
    `;
    const results = await this.userRepository.query(query, [steamId]);

    if (results.length === 0) {
      const insertQuery = `
        INSERT INTO online_storage (steam_id) VALUES ($1)
      `;
      await this.userRepository.query(insertQuery, [steamId]);
      return [];
    }

    const resourceKeys = Object.keys(results[0]).filter(
      (key) => key !== 'steam_id' && results[0][key] > 0,
    );

    if (resourceKeys.length === 0) {
      return [];
    }

    const placeholders = resourceKeys.map(() => '?').join(', ');
    const itemInfoQuery = `
      SELECT index_name, display_name, category, description, rarity
      FROM items_info
      WHERE index_name IN (${placeholders})
    `;
    const itemInfoResults = await this.userRepository.query(itemInfoQuery, resourceKeys);

    return itemInfoResults.map((info) => ({
      indexName: info.index_name,
      displayName: info.display_name,
      category: info.category,
      description: info.description,
      rarity: info.rarity,
      quantity: results[0][info.index_name],
    }));
  }

  // 아이템 업로드
  async uploadItem(steamId: string, identifier: string, quantity: number): Promise<any> {
    this.logger.log(`Uploading item: Steam ID=${steamId}, Identifier=${identifier}, Quantity=${quantity}`);

    if (!identifier) {
      this.logger.error(`Failed to upload item: Identifier is missing. Steam ID=${steamId}, Quantity=${quantity}`);
      throw new Error('Identifier (itemName or itemId) is required.');
    }

    try {
      // Step 1: Ensure steamId exists in online_storage
      const storageCheckQuery = `
        SELECT id FROM online_storage WHERE steam_id = $1
      `;
      const storageExists = await this.userRepository.query(storageCheckQuery, [steamId]);

      if (storageExists.length === 0) {
        const insertStorageQuery = `
          INSERT INTO online_storage (steam_id) VALUES ($1)
        `;
        await this.userRepository.query(insertStorageQuery, [steamId]);
        this.logger.log(`Created new storage for Steam ID=${steamId}`);
      }

      // Step 2: Check if the item exists
      const isIndexName = identifier.includes('/');
      const columnName = isIndexName ? 'index_name' : 'id';

      const itemCheckQuery = `
        SELECT * FROM items
        WHERE ${columnName} = $1
      `;
      const itemExists = await this.userRepository.query(itemCheckQuery, [identifier]);

      if (itemExists.length === 0) {
        this.logger.error(`Item not found: ${columnName}="${identifier}". Steam ID=${steamId}`);
        throw new Error(`Item with ${columnName} "${identifier}" does not exist in the items table.`);
      }

      // Step 3: Check for conflicts and update or insert
      const conflictCheckQuery = `
        SELECT * FROM online_storage_items
        WHERE storage_id = (SELECT id FROM online_storage WHERE steam_id = $1)
          AND item_id = (SELECT id FROM items WHERE ${columnName} = $2)
      `;
      const existingRecord = await this.userRepository.query(conflictCheckQuery, [steamId, identifier]);

      if (existingRecord.length > 0) {
        const updateQuery = `
          UPDATE online_storage_items
          SET quantity = quantity + $3
          WHERE storage_id = (SELECT id FROM online_storage WHERE steam_id = $1)
            AND item_id = (SELECT id FROM items WHERE ${columnName} = $2)
        `;
        await this.userRepository.query(updateQuery, [steamId, identifier, quantity]);
      } else {
        const insertQuery = `
          INSERT INTO online_storage_items (storage_id, item_id, quantity)
          VALUES (
            (SELECT id FROM online_storage WHERE steam_id = $1),
            (SELECT id FROM items WHERE ${columnName} = $2),
            $3
          )
        `;
        await this.userRepository.query(insertQuery, [steamId, identifier, quantity]);
      }

      this.logger.log(`Successfully uploaded ${quantity}x '${identifier}' for Steam ID=${steamId}`);
      return { message: `${quantity}x '${identifier}' added to storage.` };
    } catch (error) {
      this.logger.error(`Error uploading item: ${error.message}`, error.stack);
      throw error;
    }
  }

  // 아이템 다운로드
  async downloadItem(steamId: string, itemName: string, quantity: number): Promise<any> {
    this.logger.log(`Downloading item: Steam ID=${steamId}, Item=${itemName}, Quantity=${quantity}`);
    const query = `
      SELECT ${itemName} AS availableQuantity
      FROM online_storage
      WHERE steam_id = $1
      FOR UPDATE
    `;
    const results = await this.userRepository.query(query, [steamId]);

    if (results.length === 0 || results[0].availableQuantity < quantity) {
      throw new Error(`Not enough ${itemName} in storage.`);
    }

    const updateQuery = `
      UPDATE online_storage
      SET ${itemName} = ${itemName} - $1
      WHERE steam_id = $2
    `;
    await this.userRepository.query(updateQuery, [quantity, steamId]);
    return { message: `${quantity}x '${itemName}' deducted from storage.` };
  }

  // 아이템 업그레이드
  async upgradeItem(steamId: string, targetItem: string): Promise<any> {
    this.logger.log(`Upgrading item: Steam ID=${steamId}, Target Item=${targetItem}`);
    const blueprintQuery = `
      SELECT ingredient1, quantity1, ingredient2, quantity2, ingredient3, quantity3
      FROM blue_prints
      WHERE index_name = $1
    `;
    const blueprint = await this.userRepository.query(blueprintQuery, [targetItem]);

    if (blueprint.length === 0) {
      throw new Error(`No blueprint found for ${targetItem}`);
    }

    const requiredItems = {};
    for (let i = 1; i <= 3; i++) {
      const ingredient = blueprint[0][`ingredient${i}`];
      const quantity = blueprint[0][`quantity${i}`];
      if (ingredient) {
        requiredItems[ingredient] = quantity;
      }
    }

    for (const [itemName, quantity] of Object.entries(requiredItems)) {
      await this.downloadItem(steamId, itemName, quantity as number);
    }

    await this.uploadItem(steamId, targetItem, 1);
    return { message: `Upgraded to ${targetItem}` };
  }

  // 블루프린트 조회
  async getBlueprints(): Promise<any> {
    this.logger.log(`Fetching blueprints`);
    const query = `
      SELECT * FROM blue_prints
    `;
    const blueprints = await this.userRepository.query(query);

    return blueprints.map((bp) => {
      const ingredients = {};
      for (let i = 1; i <= 5; i++) {
        const ingredient = bp[`ingredient${i}`];
        const quantity = bp[`quantity${i}`];
        if (ingredient) {
          ingredients[ingredient] = quantity;
        }
      }
      return { indexName: bp.index_name, ingredients };
    });
  }

  // items 테이블 업데이트
  async updateItems(itemList: any[]): Promise<any> {
    this.logger.log(`Updating items: ${JSON.stringify(itemList)}`);

    const query = `
      INSERT INTO items (index_name, display_name, description, icons, category)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (index_name)
      DO UPDATE SET
        display_name = EXCLUDED.display_name,
        description = EXCLUDED.description,
        icons = EXCLUDED.icons,
        category = EXCLUDED.category
    `;

    for (const item of itemList) {
      const values = [
        item.Id,
        item.DisplayName,
        item.Description,
        JSON.stringify(item.Icons || []),
        this.determineCategory(item.Id),
      ];
      await this.userRepository.query(query, values);
    }

    return { message: 'Items updated successfully' };
  }

  // 카테고리 결정
  private determineCategory(itemId: string): string {
    const prefix = itemId.split('/')[0];
    switch (prefix) {
      case 'MyObjectBuilder_PhysicalGunObject':
      case 'MyObjectBuilder_Component':
        return 'Component';
      case 'MyObjectBuilder_Ingot':
        return 'Ingot';
      case 'MyObjectBuilder_Ore':
        return 'Ore';
      default:
        return 'Unknown';
    }
  }
}