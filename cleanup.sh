#!/bin/bash

# 🧹 Game Hub 프로젝트 정리 스크립트
# 불필요한 파일 정리 및 디렉토리 구조 최적화

set -e

echo "🧹 Starting Game Hub project cleanup..."
echo "================================================"

# 📁 필수 디렉토리 생성
echo "📁 Creating essential directories..."
mkdir -p logs
mkdir -p scripts/generated-configs
mkdir -p backup
mkdir -p docs/api
mkdir -p docs/deployment

# 📝 로그 파일 초기화
echo "📝 Setting up log files..."
touch logs/app.log
touch logs/error.log
touch logs/out.log

# 🗑️ 불필요한 파일 정리
echo "🗑️ Cleaning up unnecessary files..."

# 임시 파일 제거
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.temp" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true

# 오래된 로그 파일 정리 (7일 이상)
find logs/ -name "*.log" -mtime +7 -delete 2>/dev/null || true

# Node.js 캐시 정리
echo "🧹 Cleaning Node.js cache..."
npm cache clean --force 2>/dev/null || true

# 🔍 의존성 검사
echo "🔍 Checking for unused dependencies..."
if command -v npx &> /dev/null; then
    npx depcheck --ignore-dirs=dist,node_modules,logs,backup || echo "⚠️ depcheck not available, skipping..."
fi

# 📊 프로젝트 통계
echo ""
echo "📊 Project Statistics:"
echo "================================================"
echo "📁 Total files: $(find . -type f | wc -l)"
echo "📁 TypeScript files: $(find src -name "*.ts" | wc -l)"
echo "📁 Test files: $(find test -name "*.ts" | wc -l)"
echo "📁 Log files: $(ls logs/ | wc -l)"
echo "💾 Project size: $(du -sh . | cut -f1)"
echo "💾 node_modules size: $(du -sh node_modules 2>/dev/null | cut -f1 || echo 'Not found')"

# 🔧 권한 설정
echo ""
echo "🔧 Setting up file permissions..."
chmod +x deploy.sh
chmod +x start-dev.sh
chmod +x server-setup.sh 2>/dev/null || true
chmod +x safe-migration.sh 2>/dev/null || true

# 📋 권장사항 출력
echo ""
echo "✅ Cleanup completed!"
echo "================================================"
echo ""
echo "📋 Recommended next steps:"
echo "1. Update your .env file with actual values"
echo "2. Run database migrations: npm run migration:run"
echo "3. Start development: npm run dev"
echo "4. Review PROJECT_STRUCTURE.md for guidelines"
echo ""
echo "🔧 Useful commands:"
echo "• Development: npm run dev"
echo "• Production deploy: npm run deploy"
echo "• View logs: npm run pm2:logs"
echo "• Clean logs: npm run logs:clear"
echo ""
