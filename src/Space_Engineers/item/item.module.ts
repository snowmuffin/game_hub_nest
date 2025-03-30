import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@entities/user.entity';
import { JwtModule } from '@nestjs/jwt'; // JwtModule 추가

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret', // JWT 비밀 키
      signOptions: { expiresIn: '1h' }, // 토큰 유효 기간
    }),
  ],
  controllers: [ItemController],
  providers: [ItemService],
})
export class ItemModule {}