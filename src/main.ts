import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // 🌐 서버 설정
  const host = process.env.HOST || '0.0.0.0';
  const port = parseInt(process.env.PORT || '4000', 10);
  const domain = process.env.DOMAIN;
  const baseUrl = process.env.BASE_URL;
  const isProduction = process.env.NODE_ENV === 'production';

  console.log(
    `🚀 Starting Game Hub API in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode...`,
  );

  // 🔧 CORS 설정
  let allowedOrigins: string[] = [];

  if (process.env.CORS_ORIGINS) {
    allowedOrigins = process.env.CORS_ORIGINS.split(',').map((origin) =>
      origin.trim(),
    );
  } else {
    // 기본값 설정
    allowedOrigins = isProduction
      ? ['https://se.snowmuffingame.com', 'https://snowmuffingame.com']
      : [
          'http://localhost:3000',
          'http://localhost:5173',
          'http://localhost:3001',
        ];
  }

  console.log('🔐 Allowed CORS origins:', allowedOrigins);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Accept',
      'Accept-Language',
      'Content-Language',
      'Content-Type',
      'Authorization',
      'Cookie',
      'X-Requested-With',
      'X-HTTP-Method-Override',
      'Cache-Control',
      'Pragma',
    ],
    exposedHeaders: ['Content-Length', 'X-Total-Count'],
    optionsSuccessStatus: 200,
    preflightContinue: false,
  });

  // 🍪 Cookie parser 미들웨어
  app.use(cookieParser());

  // 🔍 전역 검증 파이프
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 🌐 API 글로벌 프리픽스
  app.setGlobalPrefix('api');

  // 🚀 서버 시작
  await app.listen(port, host, () => {
    const serverUrl = baseUrl || `http://${host}:${port}`;

    console.log('');
    console.log('🎉 ===============================================');
    console.log('🎉 Game Hub API Server Started Successfully!');
    console.log('🎉 ===============================================');
    console.log('');
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Server URL: ${serverUrl}`);
    console.log(`📝 API Base: ${serverUrl}`);
    console.log(`🏥 Health Check: ${serverUrl}/health`);

    if (domain) {
      console.log(`🔗 Domain: ${domain}`);
    }

    console.log('');
    console.log('🔐 Security:');
    console.log(`   • CORS Origins: ${allowedOrigins.length} configured`);
    console.log(`   • Global Validation: Enabled`);
    console.log(`   • Cookie Parser: Enabled`);
    console.log('');
    console.log('📝 Useful URLs:');
    console.log(`   • API Documentation: ${serverUrl}/docs`);
    console.log(`   • Metrics: ${serverUrl}/metrics`);
    console.log('');
  });
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start Game Hub API:', error);
  process.exit(1);
});
