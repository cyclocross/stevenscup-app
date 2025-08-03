-- Add participants_url columns to series and contests tables for RaceResult participants import
-- Run this script manually if migrations fail

-- Add participants_url column to series table
ALTER TABLE "series" ADD COLUMN IF NOT EXISTS "participants_url" text;

-- Add participants_url column to contests table
ALTER TABLE "contests" ADD COLUMN IF NOT EXISTS "participants_url" text; 