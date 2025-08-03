-- Remove username column from admin_users table
-- This migration removes the username field and updates the system to use email for authentication

-- First, drop any unique constraints on username if they exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'admin_users_username_key'
    ) THEN
        ALTER TABLE admin_users DROP CONSTRAINT admin_users_username_key;
    END IF;
END $$;

-- Drop the username column
ALTER TABLE admin_users DROP COLUMN IF EXISTS username;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
ORDER BY ordinal_position; 