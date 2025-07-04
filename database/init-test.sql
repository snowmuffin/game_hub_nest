-- 테스트 데이터베이스 초기화 스크립트
-- 기본 확장 프로그램 설치
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 테스트용 기본 설정
ALTER DATABASE game_hub_test SET timezone TO 'UTC';

-- 연결 정보 확인용 메시지
\echo 'Test database initialized successfully!'
\echo 'Database: game_hub_test'
\echo 'User: test_user'
\echo 'Port: 5432 (mapped to 5433 on host)'
