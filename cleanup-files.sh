#!/bin/bash

# 🧹 Game Hub NestJS - 불필요한 파일 정리 스크립트
# 중복되고 오래된 파일들을 안전하게 정리합니다

set -e

echo "🧹 Starting Game Hub project cleanup..."
echo "========================================"

# 정리할 파일들 목록
CLEANUP_FILES=(
    # 중복된 스키마 파일들
    "create-schemas-fixed.js"
    "create-schemas-typeorm.ts" 
    "create-schemas.js"
    
    # 중복된 마이그레이션 스크립트들
    "fix-migrations.sh"
    "fix-schemas.sh"
    "migrate-to-public-schema.sh"
    "safe-migration.sh"
    
    # 개발 과정에서 생성된 임시 파일들
    "check-config.sh"
    "upgrade-nodejs.sh"
    
    # 중복된 문서들
    "DEPLOYMENT_STEPS.md"
    "ENV_FIXES_NEEDED.md"
    "HYBRID_SCHEMA_IMPLEMENTATION.md"
    "NODEJS_UPGRADE_GUIDE.md"
    
    # 루트에 있는 로그 파일
    "app.log"
    
    # 오래된 SQL 백업 파일
    "backup_20250629_200307.sql"
)

# 정리할 디렉토리들
CLEANUP_DIRS=(
    "schema-migration-backup-20250629-202653"
    "schema-migration-backup-20250629-202759"
)

echo "📋 Files and directories to be removed:"
for file in "${CLEANUP_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   🗑️  $file"
    fi
done

for dir in "${CLEANUP_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "   📁 $dir/"
    fi
done

echo ""
read -p "🤔 Do you want to proceed with cleanup? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled"
    exit 0
fi

echo ""
echo "🗑️ Removing unnecessary files..."

# 파일 삭제
for file in "${CLEANUP_FILES[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "   ✅ Removed: $file"
    fi
done

# 디렉토리 삭제
for dir in "${CLEANUP_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        rm -rf "$dir"
        echo "   ✅ Removed directory: $dir/"
    fi
done

echo ""
echo "📁 Cleaning up empty directories..."

# scripts 디렉토리 확인 (비어있으면 삭제)
if [ -d "scripts" ] && [ -z "$(ls -A scripts)" ]; then
    rmdir scripts
    echo "   ✅ Removed empty directory: scripts/"
fi

echo ""
echo "🧹 Final cleanup tasks..."

# .gitignore 업데이트 (불필요한 항목 제거)
if [ -f ".gitignore" ]; then
    # 백업 생성
    cp .gitignore .gitignore.backup
    
    # 정리된 .gitignore 생성
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/

# Environment files
.env
.env.local
.env.*.local

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# PM2 logs
.pm2/

# Database backups (keep only recent ones)
backup_*.sql
schema-migration-backup-*/

# Temporary files
*.tmp
*.temp
.cache/

# Test coverage
coverage/
.coverage

# TypeScript build cache
*.tsbuildinfo
EOF
    
    echo "   ✅ Updated .gitignore"
    rm .gitignore.backup
fi

echo ""
echo "🎉 ================================================"
echo "🎉 Project cleanup completed successfully!"
echo "🎉 ================================================"
echo ""
echo "📊 Summary:"
echo "   • Removed ${#CLEANUP_FILES[@]} unnecessary files"
echo "   • Removed ${#CLEANUP_DIRS[@]} old backup directories"
echo "   • Updated .gitignore"
echo "   • Cleaned up empty directories"
echo ""
echo "📝 Remaining important files:"
echo "   • Configuration: package.json, tsconfig.json, nest-cli.json"
echo "   • Documentation: README.md, PROJECT_STRUCTURE.md"
echo "   • Deployment: deploy.sh, start-dev.sh, ecosystem.config.js"
echo "   • Environment: .env.example"
echo ""
echo "✨ Your project is now clean and organized!"
