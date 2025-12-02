# Setup Instructions

## ✅ Completed Steps

1. **Database Setup** - You've already run `database/setup.sql` in Supabase SQL Editor
   - Tables created: `users`, `stats`, `game_history`, `speed_leaderboard`

## 📋 Next Steps

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

This will install:
- `@supabase/supabase-js` - For database access
- `bcrypt` - For password hashing
- `cors` - Already installed
- `express` - Already installed
- `socket.io` - Already installed

### 2. Set Up Environment Variables

Create a `.env` file in the `backend/` directory:

```env
SUPABASE_URL=https://ggkanqgcvvxtpdhzmoon.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
PORT=3000
```

To get your Supabase anon key:
1. Go to your Supabase project dashboard
2. Go to Settings → API
3. Copy the "anon public" key
4. Paste it in the `.env` file

### 3. Update Backend Server

The backend server already has authentication endpoints added. Make sure the Supabase client is configured with your key in `backend/server.js` (lines 7-9).

### 4. Files Already Created

- ✅ `database/setup.sql` - Database schema
- ✅ `database/setup.js` - Optional setup script
- ✅ `frontend/index.html` - Updated with login and Speed mode UI
- ✅ `frontend/script.js` - Has login functionality added
- ✅ `backend/server.js` - Has authentication endpoints
- ✅ `backend/package.json` - Updated with dependencies

### 5. Files That Need Implementation

These features are partially implemented and need completion:

1. **Speed Mode Logic** - Need to add:
   - Speed game state initialization
   - 15-round game loop
   - Timer functionality
   - Auto-progression on win
   - 3-second penalty system
   - Game over handling

2. **Stats Tracking** - Need to add:
   - Save stats after Solo games
   - Save stats after H2H games
   - Save game history for each round

3. **CSS Styling** - Need to add styles for:
   - Login/register forms
   - Speed mode UI
   - Leaderboard display
   - Game over screen

### 6. Test the Setup

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Open `frontend/index.html` in a browser (or serve it)

3. Try to register a new account

4. Test login functionality

## 🔧 Current Status

- ✅ Database tables created
- ✅ Backend authentication endpoints ready
- ✅ Frontend login UI added
- ⏳ Speed mode needs implementation
- ⏳ Stats tracking needs integration
- ⏳ CSS styling needs to be added

## 📝 Notes

- Make sure your Supabase project has Row Level Security (RLS) policies set correctly
- The default policies in `setup.sql` allow all operations - you may want to restrict this for production
- Password hashing uses bcrypt with 10 rounds
- All game stats are tracked per user and per mode

