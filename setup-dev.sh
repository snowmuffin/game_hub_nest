#!/bin/bash

# 🚀 Game Hub Development Setup Script
# 개발 환경을 안전하게 설정합니다.

set -e

echo "🚀 Game Hub Development Setup"
echo "============================"


# 환경 변수 확인
if [ ! -f ".env" ]; then
    echo "⚠️ .env file not found!"
    if [ -f ".env.example" ]; then
        echo "📋 Copying from .env.example..."
        cp .env.example .env
        echo "✅ .env file created from example"
        echo "💡 Please update database credentials in .env file"
    else
        echo "❌ Please create .env file with database configuration"
        exit 1
    fi
fi

source .env

echo "📋 Database Configuration:"
echo "   Host: ${DB_HOST:-localhost}"
echo "   Port: ${DB_PORT:-5432}"
echo "   Database: ${DB_NAME:-snowmuffin}"
echo "   User: ${DB_USER:-postgres}"
echo ""

# 의존성 설치
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"

# 스키마 초기화
echo "🏗️ Initializing database schemas..."
npm run db:init-schemas

# 마이그레이션 확인 및 생성
echo "🔍 Checking for existing migrations..."
MIGRATION_COUNT=$(find src/migrations -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')

if [ "$MIGRATION_COUNT" -eq 0 ]; then
    echo "📋 No migrations found. Generating initial migration..."
    echo "⏳ This may take a moment as TypeORM analyzes your entities..."
    
    # 첫 번째 마이그레이션 생성
    if npm run migration:generate -- InitialSchema; then
        echo "✅ Initial migration generated successfully"
        
        # 마이그레이션 실행
        echo "▶️ Running initial migration..."
        npm run migration:run
        echo "✅ Initial migration completed"
    else
        echo "⚠️ No schema changes detected or migration generation failed"
        echo "💡 This might happen if the database already matches your entities"
    fi
else
    echo "📋 Found $MIGRATION_COUNT existing migration(s)"
    
    # 마이그레이션 상태 확인
    echo "🔍 Checking migration status..."
    if npm run migration:show | grep -q "pending"; then
        echo "▶️ Running pending migrations..."
        npm run migration:run
        echo "✅ Migrations completed"
    else
        echo "✅ Database is up to date"
    fi
fi

echo ""
echo "🎉 Development environment setup completed!"
echo ""
echo "🚀 Next steps:"
echo "   • Start development server: npm run start:dev"
echo "   • Run tests: npm test"
echo "   • View logs: npm run pm2:logs"
echo ""
echo "💡 Useful commands:"
echo "   • Generate migration: npm run migration:generate -- MigrationName"
echo "   • Run migrations: npm run migration:run"
echo "   • Check migration status: npm run migration:show"
echo "   • Revert migration: npm run migration:revert"
echo ""
