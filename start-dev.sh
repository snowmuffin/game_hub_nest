#!/bin/bash

# 개발용 빠른 시작 스크립트 (PM2 없이)

echo "🚀 Starting Game Hub NestJS Backend in development mode..."

# 환경 변수 확인
if [ ! -f .env ]; then
    echo "❌ .env file not found! Please create .env file"
    exit 1
fi

# Node.js 의존성 설치 (필요시)
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# TypeScript 빌드 (필요시)
if [ ! -d "dist" ]; then
    echo "🔨 Building application..."
    npm run build
fi

echo "🌐 Starting server..."
echo "📝 Access URLs:"
echo "  - Local: http://localhost:4000/api"
echo "  - IP: http://your-server-ip:4000/api"
echo "  - Domain (after SSL): https://api.snowmuffingame.com/api"
echo ""
echo "⏹️  Press Ctrl+C to stop"
echo ""

# 애플리케이션 시작
npm run start:prod
