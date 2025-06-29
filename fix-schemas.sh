#!/bin/bash

# 서버에서 실행할 스키마 생성 스크립트

echo "🔧 Creating missing schemas manually..."

# PostgreSQL에 직접 연결하여 스키마 생성
PGPASSWORD="Ov0CaSYp]wBEQ]8hj4rAKBfz5prB" psql \
  -h gamehub-spaceengineers.c9ecui4q2er7.ap-northeast-2.rds.amazonaws.com \
  -p 5432 \
  -U Snowmuffin \
  -d postgres \
  -c "
    CREATE SCHEMA IF NOT EXISTS space_engineers;
    CREATE SCHEMA IF NOT EXISTS valheim;
    CREATE SCHEMA IF NOT EXISTS minecraft;
  "

echo "✅ Schemas created successfully!"

# 스키마 확인
PGPASSWORD="Ov0CaSYp]wBEQ]8hj4rAKBfz5prB" psql \
  -h gamehub-spaceengineers.c9ecui4q2er7.ap-northeast-2.rds.amazonaws.com \
  -p 5432 \
  -U Snowmuffin \
  -d postgres \
  -c "SELECT nspname FROM pg_namespace WHERE nspname IN ('space_engineers', 'valheim', 'minecraft');"

echo "🚀 Now you can run migrations again!"
