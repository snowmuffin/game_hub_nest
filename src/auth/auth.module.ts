import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt'; // JwtModule 추가
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SteamStrategy } from './steam.strategy';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret', // JWT 비밀 키 설정
      signOptions: { expiresIn: '1h' }, // 토큰 만료 시간 설정
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SteamStrategy],
})
export class AuthModule {}