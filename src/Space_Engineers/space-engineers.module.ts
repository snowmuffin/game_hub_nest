import { Module } from '@nestjs/common';
import { ItemModule } from './item/item.module';

@Module({
  imports: [ItemModule], // Space_Engineers 모듈에 ItemModule 포함
})
export class SpaceEngineersModule {}