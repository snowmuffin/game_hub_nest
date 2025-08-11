import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ValheimCharacterController } from './valheim-character.controller';
import { ValheimCharacterService } from './valheim-character.service';
import { ValheimCharacter } from './valheim-character.entity';
import { User } from '../../entities/user.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([ValheimCharacter, User]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'defaultSecret',
        signOptions: { expiresIn: '6h' },
      }),
    }),
    ConfigModule,
  ],
  controllers: [ValheimCharacterController],
  providers: [ValheimCharacterService, JwtAuthGuard],
  exports: [ValheimCharacterService],
})
export class ValheimCharacterModule {}
