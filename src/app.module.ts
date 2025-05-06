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
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false, // SSL 설정 추가
    }),
    AuthModule,
    SpaceEngineersModule,
    ItemModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }

  constructor() {
    console.log('Environment Variables:', {
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD,
      DB_NAME: process.env.DB_NAME,
      PORT: process.env.PORT,
      HOST: process.env.HOST,
      STEAM_API_KEY: process.env.STEAM_API_KEY,
      RETURN_URL: process.env.RETURN_URL,
      REALM: process.env.REALM,
      JWT_SECRET: process.env.JWT_SECRET,
    });
  }
}
