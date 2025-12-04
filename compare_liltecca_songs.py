#!/usr/bin/env python3
"""
Script to compare Lil Tecca song names in code with actual filenames.
Helps identify mismatches that could cause audio loading issues.
"""

import re

# Songs from backend/liltecca_songs.js
code_songs = {
    "WLYT": [
        "Ransom",
        "Out Of Love",
        "Love Me",
        "Shots",
        "Count Me Out",
        "Did It Again",
        "Royal Rage",
        "Left Right",
        "Sidenote",
        "Amigo",
        "Glocca Morra",
        "200 My Baby",
        "IDK",
        "Bosses & Workers",
        "Came In",
        "Our Time",
    ],
    "Virgo World": [
        "Virgo World",
        "Never Left",
        "When You Down",
        "Moshpit",
        "Take 10",
        "Fallin",
        "Dolly",
        "Pressure",
        "No Answer",
        "Repeat It",
        "Tattoo",
    ],
    "WLYT2": [
        "Sunny Days",
        "Money On Me",
        "Not A Game",
        "Millionaire",
        "Lot Of Me",
        "500lbs",
        "Heartbreaker",
        "Chemistry",
        "How I Want Ya",
        "Both Of Em",
        "Understand",
        "Foreign",
    ],
    "Other": [
        "Faster",
        "Show Me Up",
        "All Star",
        "Out of Love",  # Note: lowercase "of" vs "Out Of Love" in WLYT
        "Ransom (Remix)",
        "TEC",
        "A Million",
        "Bank Account",
    ]
}

# From the renaming we did, let me check what the actual files were
# Based on the rename script output, here are the actual filenames we created:

print("=" * 80)
print("EXPECTED FILENAMES (based on code):")
print("=" * 80)

all_expected = {}
for folder, songs in code_songs.items():
    print(f"\n{folder}/")
    for song in songs:
        filename = f"{song}.mp3"
        print(f"  {filename}")
        # Store for comparison
        key = f"{folder}/{song}"
        all_expected[key] = filename

print("\n" + "=" * 80)
print("POTENTIAL ISSUES:")
print("=" * 80)

# Check for duplicates/case sensitivity issues
song_names = {}
for folder, songs in code_songs.items():
    for song in songs:
        lower = song.lower()
        if lower in song_names:
            print(f"⚠️  DUPLICATE: '{song}' in {folder} vs '{song_names[lower]}'")
        song_names[lower] = f"{folder}/{song}"

# Check for case differences
print("\n📝 Case differences that might cause issues:")
print("  - 'Out Of Love' (WLYT) vs 'Out of Love' (Other)")
print("  - These are different songs but similar names")

print("\n" + "=" * 80)
print("CHECKING CODE vs ACTUAL FILES:")
print("=" * 80)

# Let's also check what files exist locally if the folder exists
import os
from pathlib import Path

local_folder = Path("Lil Tecca")
if local_folder.exists():
    print(f"\n✓ Found local 'Lil Tecca' folder")
    print("\nActual files found:")
    for folder_path in local_folder.iterdir():
        if folder_path.is_dir():
            folder_name = folder_path.name
            print(f"\n{folder_name}/")
            for mp3_file in sorted(folder_path.glob("*.mp3")):
                actual_name = mp3_file.name.replace('.mp3', '')
                print(f"  {mp3_file.name}")
                
                # Check if it matches any expected song
                expected_in_folder = code_songs.get(folder_name, [])
                if actual_name in expected_in_folder:
                    print(f"    ✓ Matches code")
                else:
                    print(f"    ✗ NOT in code for {folder_name} folder")
                    # Try to find similar
                    for exp_song in expected_in_folder:
                        if exp_song.lower() == actual_name.lower():
                            print(f"    → Similar to '{exp_song}' (case difference?)")
else:
    print("\n⚠️  Local 'Lil Tecca' folder not found")
    print("   (Files may have been uploaded to Supabase already)")

print("\n" + "=" * 80)
print("SUPABASE URL FORMAT:")
print("=" * 80)
print("\nFor Lil Tecca, URLs are constructed as:")
print("  {SUPABASE_BASE}/{folder}/{songName}.mp3")
print("\nExample:")
print("  https://ggkanqgcvvxtpdhzmoon.supabase.co/storage/v1/object/public/Lil%20Tecca/WLYT/Ransom.mp3")
print("\nMake sure:")
print("  1. Folder names match exactly: WLYT, Virgo World, WLYT2, Other")
print("  2. Song names match exactly (case-sensitive)")
print("  3. File extensions are .mp3")

