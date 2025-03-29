import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DamageModule } from './damage/damage.module';
import { ResourceModule } from './resource/resource.module';
import { TradeModule } from './trade/trade.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AuthModule,
    DamageModule,
    ResourceModule,
    TradeModule,
    UserModule,
  ],
})
export class SpaceEngineersModule {}