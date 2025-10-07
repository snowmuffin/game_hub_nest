import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SteamStrategy } from './steam.strategy';
import { User } from '../entities/shared/user.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User]),
    UserModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'defaultSecret',
        // Default signOptions; actual token lifetimes are set in AuthService
        signOptions: { expiresIn: process.env.ACCESS_TOKEN_TTL || '6h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SteamStrategy],
})
export class AuthModule {}
