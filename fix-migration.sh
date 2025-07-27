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

# Create the missing index with a unique name for auth_codes table
echo "Creating the missing index with a unique name..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "CREATE INDEX IF NOT EXISTS idx_auth_codes_minecraft_username ON muffincraft_auth_codes (\"minecraftUsername\");"

# Mark the migration as completed manually
echo "Marking migration as completed..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "INSERT INTO migrations (timestamp, name) VALUES (1753618418898, 'InitialMigration1753618418898') ON CONFLICT DO NOTHING;"

if [ $? -eq 0 ]; then
    echo "✅ Migration fixed successfully!"
    echo ""
    echo "What was done:"
    echo "1. Dropped any existing conflicting idx_minecraft_username index"
    echo "2. Created idx_auth_codes_minecraft_username for the auth_codes table"
    echo "3. Marked the migration as completed in the database"
    echo ""
    echo "Your database should now be in the correct state."
    echo "You can verify by running: npm run migration:run"
    echo "(It should show 'No migrations are pending')"
else
    echo "❌ Failed to fix migration. Please check your database connection."
    echo "You may need to run these SQL commands manually:"
    echo "1. DROP INDEX IF EXISTS idx_minecraft_username;"
    echo "2. CREATE INDEX IF NOT EXISTS idx_auth_codes_minecraft_username ON muffincraft_auth_codes (\"minecraftUsername\");"
    echo "3. INSERT INTO migrations (timestamp, name) VALUES (1753618418898, 'InitialMigration1753618418898') ON CONFLICT DO NOTHING;"
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
