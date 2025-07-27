-- Fix for migration error: relation "idx_minecraft_username" already exists
-- Run this SQL script on your production database before running the migration

-- Option 1: Drop the existing index (if you want the migration to recreate it)
DROP INDEX IF EXISTS idx_minecraft_username;

-- Option 2: If you want to keep the existing index and skip creation in migration,
-- you would need to modify the migration file on the server to use conditional creation:

-- FOR FUTURE MIGRATIONS: Use this pattern to avoid conflicts
-- DO $$ 
-- BEGIN
--     IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_minecraft_username') THEN
--         CREATE INDEX idx_minecraft_username ON muffincraft_auth_codes ("minecraftUsername");
--     END IF;
-- END $$;

-- Alternative: Use PostgreSQL's CREATE INDEX IF NOT EXISTS (PostgreSQL 9.5+)
-- CREATE INDEX IF NOT EXISTS idx_minecraft_username ON muffincraft_auth_codes ("minecraftUsername");

-- After running this script, you can retry your migration
