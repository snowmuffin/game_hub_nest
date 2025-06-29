import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValheimCharacterSkill } from './valheim-skill.entity';
import { ValheimSkillService } from './valheim-skill.service';
import { ValheimSkillController } from './valheim-skill.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ValheimCharacterSkill])],
  controllers: [ValheimSkillController],
  providers: [ValheimSkillService],
  exports: [ValheimSkillService],
})
export class ValheimSkillModule {}
