# Deployment Checklist

## ✅ Before Pushing to GitHub

### 1. Check `.gitignore` is in place
- ✅ Created `.gitignore` to exclude:
  - `.env` files (sensitive credentials)
  - `node_modules/`
  - Other sensitive/local files

### 2. Files Ready to Push
- ✅ All code files updated
- ✅ Database schema ready
- ✅ Frontend and backend code complete

## ⚠️ What You CAN'T Push (and shouldn't!)

1. **`.env` files** - Contains sensitive keys
   - These are in `.gitignore` ✅

2. **`node_modules/`** - Dependencies (can be reinstalled)
   - In `.gitignore` ✅

## 🔧 What to Set Up on Your Hosting Service

### Backend (Render/Vercel/Railway)

1. **Environment Variables** - Set these in your hosting dashboard:
   ```
   SUPABASE_URL=https://ggkanqgcvvxtpdhzmoon.supabase.co
   SUPABASE_KEY=your_supabase_anon_key_here
   PORT=3000 (or whatever port your service uses)
   ```

2. **Build Command** (if needed):
   ```bash
   cd backend && npm install
   ```

3. **Start Command**:
   ```bash
   cd backend && npm start
   ```

### Frontend (Vercel/Netlify/etc.)

1. **No environment variables needed** (frontend uses hardcoded URLs)
2. **Build Command** (if needed):
   ```bash
   # Static files - no build needed, just deploy the frontend/ folder
   ```

3. **Publish Directory**: `frontend/`

## 📋 Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add login system, Speed mode UI, and database setup"
git push
```

### Step 2: Configure Backend on Render

1. Go to Render dashboard
2. Create/update your backend service
3. Connect to your GitHub repo
4. Set environment variables:
   - `SUPABASE_URL` = `https://ggkanqgcvvxtpdhzmoon.supabase.co`
   - `SUPABASE_KEY` = Your Supabase anon key
   - `PORT` = Auto-set by Render (usually 10000)
5. Deploy!

### Step 3: Update Frontend Backend URL

Once your backend is deployed, update `frontend/script.js` line 6:
```javascript
const BACKEND_URL = "https://your-backend-service.onrender.com";
```

Or use your Render backend URL if different from `travis-heardle.onrender.com`.

### Step 4: Deploy Frontend

Deploy the `frontend/` folder to Vercel/Netlify/etc.

## ⚠️ Important Notes

1. **Supabase Key**: Make sure you use the **anon key**, not the service role key
   - Get it from: Supabase Dashboard → Settings → API → "anon public" key

2. **Database**: Make sure your Supabase database has the tables:
   - Run `database/setup.sql` if you haven't already ✅

3. **RLS Policies**: The setup.sql includes permissive RLS policies
   - You may want to restrict these for production

4. **CORS**: Backend already has CORS enabled for all origins
   - For production, you might want to restrict to your frontend domain

## 🚀 Quick Test After Deployment

1. Visit your frontend URL
2. Try registering a new account
3. Try logging in
4. Test a Solo game

## ✅ Ready to Deploy?

After setting environment variables on your hosting service, everything should work!

