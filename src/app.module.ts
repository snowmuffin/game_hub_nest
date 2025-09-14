import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SpaceEngineersModule } from './Space_Engineers/space-engineers.module';
import { ValheimModule } from './Valheim/valheim.module';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { ItemModule } from './Space_Engineers/item/item.module'; // Example: include ItemModule
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';
import { GameModule } from './game/game.module';
import { ServerModule } from './server/server.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // make ConfigModule global
      envFilePath: ['.env', 'config/space-engineers/.env'],
      expandVariables: true,
      cache: true,
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
        process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false, // enable SSL if configured
    }),
    AuthModule,
    SpaceEngineersModule,
    ValheimModule,
    ItemModule,
    UserModule,
    WalletModule,
    GameModule,
    ServerModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
