#!/bin/bash

# 배포 스크립트 - Game Hub NestJS Backend

set -e  # 오류 발생시 스크립트 중단

echo "🚀 Starting deployment process..."

# 환경 변수 확인
if [ ! -f .env ]; then
    echo "❌ .env file not found! Please create .env file from .env.example"
    exit 1
fi

# Node.js 의존성 설치
echo "📦 Installing dependencies..."
npm ci --production=false

# TypeScript 빌드
echo "🔨 Building application..."
npm run build

# 로그 디렉토리 생성
echo "📁 Creating logs directory..."
mkdir -p logs

# PM2 전역 설치 확인
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally..."
    npm install -g pm2
fi

# 기존 PM2 프로세스 중지 (있다면)
echo "🛑 Stopping existing PM2 processes..."
pm2 delete game-hub-nest 2>/dev/null || echo "No existing process found"

# PM2로 애플리케이션 시작
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# PM2 상태 확인
echo "📊 PM2 Status:"
pm2 status

# PM2 자동 시작 설정
echo "🔄 Setting up PM2 startup..."
pm2 save
pm2 startup

echo "✅ Deployment completed successfully!"
echo "🌐 Application is running on port 4000"
echo "📝 Check logs with: pm2 logs game-hub-nest"
echo "📊 Check status with: pm2 status"
echo "🔄 Restart with: pm2 restart game-hub-nest"
