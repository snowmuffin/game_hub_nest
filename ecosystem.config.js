module.exports = {
  apps: [
    {
      name: 'SE_Backend',
      script: 'dist/main.js',  // NestJS 빌드된 엔트리 파일
      instances: 1,            // 또는 'max'로 클러스터 모드 사용 가능
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
