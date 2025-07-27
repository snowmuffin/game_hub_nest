#!/bin/bash

# Script to fix the migration index conflict
# This script will connect to your PostgreSQL database and fix the index issue

# Load environment variables
source .env 2>/dev/null || true

# Set default values if environment variables are not set
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_NAME=${DB_NAME:-snowmuffin}

echo "Fixing migration index conflict..."
echo "Database: $DB_NAME on $DB_HOST:$DB_PORT"

# Check if the index exists
echo "Checking if index 'idx_minecraft_username' exists..."

# Drop the existing index if it exists
echo "Dropping existing index if it exists..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "DROP INDEX IF EXISTS idx_minecraft_username;"

if [ $? -eq 0 ]; then
    echo "✅ Index dropped successfully (or didn't exist)"
    echo "You can now run your migration again."
    echo ""
    echo "To run the migration:"
    echo "npm run typeorm:migration:run"
    echo "or"
    echo "yarn typeorm:migration:run"
else
    echo "❌ Failed to drop index. Please check your database connection."
    echo "You may need to run this SQL manually:"
    echo "DROP INDEX IF EXISTS idx_minecraft_username;"
fi

echo ""
echo "Alternative: You can also modify your migration file to use conditional creation:"
echo "DO \$\$ BEGIN"
echo "    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_minecraft_username') THEN"
echo "        CREATE INDEX idx_minecraft_username ON muffincraft_auth_codes (\"minecraftUsername\");"
echo "    END IF;"
echo "END \$\$;"
