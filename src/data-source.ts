import { DataSource } from 'typeorm';
import * as path from 'path';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'snowmuffin',
  entities: [path.join(process.cwd(), 'src/**/*.entity{.ts,.js}')], // 절대 경로 사용
  migrations: [path.join(process.cwd(), 'src/migrations/*{.ts,.js}')], // 절대 경로 사용
  synchronize: false, // 프로덕션 환경에서는 false로 설정
  logging: false,
});
