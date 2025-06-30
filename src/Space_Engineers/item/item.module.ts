import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { DropTableService } from './drop-table.service';
import { DropTableController } from './drop-table.controller';
import { DropTestController } from './drop-test.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { DropTable } from './drop-table.entity';
import { JwtModule } from '@nestjs/jwt'; // JwtModule 추가

@Module({
  imports: [
    TypeOrmModule.forFeature([User, DropTable]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret', // JWT 비밀 키
      signOptions: { expiresIn: '1h' }, // 토큰 유효 기간
    }),
  ],
  controllers: [ItemController, DropTableController, DropTestController],
  providers: [ItemService, DropTableService],
  exports: [DropTableService],
})
export class ItemModule {}
