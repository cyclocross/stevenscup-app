-- Add missing contest fields for RaceResult import functionality
-- Run this script manually if migrations fail

-- Add external_id column
ALTER TABLE "contests" ADD COLUMN IF NOT EXISTS "external_id" varchar(100);

-- Add category column  
ALTER TABLE "contests" ADD COLUMN IF NOT EXISTS "category" varchar(255);

-- Add age_range column
ALTER TABLE "contests" ADD COLUMN IF NOT EXISTS "age_range" varchar(100);

-- Add participant_count column
ALTER TABLE "contests" ADD COLUMN IF NOT EXISTS "participant_count" integer; 