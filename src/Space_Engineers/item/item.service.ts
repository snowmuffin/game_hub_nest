import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/shared/user.entity';

@Injectable()
export class ItemService {
  private readonly logger = new Logger(ItemService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getItems(userId: string): Promise<any> {
    if (!userId) {
      throw new Error('User ID is required.');
    }

    this.logger.log(`Fetching items for User ID: ${userId}`);

    const storageQuery = `
      SELECT id FROM space_engineers.online_storage WHERE id = $1
    `;
    const storageResults = await this.userRepository.query(storageQuery, [
      userId,
    ]);

    if (storageResults.length === 0) {
      const insertStorageQuery = `
        INSERT INTO space_engineers.online_storage (id) VALUES ($1) RETURNING id
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
      FROM space_engineers.online_storage_items osi
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
      icons: this.extractFileName(item.icons),
      indexName: item.index_name,
      quantity: item.quantity,
    }));

    this.logger.log(
      `Fetched ${formattedItems.length} items for User ID=${userId}`,
    );
    return formattedItems;
  }

  private extractFileName(iconPath: any): string {
    if (!iconPath) {
      this.logger.warn('Icon path is empty or undefined.');
      return '';
    }

    try {
      if (Array.isArray(iconPath)) {
        if (iconPath.length === 0) {
          this.logger.warn('Icon path array is empty.');
          return '';
        }

        const normalizedPath = iconPath[0].replace(/\\/g, '/');
        const fileName = normalizedPath.split('/').pop();
        return fileName || '';
      }

      if (typeof iconPath === 'string') {
        const normalizedPath = iconPath.replace(/\\/g, '/');
        const fileName = normalizedPath.split('/').pop();
        return fileName || '';
      }

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
      const storageCheckQuery = `
        SELECT id FROM space_engineers.online_storage WHERE steam_id = $1
      `;
      const storageExists = await this.userRepository.query(storageCheckQuery, [
        userId,
      ]);

      if (storageExists.length === 0) {
        const insertStorageQuery = `
          INSERT INTO space_engineers.online_storage (steam_id) VALUES ($1)
        `;
        await this.userRepository.query(insertStorageQuery, [userId]);
        this.logger.log(`Created new storage for Steam ID=${userId}`);
      }

      const isIndexName = identifier.includes('/');
      const columnName = isIndexName ? 'index_name' : 'id';

      const itemCheckQuery = `
        SELECT * FROM space_engineers.items
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

      const conflictCheckQuery = `
        SELECT * FROM space_engineers.online_storage_items
        WHERE storage_id = (SELECT id FROM space_engineers.online_storage WHERE steam_id = $1)
          AND item_id = (SELECT id FROM space_engineers.items WHERE ${columnName} = $2)
      `;
      const existingRecord = await this.userRepository.query(
        conflictCheckQuery,
        [userId, identifier],
      );

      if (existingRecord.length > 0) {
        const updateQuery = `
          UPDATE space_engineers.space_engineers.online_storage_items
          SET quantity = quantity + $3
          WHERE storage_id = (SELECT id FROM space_engineers.online_storage WHERE steam_id = $1)
            AND item_id = (SELECT id FROM space_engineers.items WHERE ${columnName} = $2)
        `;
        await this.userRepository.query(updateQuery, [
          userId,
          identifier,
          quantity,
        ]);
      } else {
        const insertQuery = `
          INSERT INTO space_engineers.space_engineers.online_storage_items (storage_id, item_id, quantity)
          VALUES (
            (SELECT id FROM space_engineers.online_storage WHERE steam_id = $1),
            (SELECT id FROM space_engineers.items WHERE ${columnName} = $2),
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

  async requestDownloadItem(
    steamid: string,
    index_name: string,
    quantity: number,
  ): Promise<any> {
    if (!steamid || !index_name) {
      this.logger.error(
        `requestDownloadItem: steamid or index_name is undefined. steamid=${steamid}, index_name=${index_name}`,
      );
      throw new Error('steamid and index_name are required.');
    }
    this.logger.log(
      `Requesting download: Steam ID=${steamid}, Item=${index_name}, Quantity=${quantity}`,
    );

    try {
      await this.userRepository.query(`
        CREATE TABLE IF NOT EXISTS item_download_log (
          id SERIAL PRIMARY KEY,
          storage_id INTEGER NOT NULL,
          item_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          status TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
    } catch (e) {
      this.logger.error(
        `Failed to create 'item_download_log' table: ${e.message}`,
      );
      throw e;
    }

    const userResult = await this.userRepository.query(
      `SELECT id AS storage_id FROM space_engineers.online_storage WHERE steam_id = $1`,
      [steamid],
    );
    if (!userResult.length) {
      throw new Error(`User with steam_id "${steamid}" not found.`);
    }
    const storageId = userResult[0].storage_id;

    const itemIdResult = await this.userRepository.query(
      `SELECT id FROM space_engineers.items WHERE index_name = $1`,
      [index_name],
    );
    if (!itemIdResult.length) {
      throw new Error(`Item with index_name "${index_name}" not found.`);
    }
    const itemId = itemIdResult[0].id;

    const currentQtyResult = await this.userRepository.query(
      `SELECT quantity FROM space_engineers.online_storage_items WHERE storage_id = $1 AND item_id = $2`,
      [storageId, itemId],
    );
    const currentQty =
      currentQtyResult.length > 0 ? Number(currentQtyResult[0].quantity) : 0;
    if (quantity > currentQty) {
      this.logger.warn(
        `Download request exceeds available quantity: requested=${quantity}, available=${currentQty}, steamid=${steamid}, item=${index_name}`,
      );
      throw new Error(
        `Not enough items in storage. Requested: ${quantity}, Available: ${currentQty}`,
      );
    }

    await this.userRepository.query(
      `INSERT INTO item_download_log (storage_id, item_id, quantity, status) VALUES ($1, $2, $3, 'PENDING')`,
      [storageId, itemId, quantity],
    );

    return {
      success: true,
      data: {
        storageId,
        itemId,
        indexName: index_name,
        requested: quantity,
        status: 'PENDING',
      },
      message: `Download request for ${quantity}x '${index_name}' is pending confirmation.`,
      timestamp: new Date().toISOString(),
    };
  }

  async confirmDownloadItem(
    steamid: string,
    index_name: string,
    quantity: number,
  ): Promise<any> {
    this.logger.log(
      `Confirming download: Steam ID=${steamid}, Item=${index_name}, Quantity=${quantity}`,
    );

    const userResult = await this.userRepository.query(
      `SELECT id AS storage_id FROM space_engineers.online_storage WHERE steam_id = $1`,
      [steamid],
    );
    if (!userResult.length) {
      throw new Error(`User with steam_id "${steamid}" not found.`);
    }
    const storageId = userResult[0].storage_id;

    const itemIdResult = await this.userRepository.query(
      `SELECT id FROM space_engineers.items WHERE index_name = $1`,
      [index_name],
    );
    if (!itemIdResult.length) {
      throw new Error(`Item with index_name "${index_name}" not found.`);
    }
    const itemId = itemIdResult[0].id;

    await this.userRepository.query(
      `UPDATE space_engineers.space_engineers.online_storage_items SET quantity = quantity - $1 WHERE storage_id = $2 AND item_id = $3`,
      [quantity, storageId, itemId],
    );

    await this.userRepository.query(
      `UPDATE item_download_log SET status = 'CONFIRMED' WHERE storage_id = $1 AND item_id = $2 AND status = 'PENDING'`,
      [storageId, itemId],
    );

    const remainResult = await this.userRepository.query(
      `SELECT quantity FROM space_engineers.online_storage_items WHERE storage_id = $1 AND item_id = $2`,
      [storageId, itemId],
    );
    const remain = remainResult.length > 0 ? remainResult[0].quantity : 0;

    return {
      success: true,
      data: {
        storageId,
        itemId,
        indexName: index_name,
        deducted: quantity,
        remain,
        status: 'CONFIRMED',
      },
      message: `Successfully confirmed and deducted ${quantity}x '${index_name}' from storage.`,
      timestamp: new Date().toISOString(),
    };
  }

  async cancelDownloadItem(
    steamid: string,
    index_name: string,
    quantity: number,
  ): Promise<any> {
    this.logger.log(
      `Cancelling download: Steam ID=${steamid}, Item=${index_name}, Quantity=${quantity}`,
    );

    const userResult = await this.userRepository.query(
      `SELECT id AS storage_id FROM space_engineers.online_storage WHERE steam_id = $1`,
      [steamid],
    );
    if (!userResult.length) {
      throw new Error(`User with steam_id "${steamid}" not found.`);
    }
    const storageId = userResult[0].storage_id;

    const itemIdResult = await this.userRepository.query(
      `SELECT id FROM space_engineers.items WHERE index_name = $1`,
      [index_name],
    );
    if (!itemIdResult.length) {
      throw new Error(`Item with index_name "${index_name}" not found.`);
    }
    const itemId = itemIdResult[0].id;

    await this.userRepository.query(
      `UPDATE item_download_log SET status = 'CANCELED' WHERE storage_id = $1 AND item_id = $2 AND status = 'PENDING'`,
      [storageId, itemId],
    );

    return {
      success: true,
      data: {
        storageId,
        itemId,
        indexName: index_name,
        canceled: quantity,
        status: 'CANCELED',
      },
      message: `Download request for ${quantity}x '${index_name}' has been canceled.`,
      timestamp: new Date().toISOString(),
    };
  }

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
      await this.requestDownloadItem(steamId, itemName, quantity as number);
    }

    await this.uploadItem(steamId, targetItem, 1);
    return { message: `Upgraded to ${targetItem}` };
  }

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

  async updateItems(itemList: any[]): Promise<any> {
    this.logger.log(`Updating items: ${JSON.stringify(itemList)}`);

    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'items'
      )
    `;
    const tableExistsResult = await this.userRepository.query(tableCheckQuery);
    const tableExists = tableExistsResult[0]?.exists;

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
          index_name TEXT NOT NULL UNIQUE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `;
      await this.userRepository.query(createTableQuery);
      this.logger.log(`'items' table created successfully.`);
    } else {
      const uniqueConstraintCheckQuery = `
        SELECT COUNT(*) AS count
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu
          ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_schema = 'public'
          AND tc.table_name = 'items'
          AND tc.constraint_type = 'UNIQUE'
          AND ccu.column_name = 'index_name'
      `;
      const uniqueConstraintResult = await this.userRepository.query(
        uniqueConstraintCheckQuery,
      );
      const hasUnique = Number(uniqueConstraintResult[0]?.count) > 0;
      if (!hasUnique) {
        this.logger.warn(`Adding UNIQUE constraint to items.index_name`);
        const addUniqueQuery = `
          ALTER TABLE items
          ADD CONSTRAINT items_index_name_unique UNIQUE (index_name)
        `;
        try {
          await this.userRepository.query(addUniqueQuery);
        } catch (e) {
          this.logger.error(`Failed to add UNIQUE constraint: ${e.message}`);
        }
      }
    }

    const query = `
      INSERT INTO space_engineers.items (display_name, rarity, description, category, icons, index_name, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      ON CONFLICT (index_name)
      DO UPDATE SET
        display_name = EXCLUDED.display_name,
        rarity = EXCLUDED.rarity,
        description = EXCLUDED.description,
        category = EXCLUDED.category,
        icons = EXCLUDED.icons,
        updated_at = NOW()
    `;

    for (const item of itemList) {
      if (
        !item.DisplayName ||
        !item.Id ||
        (typeof item.Id === 'string' &&
          item.Id.includes('MyObjectBuilder_TreeObject'))
      ) {
        this.logger.warn(
          `Skipping item (invalid or excluded): ${JSON.stringify(item)}`,
        );
        continue;
      }

      const mappedItem = {
        displayName: item.DisplayName,
        rarity: '1',
        description: item.Description || null,
        category: item.Category || this.determineCategory(item.Id),
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
      case 'MyObjectBuilder_AmmoMagazine':
        return 'Ammo';
      default:
        this.logger.warn(`Unknown category prefix: ${prefix}`);
        return 'Unknown';
    }
  }
}
