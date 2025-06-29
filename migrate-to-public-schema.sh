#!/bin/bash

# 스키마 마이그레이션 스크립트: spaceengineers → public
# 무중단 서비스를 위해 기존 스키마는 유지하면서 public으로 복사

set -e

# 환경변수 로드
if [ -f .env ]; then
    source .env
else
    echo "Error: .env file not found"
    exit 1
fi

# 필수 환경변수 확인
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
    echo "Error: Required database environment variables are missing"
    exit 1
fi

# PostgreSQL 연결 함수
run_psql() {
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "$1"
}

echo "🚀 Starting schema migration from 'spaceengineers' to 'public'"
echo "📅 $(date)"

# 1. 백업 디렉토리 생성
BACKUP_DIR="./schema-migration-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📂 Created backup directory: $BACKUP_DIR"

# 2. 현재 public 스키마 백업 (혹시 기존 데이터가 있다면)
echo "💾 Backing up current public schema..."
PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --schema=public --no-owner --no-privileges > "$BACKUP_DIR/public_schema_backup.sql"

# 3. spaceengineers 스키마도 백업
echo "💾 Backing up spaceengineers schema..."
PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --schema=spaceengineers --no-owner --no-privileges > "$BACKUP_DIR/spaceengineers_schema_backup.sql"

# 4. public 스키마의 기존 테이블 확인
echo "🔍 Checking existing tables in public schema..."
run_psql "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"

# 5. spaceengineers 스키마의 모든 테이블을 public으로 복사
echo "📋 Getting list of tables to migrate..."
TABLES=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'spaceengineers' ORDER BY table_name;" | tr -d ' ')

echo "📊 Tables to migrate:"
echo "$TABLES"

# 6. 각 테이블을 public 스키마로 복사
for table in $TABLES; do
    if [ ! -z "$table" ]; then
        echo "🔄 Migrating table: $table"
        
        # 테이블 구조 복사 (데이터 제외)
        run_psql "CREATE TABLE IF NOT EXISTS public.\"$table\" (LIKE spaceengineers.\"$table\" INCLUDING ALL);"
        
        # 데이터 복사
        run_psql "INSERT INTO public.\"$table\" SELECT * FROM spaceengineers.\"$table\" ON CONFLICT DO NOTHING;"
        
        echo "✅ Completed: $table"
    fi
done

# 7. 시퀀스 복사 및 동기화
echo "🔢 Migrating sequences..."
SEQUENCES=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    -t -c "SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'spaceengineers';" | tr -d ' ')

for seq in $SEQUENCES; do
    if [ ! -z "$seq" ]; then
        echo "🔄 Migrating sequence: $seq"
        
        # 현재 시퀀스 값 가져오기
        CURRENT_VAL=$(run_psql "SELECT last_value FROM spaceengineers.\"$seq\";" | grep -E '^[0-9]+$' || echo "1")
        
        # public 스키마에 시퀀스 생성 또는 업데이트
        run_psql "CREATE SEQUENCE IF NOT EXISTS public.\"$seq\";"
        run_psql "SELECT setval('public.\"$seq\"', $CURRENT_VAL);"
        
        echo "✅ Completed sequence: $seq (value: $CURRENT_VAL)"
    fi
done

# 8. 데이터 무결성 검증
echo "🔍 Verifying data integrity..."

echo "📊 Table count comparison:"
for table in $TABLES; do
    if [ ! -z "$table" ]; then
        OLD_COUNT=$(run_psql "SELECT COUNT(*) FROM spaceengineers.\"$table\";" | grep -E '^[0-9]+$' || echo "0")
        NEW_COUNT=$(run_psql "SELECT COUNT(*) FROM public.\"$table\";" | grep -E '^[0-9]+$' || echo "0")
        
        if [ "$OLD_COUNT" = "$NEW_COUNT" ]; then
            echo "✅ $table: $OLD_COUNT = $NEW_COUNT"
        else
            echo "❌ $table: $OLD_COUNT ≠ $NEW_COUNT"
        fi
    fi
done

# 9. 마이그레이션 정보 저장
cat > "$BACKUP_DIR/migration_info.txt" << EOF
Schema Migration Information
============================
Date: $(date)
Source Schema: spaceengineers
Target Schema: public
Migration Status: Completed

Tables Migrated:
$TABLES

Sequences Migrated:
$SEQUENCES

Next Steps:
1. Update application configuration (src/data-source.ts)
2. Test application with new schema
3. Deploy and monitor
4. After verification, optionally remove old schema

Rollback Command:
If needed, restore from: $BACKUP_DIR/spaceengineers_schema_backup.sql
EOF

echo "📄 Migration info saved to: $BACKUP_DIR/migration_info.txt"

echo "🎉 Schema migration completed successfully!"
echo "📂 Backup files location: $BACKUP_DIR"
echo ""
echo "⚠️  NEXT STEPS:"
echo "1. Update src/data-source.ts to use public schema (or remove schema config)"
echo "2. Restart the application"
echo "3. Test all functionality"
echo "4. Monitor for any issues"
echo ""
echo "🔄 The old 'spaceengineers' schema is preserved for rollback if needed"
