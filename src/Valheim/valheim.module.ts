import { Module } from '@nestjs/common';
import { ValheimItemModule } from './item/valheim-item.module';
import { ValheimInventoryModule } from './inventory/valheim-inventory.module';
import { ValheimCharacterModule } from './character/valheim-character.module';
import { ValheimBuildingModule } from './building/valheim-building.module';
import { ValheimWorldModule } from './world/valheim-world.module';
import { ValheimSkillModule } from './skills/valheim-skill.module';

@Module({
  imports: [
    ValheimItemModule,
    ValheimInventoryModule,
    ValheimCharacterModule,
    ValheimBuildingModule,
    ValheimWorldModule,
    ValheimSkillModule,
  ],
  exports: [
    ValheimItemModule,
    ValheimInventoryModule,
    ValheimCharacterModule,
    ValheimBuildingModule,
    ValheimWorldModule,
    ValheimSkillModule,
  ],
})
export class ValheimModule {}
