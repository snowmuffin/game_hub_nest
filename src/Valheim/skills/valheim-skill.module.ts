import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ValheimCharacterSkill } from '../../entities/valheim/valheim-skill.entity';
import { ValheimSkillService } from './valheim-skill.service';
import { ValheimSkillController } from './valheim-skill.controller';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([ValheimCharacterSkill]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'defaultSecret',
        signOptions: { expiresIn: '6h' },
      }),
    }),
    ConfigModule,
  ],
  controllers: [ValheimSkillController],
  providers: [ValheimSkillService, JwtAuthGuard],
  exports: [ValheimSkillService],
})
export class ValheimSkillModule {}
