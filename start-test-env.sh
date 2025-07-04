#!/bin/bash

# 테스트 환경 시작 스크립트
echo "🚀 Starting Test Environment for Game Hub..."

# 테스트 DB 시작
echo "📦 Starting test PostgreSQL database..."
docker-compose -f docker-compose.test.yml up -d

# DB가 준비될 때까지 대기
echo "⏳ Waiting for database to be ready..."
sleep 5

# DB 연결 테스트
echo "🔍 Testing database connection..."
docker exec game_hub_test_postgres pg_isready -U test_user -d game_hub_test

if [ $? -eq 0 ]; then
    echo "✅ Database is ready!"
    
    # 마이그레이션 실행
    echo "📋 Running migrations..."
    npm run test:migration:run
    
    if [ $? -eq 0 ]; then
        echo "✅ Migrations completed!"
        echo ""
        echo "🎯 Test environment is ready!"
        echo "📊 Database: PostgreSQL on localhost:5433"
        echo "🔗 Database Name: game_hub_test"
        echo "👤 Username: test_user"
        echo ""
        echo "To start the application:"
        echo "  npm run start:test"
        echo ""
        echo "To access database:"
        echo "  docker exec -it game_hub_test_postgres psql -U test_user -d game_hub_test"
        echo ""
        echo "To stop test environment:"
        echo "  npm run test:db:down"
    else
        echo "❌ Migration failed!"
        exit 1
    fi
else
    echo "❌ Database connection failed!"
    exit 1
fi
