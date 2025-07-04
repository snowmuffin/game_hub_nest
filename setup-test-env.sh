#!/bin/bash

# 테스트 환경 설정 스크립트

echo "🚀 테스트 환경을 설정합니다..."

# 환경 변수 확인
if [ ! -f ".env.test" ]; then
    echo "❌ .env.test 파일이 없습니다. 생성해주세요."
    exit 1
fi

echo "📦 테스트 데이터베이스 컨테이너를 시작합니다..."
docker-compose -f docker-compose.test.yml up -d

# 데이터베이스가 준비될 때까지 대기
echo "⏳ 데이터베이스가 시작될 때까지 대기 중..."
sleep 10

# 데이터베이스 연결 확인
echo "🔍 데이터베이스 연결을 확인합니다..."
until docker exec game_hub_test_db pg_isready -U test_user -d game_hub_test; do
  echo "데이터베이스 대기 중..."
  sleep 2
done

echo "✅ 데이터베이스가 준비되었습니다!"

# 마이그레이션 실행
echo "📊 마이그레이션을 실행합니다..."
npm run test:migration:run

if [ $? -eq 0 ]; then
    echo "✅ 마이그레이션이 완료되었습니다!"
    echo ""
    echo "🎉 테스트 환경이 준비되었습니다!"
    echo ""
    echo "사용 가능한 명령어:"
    echo "  npm run start:test     - 테스트 환경에서 서버 시작"
    echo "  npm run test:db:down   - 테스트 DB 중지"
    echo "  npm run test:db:reset  - 테스트 DB 완전 초기화"
    echo ""
    echo "데이터베이스 접속 정보:"
    echo "  Host: localhost"
    echo "  Port: 5433"
    echo "  Database: game_hub_test"
    echo "  Username: test_user"
    echo "  Password: test_password"
else
    echo "❌ 마이그레이션 실행 중 오류가 발생했습니다."
    exit 1
fi
