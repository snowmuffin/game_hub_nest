import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ValheimCharacterController } from './valheim-character.controller';
import { ValheimCharacterService } from './valheim-character.service';
import { ValheimCharacter } from './valheim-character.entity';
import { User } from '../../user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ValheimCharacter, User]),
    JwtModule,
    ConfigModule,
  ],
  controllers: [ValheimCharacterController],
  providers: [ValheimCharacterService],
  exports: [ValheimCharacterService],
})
export class ValheimCharacterModule {}
