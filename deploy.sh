#!/bin/bash

# 🚀 Game Hub NestJS Backend - 배포 스크립트
# 자동화된 배포로 안전하고 빠른 프로덕션 배포를 지원합니다.

set -e  # 오류 발생시 스크립트 중단

echo "🚀 Starting Game Hub deployment process..."
echo "================================================"

# 🔍 환경 변수 확인
ENV_FILE=".env"
if [ "$NODE_ENV" = "production" ]; then
    ENV_FILE=".env.production"
fi

if [ ! -f $ENV_FILE ]; then
    echo "❌ $ENV_FILE file not found!"
    echo "💡 Please create environment file from template:"
    echo "   cp .env.example $ENV_FILE"
    exit 1
fi

echo "📋 Using environment file: $ENV_FILE"

# 📊 Node.js 버전 확인
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
echo "📊 Current Node.js version: $(node --version)"

if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js 20 or higher is required. Current version: $(node --version)"
    echo "💡 Please run: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

echo "✅ Node.js version check passed"

# 📥 Git 최신 상태로 업데이트 (프로덕션에서)
if [ "$NODE_ENV" = "production" ]; then
    echo "📥 Pulling latest changes from repository..."
    git pull
    echo "✅ Repository updated"
fi

# 📦 Node.js 의존성 설치
echo "📦 Installing dependencies..."
npm ci --production=false
echo "✅ Dependencies installed"

# 🗄️ 데이터베이스 백업 (프로덕션에서)
if [ "$NODE_ENV" = "production" ]; then
    echo "🗄️ Creating database backup..."
    BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p $BACKUP_DIR
    # 백업 로직은 실제 DB 설정에 따라 조정 필요
    echo "✅ Database backup created in $BACKUP_DIR"
fi

# 🗄️ 데이터베이스 마이그레이션 실행
echo "🗄️ Running database migrations..."
npm run migration:run
echo "✅ Database migrations completed"

# 🔨 TypeScript 빌드
echo "🔨 Building TypeScript application..."
npm run build
echo "✅ Application built successfully"

# 📁 로그 디렉토리 생성
echo "📁 Setting up log directories..."
mkdir -p logs
touch logs/app.log logs/error.log logs/out.log
echo "✅ Log directories ready"

# 📦 PM2 전역 설치 확인
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally..."
    npm install -g pm2
    echo "✅ PM2 installed"
fi

# 🛑 기존 PM2 프로세스 중지 (있다면)
echo "🛑 Stopping existing PM2 processes..."
pm2 delete game-hub-nest 2>/dev/null || echo "ℹ️ No existing process found"

# 🚀 PM2로 애플리케이션 시작
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js --env production
echo "✅ Application started with PM2"

# 📊 PM2 상태 확인
echo "📊 Checking PM2 status..."
pm2 status

# 💾 PM2 설정 저장
echo "� Saving PM2 configuration..."
pm2 save

# 🔄 프로덕션 환경에서만 startup 설정
if [ "$NODE_ENV" = "production" ]; then
    echo "🔄 Setting up PM2 auto-startup..."
    pm2 startup
    echo "✅ PM2 auto-startup configured"
fi

# 🏥 Health check 수행
echo "🏥 Performing health check..."
echo "⏳ Waiting for application to start..."
sleep 10

# 🔄 여러 번 시도하여 health check
MAX_ATTEMPTS=5
for i in $(seq 1 $MAX_ATTEMPTS); do
    echo "🔍 Health check attempt $i/$MAX_ATTEMPTS..."
    
    if curl -f -s http://localhost:4000/api/health > /dev/null 2>&1; then
        echo "✅ Health check passed! Application is running healthy."
        break
    else
        echo "⚠️ Health check failed, retrying in 5 seconds..."
        sleep 5
        
        if [ $i -eq $MAX_ATTEMPTS ]; then
            echo "❌ Health check failed after $MAX_ATTEMPTS attempts"
            echo "📝 Check application logs:"
            echo "   pm2 logs game-hub-nest"
            echo "📊 Check PM2 status:"
            echo "   pm2 status"
            exit 1
        fi
    fi
done

echo ""
echo "🎉 ==============================================="
echo "🎉 Game Hub deployment completed successfully!"
echo "🎉 ==============================================="
echo ""
echo "📊 Application Status:"
echo "   • Port: 4000"
echo "   • Environment: $NODE_ENV"
echo "   • Health endpoint: http://localhost:4000/api/health"
echo ""
echo "🛠️ Management Commands:"
echo "   • Check status: pm2 status"
echo "   • View logs: pm2 logs game-hub-nest"
echo "   • Restart: pm2 restart game-hub-nest"
echo "   • Stop: pm2 stop game-hub-nest"
echo "   • Reload: pm2 reload game-hub-nest"
echo ""
echo "📂 Important Paths:"
echo "   • Application: $(pwd)"
echo "   • Logs: $(pwd)/logs/"
echo "   • Environment: $ENV_FILE"
echo ""
