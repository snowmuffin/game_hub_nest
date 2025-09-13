import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/shared/user.entity';
import {
  SpaceEngineersItem,
  SpaceEngineersOnlineStorage,
  SpaceEngineersOnlineStorageItem,
  SpaceEngineersMarketplaceItem,
  SpaceEngineersItemDownloadLog,
  SpaceEngineersDropTable,
} from 'src/entities/space_engineers';

type RawItem = {
  DisplayName?: unknown;
  Id?: unknown;
  Description?: unknown;
  Category?: unknown;
  Icons?: unknown;
};

@Injectable()
export class ItemService {
  private readonly logger = new Logger(ItemService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SpaceEngineersItem)
    private readonly itemRepository: Repository<SpaceEngineersItem>,
    @InjectRepository(SpaceEngineersOnlineStorage)
    private readonly onlineStorageRepository: Repository<SpaceEngineersOnlineStorage>,
    @InjectRepository(SpaceEngineersOnlineStorageItem)
    private readonly onlineStorageItemRepository: Repository<SpaceEngineersOnlineStorageItem>,
    @InjectRepository(SpaceEngineersMarketplaceItem)
    private readonly marketplaceItemRepository: Repository<SpaceEngineersMarketplaceItem>,
    @InjectRepository(SpaceEngineersItemDownloadLog)
    private readonly itemDownloadLogRepository: Repository<SpaceEngineersItemDownloadLog>,
    @InjectRepository(SpaceEngineersDropTable)
    private readonly dropTableRepository: Repository<SpaceEngineersDropTable>,
  ) {}

  private async resolveSteamId(
    steamIdOrUserId: string | number,
  ): Promise<string> {
    if (typeof steamIdOrUserId === 'number') {
      const user = await this.userRepository.findOne({
        where: { id: steamIdOrUserId },
      });
      if (!user) {
        throw new Error(`User not found for id: ${steamIdOrUserId}`);
      }
      return user.steam_id;
    }
    return steamIdOrUserId;
  }

  async getItems(steamIdOrUserId: string | number): Promise<any[]> {
    const steamId = await this.resolveSteamId(steamIdOrUserId);
    this.logger.log(`Getting items for Steam ID: ${steamId}`);

    // Get user from database
    const user = await this.userRepository.findOne({
      where: { steam_id: steamId },
    });

    if (!user) {
      this.logger.warn(`User not found for Steam ID: ${steamId}`);
      return [];
    }

    // Find or create online storage for the user
    let storage = await this.onlineStorageRepository.findOne({
      where: { steamId: user.steam_id },
    });

    if (!storage) {
      this.logger.log(`Creating new online storage for user ${user.steam_id}`);
      storage = this.onlineStorageRepository.create({
        steamId: user.steam_id,
      });
      await this.onlineStorageRepository.save(storage);
    }

    // Get items with their storage information
    const storageItems = await this.onlineStorageItemRepository.find({
      where: { storageId: storage.id },
      relations: ['item'],
    });

    const formattedItems = storageItems.map((storageItem) => ({
      id: storageItem.item.id,
      displayName: storageItem.item.displayName,
      rarity: storageItem.item.rarity,
      description: storageItem.item.description,
      category: storageItem.item.category,
      icons: this.extractFileName(storageItem.item.icons),
      indexName: storageItem.item.indexName,
      quantity: storageItem.quantity,
    }));

    this.logger.log(
      `Found ${formattedItems.length} items for Steam ID: ${steamId}`,
    );
    return formattedItems;
  }

  private extractFileName(iconPath: unknown): string {
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

        const first = iconPath[0] as unknown;
        if (typeof first !== 'string') {
          this.logger.warn('Icon path array first element is not a string.');
          return '';
        }
        const normalizedPath: string = first.replace(/\\/g, '/');
        const fileName: string | undefined = normalizedPath.split('/').pop();
        return fileName ?? '';
      }

      if (typeof iconPath === 'string') {
        const normalizedPath: string = iconPath.replace(/\\/g, '/');
        const fileName: string | undefined = normalizedPath.split('/').pop();
        return fileName ?? '';
      }

      this.logger.warn(
        `Invalid icon path type: ${typeof iconPath}. Expected a string or array.`,
      );
      return '';
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Failed to parse or extract file name from icon path: ${JSON.stringify(iconPath)}. Error: ${message}`,
      );
      return '';
    }
  }

  async uploadItem(
    steamIdOrUserId: string | number,
    identifier: string,
    quantity: number,
  ): Promise<any> {
    const steamId = await this.resolveSteamId(steamIdOrUserId);
    this.logger.log(
      `Uploading item: Steam ID=${steamId}, Identifier=${identifier}, Quantity=${quantity}`,
    );

    if (!identifier) {
      this.logger.error(
        `Failed to upload item: Identifier is missing. Steam ID=${steamId}, Quantity=${quantity}`,
      );
      throw new Error('Identifier (itemName or itemId) is required.');
    }

    try {
      // Find or create storage
      let storage = await this.onlineStorageRepository.findOne({
        where: { steamId },
      });

      if (!storage) {
        this.logger.log(`Creating new storage for Steam ID=${steamId}`);
        storage = this.onlineStorageRepository.create({ steamId });
        await this.onlineStorageRepository.save(storage);
      }

      // Find item by index_name or id
      const isIndexName = identifier.includes('/');
      const item = await this.itemRepository.findOne({
        where: isIndexName
          ? { indexName: identifier }
          : { id: parseInt(identifier) },
      });

      if (!item) {
        this.logger.error(
          `Item not found: ${isIndexName ? 'index_name' : 'id'}="${identifier}". Steam ID=${steamId}`,
        );
        throw new Error(
          `Item with ${isIndexName ? 'index_name' : 'id'} "${identifier}" does not exist in the items table.`,
        );
      }

      // Check if item already exists in storage
      let storageItem = await this.onlineStorageItemRepository.findOne({
        where: { storageId: storage.id, itemId: item.id },
      });

      if (storageItem) {
        // Update existing quantity
        storageItem.quantity += quantity;
        await this.onlineStorageItemRepository.save(storageItem);
      } else {
        // Create new storage item
        storageItem = this.onlineStorageItemRepository.create({
          storageId: storage.id,
          itemId: item.id,
          quantity,
        });
        await this.onlineStorageItemRepository.save(storageItem);
      }

      this.logger.log(
        `Successfully uploaded ${quantity}x '${identifier}' for Steam ID=${steamId}`,
      );
      return { message: `${quantity}x '${identifier}' added to storage.` };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error uploading item: ${message}`, stack);
      throw error instanceof Error ? error : new Error(message);
    }
  }

  async requestDownloadItem(
    steamId: string,
    indexName: string,
    quantity: number,
  ): Promise<any> {
    if (!steamId || !indexName) {
      this.logger.error(
        `requestDownloadItem: steamId or indexName is undefined. steamId=${steamId}, indexName=${indexName}`,
      );
      throw new Error('steamId and indexName are required.');
    }
    this.logger.log(
      `Requesting download: Steam ID=${steamId}, Item=${indexName}, Quantity=${quantity}`,
    );

    try {
      // Find storage
      const storage = await this.onlineStorageRepository.findOne({
        where: { steamId },
      });
      if (!storage) {
        throw new Error(`User with steamId "${steamId}" not found.`);
      }

      // Find item
      const item = await this.itemRepository.findOne({
        where: { indexName },
      });
      if (!item) {
        throw new Error(`Item with indexName "${indexName}" not found.`);
      }

      // Check current quantity in storage
      const storageItem = await this.onlineStorageItemRepository.findOne({
        where: { storageId: storage.id, itemId: item.id },
      });
      const currentQty = storageItem ? storageItem.quantity : 0;

      if (quantity > currentQty) {
        this.logger.warn(
          `Download request exceeds available quantity: requested=${quantity}, available=${currentQty}, steamId=${steamId}, item=${indexName}`,
        );
        throw new Error(
          `Not enough items in storage. Requested: ${quantity}, Available: ${currentQty}`,
        );
      }

      // Create download log
      const downloadLog = this.itemDownloadLogRepository.create({
        storageId: storage.id,
        itemId: item.id,
        quantity,
        status: 'PENDING',
      });
      await this.itemDownloadLogRepository.save(downloadLog);

      return {
        success: true,
        data: {
          storageId: storage.id,
          itemId: item.id,
          indexName,
          requested: quantity,
          status: 'PENDING',
        },
        message: `Download request for ${quantity}x '${indexName}' is pending confirmation.`,
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error requesting download: ${message}`, stack);
      throw error instanceof Error ? error : new Error(message);
    }
  }

  async confirmDownloadItem(
    steamId: string,
    indexName: string,
    quantity: number,
  ): Promise<any> {
    this.logger.log(
      `Confirming download: Steam ID=${steamId}, Item=${indexName}, Quantity=${quantity}`,
    );

    try {
      // Find storage
      const storage = await this.onlineStorageRepository.findOne({
        where: { steamId },
      });
      if (!storage) {
        throw new Error(`User with steamId "${steamId}" not found.`);
      }

      // Find item
      const item = await this.itemRepository.findOne({
        where: { indexName },
      });
      if (!item) {
        throw new Error(`Item with indexName "${indexName}" not found.`);
      }

      // Update storage item quantity
      const storageItem = await this.onlineStorageItemRepository.findOne({
        where: { storageId: storage.id, itemId: item.id },
      });

      if (storageItem) {
        storageItem.quantity -= quantity;
        await this.onlineStorageItemRepository.save(storageItem);
      }

      // Update download log status
      await this.itemDownloadLogRepository.update(
        { storageId: storage.id, itemId: item.id, status: 'PENDING' },
        { status: 'CONFIRMED' },
      );

      const remainingQuantity = storageItem ? storageItem.quantity : 0;

      return {
        success: true,
        data: {
          storageId: storage.id,
          itemId: item.id,
          indexName,
          deducted: quantity,
          remain: remainingQuantity,
          status: 'CONFIRMED',
        },
        message: `Successfully confirmed and deducted ${quantity}x '${indexName}' from storage.`,
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error confirming download: ${message}`, stack);
      throw error instanceof Error ? error : new Error(message);
    }
  }

  async cancelDownloadItem(
    steamId: string,
    indexName: string,
    quantity: number,
  ): Promise<any> {
    this.logger.log(
      `Cancelling download: Steam ID=${steamId}, Item=${indexName}, Quantity=${quantity}`,
    );

    try {
      // Find storage
      const storage = await this.onlineStorageRepository.findOne({
        where: { steamId },
      });
      if (!storage) {
        throw new Error(`User with steamId "${steamId}" not found.`);
      }

      // Find item
      const item = await this.itemRepository.findOne({
        where: { indexName },
      });
      if (!item) {
        throw new Error(`Item with indexName "${indexName}" not found.`);
      }

      // Update download log status
      await this.itemDownloadLogRepository.update(
        { storageId: storage.id, itemId: item.id, status: 'PENDING' },
        { status: 'CANCELED' },
      );

      return {
        success: true,
        data: {
          storageId: storage.id,
          itemId: item.id,
          indexName,
          canceled: quantity,
          status: 'CANCELED',
        },
        message: `Download request for ${quantity}x '${indexName}' has been canceled.`,
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error canceling download: ${message}`, stack);
      throw error instanceof Error ? error : new Error(message);
    }
  }

  async upgradeItem(
    steamIdOrUserId: string | number,
    targetItem: string,
  ): Promise<any> {
    const steamId = await this.resolveSteamId(steamIdOrUserId);
    this.logger.log(
      `Upgrading item: Steam ID=${steamId}, Target Item=${targetItem}`,
    );

    // Note: This method requires a blueprints table/entity that doesn't exist yet
    // TODO: Implement blueprint system with proper entities
    throw new Error(
      'Blueprint system not yet implemented with TypeORM entities',
    );
  }

  getBlueprints(): any {
    this.logger.log(`Fetching blueprints`);

    // Note: This method requires a blueprints table/entity that doesn't exist yet
    // TODO: Implement blueprint system with proper entities
    throw new Error(
      'Blueprint system not yet implemented with TypeORM entities',
    );
  }

  async updateItems(itemList: RawItem[]): Promise<any> {
    this.logger.log(`Updating items: ${JSON.stringify(itemList)}`);

    for (const item of itemList) {
      const displayName =
        typeof item.DisplayName === 'string' ? item.DisplayName : undefined;
      const id = typeof item.Id === 'string' ? item.Id : undefined;
      const description =
        typeof item.Description === 'string' ? item.Description : undefined;
      const category =
        typeof item.Category === 'string' ? item.Category : undefined;
      const icons = Array.isArray(item.Icons)
        ? item.Icons.filter((v): v is string => typeof v === 'string')
        : undefined;

      if (!displayName || !id || id.includes('MyObjectBuilder_TreeObject')) {
        this.logger.warn(
          `Skipping item (invalid or excluded): ${JSON.stringify(item)}`,
        );
        continue;
      }

      type MappedItem = {
        displayName: string;
        rarity: number;
        description?: string;
        category?: string;
        icons: string[];
        indexName: string;
      };

      const mappedItem: MappedItem = {
        displayName,
        rarity: 1,
        description: description ?? undefined,
        category: category ?? this.determineCategory(id),
        icons: icons ?? [],
        indexName: id,
      };

      try {
        // Try to find existing item
        const existingItem = await this.itemRepository.findOne({
          where: { indexName: mappedItem.indexName },
        });

        if (existingItem) {
          // Update existing item
          existingItem.displayName = mappedItem.displayName;
          existingItem.rarity = mappedItem.rarity;
          if (mappedItem.description !== undefined) {
            existingItem.description = mappedItem.description;
          }
          if (mappedItem.category !== undefined) {
            existingItem.category = mappedItem.category;
          }
          existingItem.icons = mappedItem.icons;
          await this.itemRepository.save(existingItem);
        } else {
          // Create new item
          const newItem = this.itemRepository.create(
            mappedItem as unknown as Partial<SpaceEngineersItem>,
          );
          await this.itemRepository.save(newItem);
        }

        this.logger.log(`Successfully processed item: ${mappedItem.indexName}`);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Failed to process item ${mappedItem.indexName}: ${message}`,
        );
        continue;
      }
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
