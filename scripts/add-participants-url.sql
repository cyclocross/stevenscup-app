-- Add participants_url column to series table for RaceResult participants import
-- Run this script manually if migrations fail

-- Add participants_url column to series table
ALTER TABLE "series" ADD COLUMN IF NOT EXISTS "participants_url" text; 