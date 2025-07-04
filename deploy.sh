#!/bin/bash

# 배포 스크립트 - Game Hub NestJS Backend

set -e  # 오류 발생시 스크립트 중단

echo "🚀 Starting deployment process..."

# 환경 변수 확인
ENV_FILE=".env"
if [ "$NODE_ENV" = "production" ]; then
    ENV_FILE=".env.production"
fi

if [ ! -f $ENV_FILE ]; then
    echo "❌ $ENV_FILE file not found! Please create environment file"
    exit 1
fi

echo "📋 Using environment file: $ENV_FILE"

# Node.js 버전 확인
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
echo "📊 Current Node.js version: $(node --version)"

if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js 20 or higher is required. Current version: $(node --version)"
    echo "💡 Please run: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

echo "✅ Node.js version check passed"

# Git 최신 상태로 업데이트 (프로덕션에서)
if [ "$NODE_ENV" = "production" ]; then
    echo "📥 Pulling latest changes..."
    git pull origin main
fi

# Node.js 의존성 설치
echo "📦 Installing dependencies..."
npm ci --production=false

# 데이터베이스 마이그레이션 실행
echo "🗄️ Running database migrations..."
npm run migration:run

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

# 프로덕션 환경에서만 startup 설정
if [ "$NODE_ENV" = "production" ]; then
    pm2 startup
fi

# Health check
echo "🏥 Performing health check..."
sleep 10

# 여러 번 시도하여 health check
for i in {1..5}; do
    echo "Attempt $i/5: Checking health..."
    if curl -f http://localhost:4000/api/health; then
        echo "✅ Health check passed!"
        break
    else
        echo "⚠️ Health check failed, retrying in 5 seconds..."
        sleep 5
        if [ $i -eq 5 ]; then
            echo "❌ Health check failed after 5 attempts"
            echo "📝 Check logs: pm2 logs game-hub-nest"
            exit 1
        fi
    fi
done

echo "✅ Deployment completed successfully!"
echo "📊 Check status: pm2 status"
echo "📝 Check logs: pm2 logs game-hub-nest"
echo "🌐 Application is running on port 4000"
echo "📝 Check logs with: pm2 logs game-hub-nest"
echo "📊 Check status with: pm2 status"
echo "🔄 Restart with: pm2 restart game-hub-nest"
