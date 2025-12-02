# Quick Start Guide

## ✅ Ready to Push to GitHub?

**YES!** Your files are ready. Just make sure:

1. ✅ `.gitignore` is in place (protects sensitive files)
2. ✅ All code is updated
3. ⚠️ **Set environment variables on your hosting service**

## 🚀 After Pushing to GitHub

### 1. Configure Backend on Render

Go to your Render dashboard for your backend service:

**Environment Variables to Add:**
```
SUPABASE_URL=https://ggkanqgcvvxtpdhzmoon.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
```

**Where to get SUPABASE_KEY:**
- Supabase Dashboard → Settings → API
- Copy the "anon public" key
- Paste it as `SUPABASE_KEY` value

### 2. Update Frontend Backend URL

Once backend is deployed on Render, check the URL. If it's different from `travis-heardle.onrender.com`, update:

`frontend/script.js` line 6:
```javascript
const BACKEND_URL = "https://your-actual-backend-url.onrender.com";
```

### 3. Deploy Frontend

Deploy the `frontend/` folder to Vercel/Netlify/etc.

## ⚠️ Critical: Without Environment Variables

- ❌ Backend won't connect to Supabase
- ❌ Login/Registration won't work
- ❌ Stats won't save
- ❌ Leaderboard won't work

## ✅ With Environment Variables Set

- ✅ Everything works!
- ✅ Users can register/login
- ✅ Stats save to database
- ✅ Game history tracks
- ✅ Leaderboard works

## 📝 Summary

**Can you push now?** YES!
**Will it work immediately?** NO - You need to set environment variables on Render first!

