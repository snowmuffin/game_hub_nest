module.exports = {
  apps: [
    {
      name: 'game-hub-nest',
      script: 'dist/main.js',
      instances: 1, // 시작은 1개 인스턴스로
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      
      // 환경별 설정
      env: {
        NODE_ENV: 'development',
        PORT: 4000,
        HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
        HOST: '0.0.0.0'
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
      
      // 환경변수 파일 로드 (환경에 따라)
      env_file: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
      
      // 모니터링
      monitoring: false,
      pmx: false
    }
  ]
};
