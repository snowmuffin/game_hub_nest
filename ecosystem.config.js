const dotenv = require('dotenv');
const path = require('path');

// 환경에 따라 .env 파일 로드
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
const envPath = path.resolve(__dirname, envFile);

// .env 파일 존재 확인 및 로드
try {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.log(`⚠️  ${envFile} not found, falling back to .env`);
    dotenv.config({ path: path.resolve(__dirname, '.env') });
  } else {
    console.log(`✅ Loaded environment from ${envFile}`);
  }
} catch (error) {
  console.log('⚠️  Could not load .env file, using default values');
}

module.exports = {
  apps: [
    {
      name: 'game-hub-nest',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      
      // 환경변수는 .env에서 로드
      env: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: process.env.PORT || 4000,
        HOST: process.env.HOST || '0.0.0.0',
        
        // Database
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_USER: process.env.DB_USER,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_NAME: process.env.DB_NAME,
        DB_SSL: process.env.DB_SSL,
        
        // Steam OAuth
        STEAM_API_KEY: process.env.STEAM_API_KEY,
        STEAM_API_URL: process.env.STEAM_API_URL,
        RETURN_URL: process.env.RETURN_URL,
        REALM: process.env.REALM,
        
        // JWT
        JWT_SECRET: process.env.JWT_SECRET,
        
        // Domain
        DOMAIN: process.env.DOMAIN,
        BASE_URL: process.env.BASE_URL,
        BACKEND_URL: process.env.BACKEND_URL,
        
        // CORS
        CORS_ORIGINS: process.env.CORS_ORIGINS || process.env.Whitelist,
        
        // AWS S3
        SE_HANGAR_S3_BUCKET: process.env.SE_HANGAR_S3_BUCKET,
        SE_HANGAR_S3_REGION: process.env.SE_HANGAR_S3_REGION,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        
        // Health Check
        HEALTH_CHECK_KEY: process.env.HEALTH_CHECK_KEY,
        
        // Logging
        LOG_LEVEL: process.env.LOG_LEVEL || 'info',
        LOG_FILE: process.env.LOG_FILE || './logs/app.log',
      },
      
      // 로그 설정
      log_file: './logs/app.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // 재시작 정책
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      
      // 모니터링
      monitoring: false,
      pmx: false
    }
  ]
};
