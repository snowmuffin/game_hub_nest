import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ValheimItemModule } from './item/valheim-item.module';
import { ValheimInventoryModule } from './inventory/valheim-inventory.module';
import { ValheimCharacterModule } from './character/valheim-character.module';
import { ValheimBuildingModule } from './building/valheim-building.module';
import { ValheimWorldModule } from './world/valheim-world.module';
import { ValheimSkillModule } from './skills/valheim-skill.module';

@Module({
  imports: [
    JwtModule.register({}),
    ConfigModule,
    ValheimItemModule,
    ValheimInventoryModule,
    ValheimCharacterModule,
    ValheimBuildingModule,
    ValheimWorldModule,
    ValheimSkillModule,
  ],
  exports: [
    JwtModule,
    ConfigModule,
    ValheimItemModule,
    ValheimInventoryModule,
    ValheimCharacterModule,
    ValheimBuildingModule,
    ValheimWorldModule,
    ValheimSkillModule,
  ],
})
export class ValheimModule {}
