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

# 🗄️ 데이터베이스 및 마이그레이션 확인
echo "🗄️ Checking database and migrations..."

# 스키마 초기화
echo "🏗️ Ensuring database schemas exist..."
if npm run db:init-schemas > /dev/null 2>&1; then
    echo "✅ Database schemas ready"
else
    echo "⚠️ Schema initialization failed. Please check your DB configuration in .env"
    echo "💡 Make sure your PostgreSQL server is running"
    exit 1
fi

# 마이그레이션 상태 확인
echo "🔍 Checking migration status..."
MIGRATION_STATUS=$(npm run migration:show 2>&1 || echo "connection-failed")

if echo "$MIGRATION_STATUS" | grep -q "connection-failed"; then
    echo "❌ Database connection failed!"
    echo "💡 Please check your database configuration in .env"
    exit 1
elif echo "$MIGRATION_STATUS" | grep -q "No migrations"; then
    echo "📋 No migrations found. You may need to generate initial migration:"
    echo "   npm run migration:generate -- InitialSchema"
elif echo "$MIGRATION_STATUS" | grep -q "pending"; then
    echo "📋 Found pending migrations. Running them..."
    npm run migration:run
    echo "✅ Migrations completed"
else
    echo "✅ Database is up to date"
fi

# 🚀 개발 서버 시작
echo ""
echo "🚀 Starting development server..."
echo "================================================"
echo "� Environment: development"
echo "🌐 Server will be available at: http://localhost:4000"
echo "📝 API Documentation: http://localhost:4000"
echo "🏥 Health Check: http://localhost:4000/health"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Watch 모드로 서버 시작
npm run start:dev
