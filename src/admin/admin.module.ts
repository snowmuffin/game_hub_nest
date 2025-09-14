import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminUserService } from './admin-user.service';
import { User } from '../entities/shared/user.entity';
import { SpaceEngineersOnlineStorage } from '../entities/space_engineers/online-storage.entity';
import { SpaceEngineersOnlineStorageItem } from '../entities/space_engineers/online-storage-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      SpaceEngineersOnlineStorage,
      SpaceEngineersOnlineStorageItem,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminUserService],
  exports: [AdminUserService],
})
export class AdminModule {}
