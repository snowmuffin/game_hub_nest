import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SpaceEngineersModule } from './Space_Engineers/space-engineers.module';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { ItemModule } from './Space_Engineers/item/item.module'; // 예시로 ItemModule 추가
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 전역 모듈로 설정
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      ssl:
        process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false, // SSL 설정 추가
    }),
    AuthModule,
    SpaceEngineersModule,
    ItemModule,
    UserModule,
    WalletModule,
    GameModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
