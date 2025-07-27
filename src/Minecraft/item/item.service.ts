import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';

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
      SELECT id FROM minecraft.online_storage WHERE id = $1
    `;
    const storageResults = await this.userRepository.query(storageQuery, [
      userId,
    ]);

    if (storageResults.length === 0) {
      const insertStorageQuery = `
        INSERT INTO minecraft.online_storage (id) VALUES ($1) RETURNING id
      `;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      FROM minecraft.online_storage_items osi
      INNER JOIN minecraft.items i ON osi.item_id = i.id
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
        SELECT id FROM minecraft.online_storage WHERE minecraft_uuid = $1
      `;
      const storageExists = await this.userRepository.query(storageCheckQuery, [
        userId,
      ]);

      if (storageExists.length === 0) {
        const insertStorageQuery = `
          INSERT INTO minecraft.online_storage (minecraft_uuid) VALUES ($1)
        `;
        await this.userRepository.query(insertStorageQuery, [userId]);
        this.logger.log(`Created new storage for Minecraft UUID=${userId}`);
      }

      const isItemId = identifier.includes(':');
      const columnName = isItemId ? 'item_id' : 'id';

      const itemCheckQuery = `
        SELECT * FROM minecraft.items
        WHERE ${columnName} = $1
      `;
      const itemExists = await this.userRepository.query(itemCheckQuery, [
        identifier,
      ]);

      if (itemExists.length === 0) {
        this.logger.error(
          `Item not found: ${columnName}="${identifier}". Minecraft UUID=${userId}`,
        );
        throw new Error(
          `Item with ${columnName} "${identifier}" does not exist in the items table.`,
        );
      }

      const conflictCheckQuery = `
        SELECT * FROM minecraft.online_storage_items
        WHERE storage_id = (SELECT id FROM minecraft.online_storage WHERE minecraft_uuid = $1)
          AND item_id = (SELECT id FROM minecraft.items WHERE ${columnName} = $2)
      `;
      const existingRecord = await this.userRepository.query(
        conflictCheckQuery,
        [userId, identifier],
      );

      if (existingRecord.length > 0) {
        const updateQuery = `
          UPDATE minecraft.online_storage_items
          SET quantity = quantity + $3
          WHERE storage_id = (SELECT id FROM minecraft.online_storage WHERE minecraft_uuid = $1)
            AND item_id = (SELECT id FROM minecraft.items WHERE ${columnName} = $2)
        `;
        await this.userRepository.query(updateQuery, [
          userId,
          identifier,
          quantity,
        ]);
      } else {
        const insertQuery = `
          INSERT INTO minecraft.online_storage_items (storage_id, item_id, quantity)
          VALUES (
            (SELECT id FROM minecraft.online_storage WHERE minecraft_uuid = $1),
            (SELECT id FROM minecraft.items WHERE ${columnName} = $2),
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
        `Successfully uploaded ${quantity}x '${identifier}' for Minecraft UUID=${userId}`,
      );
      return { message: `${quantity}x '${identifier}' added to storage.` };
    } catch (error) {
      this.logger.error(`Error uploading item: ${error.message}`, error.stack);
      throw error;
    }
  }

  async requestDownloadItem(
    minecraftUuid: string,
    item_id: string,
    quantity: number,
  ): Promise<any> {
    if (!minecraftUuid || !item_id) {
      this.logger.error(
        `requestDownloadItem: minecraftUuid or item_id is undefined. minecraftUuid=${minecraftUuid}, item_id=${item_id}`,
      );
      throw new Error('minecraftUuid and item_id are required.');
    }
    this.logger.log(
      `Requesting download: Minecraft UUID=${minecraftUuid}, Item=${item_id}, Quantity=${quantity}`,
    );

    try {
      await this.userRepository.query(`
        CREATE TABLE IF NOT EXISTS minecraft.item_download_log (
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
      `SELECT id AS storage_id FROM minecraft.online_storage WHERE minecraft_uuid = $1`,
      [minecraftUuid],
    );
    if (!userResult.length) {
      throw new Error(`User with minecraft_uuid "${minecraftUuid}" not found.`);
    }
    const storageId = userResult[0].storage_id;

    const itemIdResult = await this.userRepository.query(
      `SELECT id FROM minecraft.items WHERE item_id = $1`,
      [item_id],
    );
    if (!itemIdResult.length) {
      throw new Error(`Item with item_id "${item_id}" not found.`);
    }
    const itemDbId = itemIdResult[0].id;

    const currentQtyResult = await this.userRepository.query(
      `SELECT quantity FROM minecraft.online_storage_items WHERE storage_id = $1 AND item_id = $2`,
      [storageId, itemDbId],
    );
    const currentQty =
      currentQtyResult.length > 0 ? Number(currentQtyResult[0].quantity) : 0;
    if (quantity > currentQty) {
      this.logger.warn(
        `Download request exceeds available quantity: requested=${quantity}, available=${currentQty}, minecraftUuid=${minecraftUuid}, item=${item_id}`,
      );
      throw new Error(
        `Not enough items in storage. Requested: ${quantity}, Available: ${currentQty}`,
      );
    }

    await this.userRepository.query(
      `INSERT INTO minecraft.item_download_log (storage_id, item_id, quantity, status) VALUES ($1, $2, $3, 'PENDING')`,
      [storageId, itemDbId, quantity],
    );

    return {
      success: true,
      data: {
        storageId,
        itemId: itemDbId,
        itemIdString: item_id,
        requested: quantity,
        status: 'PENDING',
      },
      message: `Download request for ${quantity}x '${item_id}' is pending confirmation.`,
      timestamp: new Date().toISOString(),
    };
  }

  async confirmDownloadItem(
    minecraftUuid: string,
    item_id: string,
    quantity: number,
  ): Promise<any> {
    this.logger.log(
      `Confirming download: Minecraft UUID=${minecraftUuid}, Item=${item_id}, Quantity=${quantity}`,
    );

    const userResult = await this.userRepository.query(
      `SELECT id AS storage_id FROM minecraft.online_storage WHERE minecraft_uuid = $1`,
      [minecraftUuid],
    );
    if (!userResult.length) {
      throw new Error(`User with minecraft_uuid "${minecraftUuid}" not found.`);
    }
    const storageId = userResult[0].storage_id;

    const itemIdResult = await this.userRepository.query(
      `SELECT id FROM minecraft.items WHERE item_id = $1`,
      [item_id],
    );
    if (!itemIdResult.length) {
      throw new Error(`Item with item_id "${item_id}" not found.`);
    }
    const itemDbId = itemIdResult[0].id;

    await this.userRepository.query(
      `UPDATE minecraft.online_storage_items SET quantity = quantity - $1 WHERE storage_id = $2 AND item_id = $3`,
      [quantity, storageId, itemDbId],
    );

    await this.userRepository.query(
      `UPDATE minecraft.item_download_log SET status = 'CONFIRMED' WHERE storage_id = $1 AND item_id = $2 AND status = 'PENDING'`,
      [storageId, itemDbId],
    );

    const remainResult = await this.userRepository.query(
      `SELECT quantity FROM minecraft.online_storage_items WHERE storage_id = $1 AND item_id = $2`,
      [storageId, itemDbId],
    );
    const remain = remainResult.length > 0 ? remainResult[0].quantity : 0;

    return {
      success: true,
      data: {
        storageId,
        itemId: itemDbId,
        itemIdString: item_id,
        deducted: quantity,
        remain,
        status: 'CONFIRMED',
      },
      message: `Successfully confirmed and deducted ${quantity}x '${item_id}' from storage.`,
      timestamp: new Date().toISOString(),
    };
  }

  async cancelDownloadItem(
    minecraftUuid: string,
    item_id: string,
    quantity: number,
  ): Promise<any> {
    this.logger.log(
      `Cancelling download: Minecraft UUID=${minecraftUuid}, Item=${item_id}, Quantity=${quantity}`,
    );

    const userResult = await this.userRepository.query(
      `SELECT id AS storage_id FROM minecraft.online_storage WHERE minecraft_uuid = $1`,
      [minecraftUuid],
    );
    if (!userResult.length) {
      throw new Error(`User with minecraft_uuid "${minecraftUuid}" not found.`);
    }
    const storageId = userResult[0].storage_id;

    const itemIdResult = await this.userRepository.query(
      `SELECT id FROM minecraft.items WHERE item_id = $1`,
      [item_id],
    );
    if (!itemIdResult.length) {
      throw new Error(`Item with item_id "${item_id}" not found.`);
    }
    const itemDbId = itemIdResult[0].id;

    await this.userRepository.query(
      `UPDATE minecraft.item_download_log SET status = 'CANCELED' WHERE storage_id = $1 AND item_id = $2 AND status = 'PENDING'`,
      [storageId, itemDbId],
    );

    return {
      success: true,
      data: {
        storageId,
        itemId: itemDbId,
        itemIdString: item_id,
        canceled: quantity,
        status: 'CANCELED',
      },
      message: `Download request for ${quantity}x '${item_id}' has been canceled.`,
      timestamp: new Date().toISOString(),
    };
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

  async getBlueprints(): Promise<any> {
    this.logger.log(`Fetching blueprints`);
    const query = `
      SELECT * FROM minecraft.recipes
    `;
    const recipes = await this.userRepository.query(query);

    return recipes.map((recipe) => {
      const ingredients = {};
      for (let i = 1; i <= 9; i++) {
        const ingredient = recipe[`ingredient${i}`];
        const quantity = recipe[`quantity${i}`];
        if (ingredient) {
          ingredients[ingredient] = quantity;
        }
      }
      return {
        itemId: recipe.result_item_id,
        result_quantity: recipe.result_quantity,
        ingredients,
      };
    });
  }

  async updateItems(itemList: any[]): Promise<any> {
    this.logger.log(`Updating items: ${JSON.stringify(itemList)}`);

    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'minecraft' AND table_name = 'items'
      )
    `;
    const tableExistsResult = await this.userRepository.query(tableCheckQuery);
    const tableExists = tableExistsResult[0]?.exists;

    if (!tableExists) {
      this.logger.warn(`'items' table does not exist. Creating the table...`);
      const createTableQuery = `
        CREATE TABLE minecraft.items (
          id SERIAL PRIMARY KEY,
          item_id TEXT NOT NULL UNIQUE,
          display_name TEXT NOT NULL,
          description TEXT,
          category TEXT,
          max_stack_size INTEGER DEFAULT 64,
          is_block BOOLEAN DEFAULT false,
          durability INTEGER,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `;
      await this.userRepository.query(createTableQuery);
      this.logger.log(`'items' table created successfully.`);
    }

    const query = `
      INSERT INTO minecraft.items (item_id, display_name, description, category, max_stack_size, is_block, durability, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT (item_id)
      DO UPDATE SET
        display_name = EXCLUDED.display_name,
        description = EXCLUDED.description,
        category = EXCLUDED.category,
        max_stack_size = EXCLUDED.max_stack_size,
        is_block = EXCLUDED.is_block,
        durability = EXCLUDED.durability,
        updated_at = NOW()
    `;

    for (const item of itemList) {
      if (!item.itemId || !item.displayName) {
        this.logger.warn(`Skipping item (invalid): ${JSON.stringify(item)}`);
        continue;
      }

      const values = [
        item.itemId,
        item.displayName,
        item.description || null,
        item.category || 'misc',
        item.maxStackSize || 64,
        item.isBlock || false,
        item.durability || null,
      ];

      this.logger.log(`Executing query: ${query}`);
      this.logger.log(`With values: ${JSON.stringify(values)}`);
      await this.userRepository.query(query, values);
    }

    return { message: 'Items updated successfully' };
  }
}
