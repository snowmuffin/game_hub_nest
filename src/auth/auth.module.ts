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
      useFactory: () => {
        const expiresIn = process.env.ACCESS_TOKEN_TTL || '6h';
        return {
          secret: process.env.JWT_SECRET || 'defaultSecret',
          // Default signOptions; actual token lifetimes are set in AuthService
          signOptions: { expiresIn: expiresIn as any },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SteamStrategy],
  exports: [JwtModule, PassportModule, AuthService, UserModule, TypeOrmModule],
})
export class AuthModule {}
