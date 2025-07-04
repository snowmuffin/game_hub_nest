#!/bin/bash

# 🛠️ Game Hub NestJS - 개발 환경 시작 스크립트
# 개발에 필요한 모든 설정을 자동으로 준비합니다.

set -e

echo "�️ Starting Game Hub Development Environment..."
echo "================================================"

# 🔍 환경 파일 확인
if [ ! -f ".env" ]; then
    echo "📋 Environment file not found. Creating from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env from template"
        echo "⚠️ Please update .env with your actual configuration values"
    else
        echo "❌ No .env.example found. Please create .env manually"
        exit 1
    fi
fi

# 📦 의존성 설치 확인
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# 📁 로그 디렉토리 생성
echo "📁 Setting up log directories..."
mkdir -p logs
touch logs/app.log logs/error.log logs/out.log
echo "✅ Log directories ready"

# 🗄️ 데이터베이스 상태 확인 (선택적)
echo "🗄️ Checking database connection..."
if npm run migration:run --silent > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "⚠️ Database connection failed. Please check your DB configuration in .env"
    echo "💡 Make sure your PostgreSQL server is running"
fi

# 🚀 개발 서버 시작
echo ""
echo "🚀 Starting development server..."
echo "================================================"
echo "� Environment: development"
echo "🌐 Server will be available at: http://localhost:4000"
echo "📝 API Documentation: http://localhost:4000/api"
echo "🏥 Health Check: http://localhost:4000/api/health"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Watch 모드로 서버 시작
npm run start:dev
