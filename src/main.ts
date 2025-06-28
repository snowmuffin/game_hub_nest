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
  const allowedOrigins = process.env.Whitelist 
    ? process.env.Whitelist.split(',').map(origin => origin.trim())
    : ['http://localhost:3000'];
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
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
