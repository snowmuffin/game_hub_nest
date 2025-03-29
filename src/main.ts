import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Get HOST and PORT from environment variables
  const host = process.env.HOST || '0.0.0.0';
  const port = parseInt(process.env.PORT || '4000', 10);

  await app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
  });
}
bootstrap();
