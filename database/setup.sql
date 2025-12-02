-- Supabase Database Setup
-- Copy and paste this into Supabase SQL Editor and run it

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Stats table (tracks wins/losses per mode)
CREATE TABLE IF NOT EXISTS stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mode VARCHAR(20) NOT NULL, -- 'solo-regular', 'solo-random', 'h2h-regular', 'h2h-random'
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, mode)
);

CREATE INDEX IF NOT EXISTS idx_stats_user_id ON stats(user_id);
CREATE INDEX IF NOT EXISTS idx_stats_mode ON stats(mode);

-- Game history table (tracks individual rounds)
CREATE TABLE IF NOT EXISTS game_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mode VARCHAR(20) NOT NULL,
    song_name VARCHAR(255) NOT NULL,
    strikes INTEGER NOT NULL,
    won BOOLEAN NOT NULL,
    duration FLOAT, -- Time taken in seconds (for H2H)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_history_user_id ON game_history(user_id);
CREATE INDEX IF NOT EXISTS idx_game_history_mode ON game_history(mode);
CREATE INDEX IF NOT EXISTS idx_game_history_created_at ON game_history(created_at);

-- Speed leaderboard table
CREATE TABLE IF NOT EXISTS speed_leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL,
    total_time FLOAT NOT NULL, -- Total time in seconds
    rounds_completed INTEGER NOT NULL, -- Should be 15 for valid entries
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_speed_leaderboard_time ON speed_leaderboard(total_time);
CREATE INDEX IF NOT EXISTS idx_speed_leaderboard_rounds ON speed_leaderboard(rounds_completed);

-- Enable Row Level Security (optional, adjust as needed)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE speed_leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - you may want to restrict this)
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all on stats" ON stats FOR ALL USING (true);
CREATE POLICY "Allow all on game_history" ON game_history FOR ALL USING (true);
CREATE POLICY "Allow all on speed_leaderboard" ON speed_leaderboard FOR ALL USING (true);

