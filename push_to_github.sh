#!/bin/bash

# Complete git push script for Travis Heardle
# This adds all necessary files and pushes to GitHub

echo "Adding all files..."

# Add .gitignore first (important!)
git add .gitignore

# Add backend files
git add backend/server.js
git add backend/package.json

# Add frontend files
git add frontend/index.html
git add frontend/script.js
git add frontend/style.css
git add frontend/config.js

# Add database setup files
git add database/setup.sql
git add database/setup.js

# Add documentation files
git add README.md
git add SETUP_INSTRUCTIONS.md
git add DEPLOYMENT_CHECKLIST.md
git add QUICK_START.md
git add IMPLEMENTATION_STATUS.md

# Commit everything
echo "Committing all changes..."
git commit -m "Add login system, Speed mode UI, database setup, and authentication endpoints"

# Push to GitHub
echo "Pushing to GitHub..."
git push origin main --force

echo "✅ Done! All files pushed to GitHub."

