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
  const allowedOrigins = process.env.Whitelist 
    ? process.env.Whitelist.split(',').map(origin => origin.trim())
    : isProduction
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
  
  app.enableCors({
    origin: (origin, callback) => {
      // 서버간 요청 허용 (origin이 undefined인 경우)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`CORS 차단된 origin: ${origin}`);
        callback(new Error('CORS 정책에 의해 차단됨'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Total-Count'],
    optionsSuccessStatus: 200, // IE11 대응
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
