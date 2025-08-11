import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ValheimItemController } from './valheim-item.controller';
import { ValheimItemService } from './valheim-item.service';
import { ValheimItem } from '../../entities/valheim/valheim-item.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([ValheimItem]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'defaultSecret',
        signOptions: { expiresIn: '6h' },
      }),
    }),
    ConfigModule,
  ],
  controllers: [ValheimItemController],
  providers: [ValheimItemService, JwtAuthGuard],
  exports: [ValheimItemService],
})
export class ValheimItemModule {}
