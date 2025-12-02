// Database setup script for Supabase
// Run this with: node database/setup.js
// Make sure to set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || "https://ggkanqgcvvxtpdhzmoon.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "YOUR_SERVICE_KEY_HERE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupDatabase() {
    console.log("Setting up database tables...\n");

    try {
        // Create users table
        console.log("Creating users table...");
        const { data: usersTable, error: usersError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS users (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );

                CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
            `
        });

        if (usersError) {
            console.error("Error creating users table (may already exist):", usersError.message);
        } else {
            console.log("✓ Users table created");
        }

        // Create stats table
        console.log("\nCreating stats table...");
        const { data: statsTable, error: statsError } = await supabase.rpc('exec_sql', {
            sql: `
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
            `
        });

        if (statsError) {
            console.error("Error creating stats table (may already exist):", statsError.message);
        } else {
            console.log("✓ Stats table created");
        }

        // Create game_history table
        console.log("\nCreating game_history table...");
        const { data: historyTable, error: historyError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS game_history (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    mode VARCHAR(20) NOT NULL,
                    song_name VARCHAR(255) NOT NULL,
                    strikes INTEGER NOT NULL,
                    won BOOLEAN NOT NULL,
                    duration FLOAT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );

                CREATE INDEX IF NOT EXISTS idx_game_history_user_id ON game_history(user_id);
                CREATE INDEX IF NOT EXISTS idx_game_history_mode ON game_history(mode);
                CREATE INDEX IF NOT EXISTS idx_game_history_created_at ON game_history(created_at);
            `
        });

        if (historyError) {
            console.error("Error creating game_history table (may already exist):", historyError.message);
        } else {
            console.log("✓ Game history table created");
        }

        // Create speed_leaderboard table
        console.log("\nCreating speed_leaderboard table...");
        const { data: leaderboardTable, error: leaderboardError } = await supabase.rpc('exec_sql', {
            sql: `
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
            `
        });

        if (leaderboardError) {
            console.error("Error creating speed_leaderboard table (may already exist):", leaderboardError.message);
        } else {
            console.log("✓ Speed leaderboard table created");
        }

        console.log("\n✅ Database setup complete!");
        console.log("\nNOTE: If you see errors about 'exec_sql' function, you need to:");
        console.log("1. Go to Supabase SQL Editor");
        console.log("2. Run the SQL commands manually from the SQL file in this directory");
        
    } catch (error) {
        console.error("\n❌ Error setting up database:", error);
        console.log("\nAlternative: Use the SQL file directly in Supabase SQL Editor");
    }
}

// Alternative: SQL file for direct execution in Supabase
const SQL_SETUP = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Stats table
CREATE TABLE IF NOT EXISTS stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mode VARCHAR(20) NOT NULL,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, mode)
);

CREATE INDEX IF NOT EXISTS idx_stats_user_id ON stats(user_id);
CREATE INDEX IF NOT EXISTS idx_stats_mode ON stats(mode);

-- Game history table
CREATE TABLE IF NOT EXISTS game_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mode VARCHAR(20) NOT NULL,
    song_name VARCHAR(255) NOT NULL,
    strikes INTEGER NOT NULL,
    won BOOLEAN NOT NULL,
    duration FLOAT,
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
    total_time FLOAT NOT NULL,
    rounds_completed INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_speed_leaderboard_time ON speed_leaderboard(total_time);
CREATE INDEX IF NOT EXISTS idx_speed_leaderboard_rounds ON speed_leaderboard(rounds_completed);
`;

setupDatabase().then(() => {
    console.log("\nSQL for manual setup (if needed):\n");
    console.log(SQL_SETUP);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});

