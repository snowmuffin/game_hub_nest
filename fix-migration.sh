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

# Check if the indexes exist
echo "Checking if conflicting indexes exist..."

# Drop the existing indexes if they exist (both tables might have the same index name)
echo "Dropping existing indexes if they exist..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "DROP INDEX IF EXISTS idx_minecraft_username;"

if [ $? -eq 0 ]; then
    echo "✅ Indexes dropped successfully (or didn't exist)"
    echo ""
    echo "The issue is that your migration tries to create two indexes with the same name:"
    echo "1. idx_minecraft_username on muffincraft_players table"
    echo "2. idx_minecraft_username on muffincraft_auth_codes table"
    echo ""
    echo "You need to modify your migration file to use unique index names."
    echo "Suggested fix for your migration file:"
    echo ""
    echo "Replace:"
    echo "  CREATE INDEX idx_minecraft_username ON muffincraft_auth_codes (\"minecraftUsername\");"
    echo "With:"
    echo "  CREATE INDEX idx_auth_codes_minecraft_username ON muffincraft_auth_codes (\"minecraftUsername\");"
    echo ""
    echo "After fixing the migration file, you can run:"
    echo "npm run migration:run"
    echo "or"
    echo "yarn migration:run"
else
    echo "❌ Failed to drop indexes. Please check your database connection."
    echo "You may need to run this SQL manually:"
    echo "DROP INDEX IF EXISTS idx_minecraft_username;"
fi

echo ""
echo "Alternative: You can also modify your migration file to use conditional creation with unique names:"
echo "-- For muffincraft_players table:"
echo "DO \$\$ BEGIN"
echo "    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_players_minecraft_username') THEN"
echo "        CREATE INDEX idx_players_minecraft_username ON muffincraft_players (\"minecraftUsername\");"
echo "    END IF;"
echo "END \$\$;"
echo ""
echo "-- For muffincraft_auth_codes table:"
echo "DO \$\$ BEGIN"
echo "    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_auth_codes_minecraft_username') THEN"
echo "        CREATE INDEX idx_auth_codes_minecraft_username ON muffincraft_auth_codes (\"minecraftUsername\");"
echo "    END IF;"
echo "END \$\$;"
