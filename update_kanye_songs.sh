#!/bin/bash
# Script to scan Kanye folder and update song lists

cd /Users/jacegandhi/Desktop/travis-heardle

echo "Scanning Kanye folder..."
python3 scan_kanye_files.py > kanye_songs_generated.txt 2>&1

echo ""
echo "Output saved to kanye_songs_generated.txt"
echo "Review the file and update backend/kanye_songs.js and frontend/script.js accordingly"

