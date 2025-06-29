#!/bin/bash

# 마이그레이션 파일의 외래키 참조 수정

echo "🔧 Fixing foreign key references in migration files..."

# Valheim 마이그레이션 파일들의 외래키 참조 수정
sed -i 's/referencedTableName: '\''users'\''/referencedTableName: '\''users'\'',\n            referencedSchema: '\''public'\''/g' src/migrations/20250629*CreateValheimTables.ts
sed -i 's/referencedTableName: '\''valheim_items'\''/referencedTableName: '\''items'\'',\n            referencedSchema: '\''valheim'\''/g' src/migrations/20250629*CreateValheimTables.ts

echo "✅ Migration files fixed!"
