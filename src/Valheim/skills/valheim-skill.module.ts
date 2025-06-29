import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ValheimCharacterSkill } from './valheim-skill.entity';
import { ValheimSkillService } from './valheim-skill.service';
import { ValheimSkillController } from './valheim-skill.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ValheimCharacterSkill]),
    JwtModule,
    ConfigModule,
  ],
  controllers: [ValheimSkillController],
  providers: [ValheimSkillService],
  exports: [ValheimSkillService],
})
export class ValheimSkillModule {}
