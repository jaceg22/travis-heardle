-- Migration: Add artist column to speed_leaderboard table
-- Run this in Supabase SQL Editor to add artist support

-- Add artist column (default to 'travis' for existing records)
ALTER TABLE speed_leaderboard 
ADD COLUMN IF NOT EXISTS artist VARCHAR(10) DEFAULT 'travis';

-- Update existing records to 'travis' if null
UPDATE speed_leaderboard SET artist = 'travis' WHERE artist IS NULL;

-- Add index for artist column for better query performance
CREATE INDEX IF NOT EXISTS idx_speed_leaderboard_artist ON speed_leaderboard(artist);

-- Update stats and game_history mode columns to support longer mode names (with artist prefix)
-- They already support up to 20 characters, which should be enough for "travis-solo-regular" (19 chars)
-- But let's check if we need to increase it
ALTER TABLE stats ALTER COLUMN mode TYPE VARCHAR(50);
ALTER TABLE game_history ALTER COLUMN mode TYPE VARCHAR(50);

