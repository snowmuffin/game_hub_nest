#!/bin/bash

# 🗄️ Database Schema Setup Script
# This script ensures proper database initialization with multiple schemas

set -e

echo "🗄️ Game Hub Database Schema Setup"
echo "=================================="

# Load environment variables
if [ -f ".env" ]; then
    source .env
elif [ -f ".env.production" ]; then
    source .env.production
else
    echo "❌ No environment file found!"
    exit 1
fi

# Database connection details
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_NAME=${DB_NAME:-snowmuffin}

echo "📋 Database Configuration:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Test database connection
echo "🔍 Testing database connection..."
if command -v psql >/dev/null 2>&1; then
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" >/dev/null 2>&1; then
        echo "✅ Database connection successful"
    else
        echo "❌ Database connection failed!"
        echo "💡 Please check your database is running and credentials are correct"
        exit 1
    fi
else
    echo "⚠️ psql not found, skipping direct database connection test"
fi

# Create schemas if they don't exist
echo "🏗️ Creating database schemas..."
if command -v psql >/dev/null 2>&1; then
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << EOF
CREATE SCHEMA IF NOT EXISTS space_engineers;
CREATE SCHEMA IF NOT EXISTS valheim;
\echo '✅ Schemas created successfully'
EOF
else
    echo "⚠️ psql not available, schemas will be created via TypeORM migration"
fi

# Run TypeORM migrations
echo "🔄 Running TypeORM migrations..."
npm run migration:run

echo ""
echo "✅ Database schema setup completed!"
echo "📊 To check migration status: npm run migration:show"
