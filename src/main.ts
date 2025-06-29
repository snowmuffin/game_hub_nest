import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  console.log('REALM env:', process.env.REALM);

  // Get configuration from environment variables
  const host = process.env.HOST || '0.0.0.0';
  const port = parseInt(process.env.PORT || '4000', 10);
  const domain = process.env.DOMAIN;
  const baseUrl = process.env.BASE_URL;

  // Enable CORS with specific settings
  const isProduction = process.env.NODE_ENV === 'production';
  let allowedOrigins: string[] = [];
  
  if (process.env.Whitelist) {
    allowedOrigins = process.env.Whitelist.split(',').map(origin => origin.trim());
  } else {
    allowedOrigins = isProduction
      ? [
          'https://se.snowmuffingame.com',
          'https://snowmuffingame.com'
        ]
      : [
          'http://localhost:3000',
          'http://localhost:3001',
          'https://se.snowmuffingame.com',
          'https://snowmuffingame.com'
        ];
  }
  
  // 항상 se.snowmuffingame.com 포함
  if (!allowedOrigins.includes('https://se.snowmuffingame.com')) {
    allowedOrigins.push('https://se.snowmuffingame.com');
  }
  
  console.log('허용된 CORS origins:', allowedOrigins);
  
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
      'Pragma'
    ],
    exposedHeaders: ['Content-Length', 'X-Total-Count'],
    optionsSuccessStatus: 200,
    preflightContinue: false,
  });

  // Register cookie-parser middleware
  app.use(cookieParser());

  // Set global prefix for API routes (optional)
  app.setGlobalPrefix('api');

  await app.listen(port, host, () => {
    const serverUrl = baseUrl || `http://${host}:${port}`;
    console.log(`Server is running on ${serverUrl}`);
    if (domain) {
      console.log(`Domain: ${domain}`);
    }
    console.log(`API available at: ${serverUrl}/api`);
  });
}
bootstrap();
