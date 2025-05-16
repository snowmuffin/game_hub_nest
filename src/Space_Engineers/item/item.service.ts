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
  async getItems(userId: string): Promise<any> {
    if (!userId) {
      throw new Error('User ID is required.');
    }

    this.logger.log(`Fetching items for User ID: ${userId}`);

    const storageQuery = `
      SELECT id FROM online_storage WHERE id = $1
    `;
    const storageResults = await this.userRepository.query(storageQuery, [
      userId,
    ]);

    if (storageResults.length === 0) {
      const insertStorageQuery = `
        INSERT INTO online_storage (id) VALUES ($1) RETURNING id
      `;
      const newStorage = await this.userRepository.query(insertStorageQuery, [
        userId,
      ]);
      this.logger.log(`Created new storage for User ID=${userId}`);
      return [];
    }

    const storageId = storageResults[0].id;

    const storageItemsQuery = `
      SELECT osi.item_id, osi.quantity, i.id, i.display_name, i.rarity, i.description, 
             i.category, i.icons, i.index_name
      FROM online_storage_items osi
      INNER JOIN items i ON osi.item_id = i.id
      WHERE osi.storage_id = $1
    `;
    const items = await this.userRepository.query(storageItemsQuery, [
      storageId,
    ]);

    const formattedItems = items.map((item) => ({
      id: item.id,
      displayName: item.display_name,
      rarity: item.rarity,
      description: item.description,
      category: item.category,
      icons: this.extractFileName(item.icons), // 파일명만 추출
      indexName: item.index_name,
      quantity: item.quantity,
    }));

    this.logger.log(
      `Fetched ${formattedItems.length} items for User ID=${userId}`,
    );
    return formattedItems;
  }

  // 아이콘 경로에서 파일명만 추출하는 유틸리티 함수
  private extractFileName(iconPath: any): string {
    if (!iconPath) {
      this.logger.warn('Icon path is empty or undefined.');
      return '';
    }

    try {
      // 배열인 경우 처리
      if (Array.isArray(iconPath)) {
        if (iconPath.length === 0) {
          this.logger.warn('Icon path array is empty.');
          return '';
        }

        // 배열의 첫 번째 요소에서 파일명 추출
        const normalizedPath = iconPath[0].replace(/\\/g, '/');
        const fileName = normalizedPath.split('/').pop();
        return fileName || '';
      }

      // 문자열인 경우 처리
      if (typeof iconPath === 'string') {
        const normalizedPath = iconPath.replace(/\\/g, '/');
        const fileName = normalizedPath.split('/').pop();
        return fileName || '';
      }

      // 예상치 못한 데이터 타입 처리
      this.logger.warn(
        `Invalid icon path type: ${typeof iconPath}. Expected a string or array.`,
      );
      return '';
    } catch (error) {
      this.logger.warn(
        `Failed to parse or extract file name from icon path: ${JSON.stringify(iconPath)}. Error: ${error.message}`,
      );
      return '';
    }
  }

  // 아이템 업로드
  async uploadItem(
    userId: string,
    identifier: string,
    quantity: number,
  ): Promise<any> {
    this.logger.log(
      `Uploading item: User ID=${userId}, Identifier=${identifier}, Quantity=${quantity}`,
    );

    if (!identifier) {
      this.logger.error(
        `Failed to upload item: Identifier is missing. User ID=${userId}, Quantity=${quantity}`,
      );
      throw new Error('Identifier (itemName or itemId) is required.');
    }

    try {
      // Step 1: Ensure steam_id exists in online_storage
      const storageCheckQuery = `
        SELECT id FROM online_storage WHERE steam_id = $1
      `;
      const storageExists = await this.userRepository.query(storageCheckQuery, [
        userId,
      ]);

      if (storageExists.length === 0) {
        const insertStorageQuery = `
          INSERT INTO online_storage (steam_id) VALUES ($1)
        `;
        await this.userRepository.query(insertStorageQuery, [userId]);
        this.logger.log(`Created new storage for Steam ID=${userId}`);
      }

      // Step 2: Check if the item exists
      const isIndexName = identifier.includes('/');
      const columnName = isIndexName ? 'index_name' : 'id';

      const itemCheckQuery = `
        SELECT * FROM items
        WHERE ${columnName} = $1
      `;
      const itemExists = await this.userRepository.query(itemCheckQuery, [
        identifier,
      ]);

      if (itemExists.length === 0) {
        this.logger.error(
          `Item not found: ${columnName}="${identifier}". Steam ID=${userId}`,
        );
        throw new Error(
          `Item with ${columnName} "${identifier}" does not exist in the items table.`,
        );
      }

      // Step 3: Check for conflicts and update or insert
      const conflictCheckQuery = `
        SELECT * FROM online_storage_items
        WHERE storage_id = (SELECT id FROM online_storage WHERE steam_id = $1)
          AND item_id = (SELECT id FROM items WHERE ${columnName} = $2)
      `;
      const existingRecord = await this.userRepository.query(
        conflictCheckQuery,
        [userId, identifier],
      );

      if (existingRecord.length > 0) {
        const updateQuery = `
          UPDATE online_storage_items
          SET quantity = quantity + $3
          WHERE storage_id = (SELECT id FROM online_storage WHERE steam_id = $1)
            AND item_id = (SELECT id FROM items WHERE ${columnName} = $2)
        `;
        await this.userRepository.query(updateQuery, [
          userId,
          identifier,
          quantity,
        ]);
      } else {
        const insertQuery = `
          INSERT INTO online_storage_items (storage_id, item_id, quantity)
          VALUES (
            (SELECT id FROM online_storage WHERE steam_id = $1),
            (SELECT id FROM items WHERE ${columnName} = $2),
            $3
          )
        `;
        await this.userRepository.query(insertQuery, [
          userId,
          identifier,
          quantity,
        ]);
      }

      this.logger.log(
        `Successfully uploaded ${quantity}x '${identifier}' for Steam ID=${userId}`,
      );
      return { message: `${quantity}x '${identifier}' added to storage.` };
    } catch (error) {
      this.logger.error(`Error uploading item: ${error.message}`, error.stack);
      throw error;
    }
  }

  // 아이템 다운로드
  async downloadItem(
    steamId: string,
    itemName: string,
    quantity: number,
  ): Promise<any> {
    this.logger.log(
      `Downloading item: Steam ID=${steamId}, Item=${itemName}, Quantity=${quantity}`,
    );
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
    this.logger.log(
      `Upgrading item: Steam ID=${steamId}, Target Item=${targetItem}`,
    );
    const blueprintQuery = `
      SELECT ingredient1, quantity1, ingredient2, quantity2, ingredient3, quantity3
      FROM blue_prints
      WHERE index_name = $1
    `;
    const blueprint = await this.userRepository.query(blueprintQuery, [
      targetItem,
    ]);

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

    // Step 1: Check if the 'items' table exists
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM spaceengineers 
        WHERE table_name = 'items'
      )
    `;
    const tableExistsResult = await this.userRepository.query(tableCheckQuery);
    const tableExists = tableExistsResult[0]?.exists;

    // Step 2: Create the table if it does not exist
    if (!tableExists) {
      this.logger.warn(`'items' table does not exist. Creating the table...`);
      const createTableQuery = `
        CREATE TABLE items (
          id SERIAL PRIMARY KEY,
          display_name TEXT NOT NULL,
          rarity TEXT,
          description TEXT,
          category TEXT,
          icons JSONB,
          index_name TEXT UNIQUE NOT NULL
        )
      `;
      await this.userRepository.query(createTableQuery);
      this.logger.log(`'items' table created successfully.`);
    }

    // Step 3: Insert or update items
    const query = `
      INSERT INTO items (display_name, rarity, description, category, icons, index_name)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (index_name)
      DO UPDATE SET
        display_name = EXCLUDED.display_name,
        rarity = EXCLUDED.rarity,
        description = EXCLUDED.description,
        category = EXCLUDED.category,
        icons = EXCLUDED.icons
    `;

    for (const item of itemList) {
      if (!item.DisplayName || !item.Id) {
        this.logger.error(`Invalid item data: ${JSON.stringify(item)}`);
        throw new Error('Each item must have a DisplayName and Id.');
      }

      const mappedItem = {
        displayName: item.DisplayName,
        rarity: item.Rarity || null,
        description: item.Description || null,
        category: item.Category || this.determineCategory(item.Id), // 카테고리 결정
        icons: item.Icons || [],
        indexName: item.Id,
      };

      const values = [
        mappedItem.displayName,
        mappedItem.rarity,
        mappedItem.description,
        mappedItem.category,
        JSON.stringify(mappedItem.icons),
        mappedItem.indexName,
      ];

      this.logger.log(`Executing query: ${query}`);
      this.logger.log(`With values: ${JSON.stringify(values)}`);
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
      case 'MyObjectBuilder_AmmoMagazine': // 추가된 처리
        return 'Ammo';
      default:
        this.logger.warn(`Unknown category prefix: ${prefix}`);
        return 'Unknown';
    }
  }
}
