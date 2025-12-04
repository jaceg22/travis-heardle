#!/usr/bin/env python3
"""
Script to rename Lil Tecca song files to clean filenames.
Removes prefixes like "Lil Tecca - ", YouTube codes [xxx], and suffixes.
"""

import os
import re
from pathlib import Path

def clean_song_name(filename):
    """Clean up song name by removing common prefixes/suffixes."""
    # Remove .mp3 extension
    name = filename.replace('.mp3', '')
    
    # Remove "Lil Tecca - " or "LIL TECCA - " prefix (case insensitive)
    name = re.sub(r'^(lil\s+)?tecca\s*-\s*', '', name, flags=re.IGNORECASE)
    
    # Handle "Lil Tecca ft. Artist - Song" pattern -> "Song ft. Artist"
    match = re.match(r'^(lil\s+)?tecca\s+(ft\.|feat\.)\s*(.+?)\s*-\s*(.+)$', name, re.IGNORECASE)
    if match:
        artist = match.group(3).strip()
        song = match.group(4).strip()
        name = f"{song} ft. {artist}"
    
    # Remove "Lil Tecca ft." or "Lil Tecca feat." from beginning if pattern doesn't match above
    name = re.sub(r'^(lil\s+)?tecca\s+(ft\.|feat\.)\s*', '', name, flags=re.IGNORECASE)
    
    # Remove YouTube codes like [pjY6X9b1ZMQ] or [ievcrvcvr]
    name = re.sub(r'\s*\[[^\]]+\]', '', name)
    
    # Remove common suffixes in parentheses
    name = re.sub(r'\s*\(official\s+audio\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(official\s+video\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(official\s+visualizer\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(lyrics\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(audio\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(video\)', '', name, flags=re.IGNORECASE)
    
    # Remove "(Virgo World)" or similar album name in quotes or parentheses
    name = re.sub(r'\s*[\(（]?[""]?virgo\s+world[""]?[\)）]?', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*[\(（]?[""]?wlyt[""]?[\)）]?', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*[\(（]?[""]?wlyt2[""]?[\)）]?', '', name, flags=re.IGNORECASE)
    
    # Remove trailing suffixes like "- Lil Tecca (youtube)" or "- Internet Money (youtube)"
    name = re.sub(r'\s*-\s*[^(]+\(youtube\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*-\s*[^(]+\([^)]*\)\s*$', '', name)
    
    # Remove special quote characters (full-width quotes)
    name = name.replace('＂', '').replace('"', '')
    
    # Remove "feat." variations and normalize to "ft."
    name = re.sub(r'\bfeat\.?\s*', 'ft. ', name, flags=re.IGNORECASE)
    
    # Clean up extra spaces
    name = re.sub(r'\s+', ' ', name)
    name = name.strip()
    
    return name

def rename_songs_in_directory(base_dir):
    """Rename all MP3 files in the Lil Tecca directory structure."""
    base_path = Path(base_dir) / "Lil Tecca"
    
    if not base_path.exists():
        print(f"Directory {base_path} not found!")
        return
    
    renamed_count = 0
    skipped_count = 0
    
    # Walk through all directories
    for folder_path in base_path.iterdir():
        if not folder_path.is_dir():
            continue
            
        folder_name = folder_path.name
        print(f"\nProcessing folder: {folder_name}")
        print("-" * 60)
        
        for mp3_file in folder_path.glob("*.mp3"):
            original_name = mp3_file.name
            cleaned_name = clean_song_name(original_name)
            new_name = f"{cleaned_name}.mp3"
            new_path = mp3_file.parent / new_name
            
            # Skip if name hasn't changed
            if original_name == new_name:
                print(f"  ✓ {original_name} (already clean)")
                skipped_count += 1
                continue
            
            # Check if target file already exists
            if new_path.exists() and new_path != mp3_file:
                print(f"  ⚠ {original_name}")
                print(f"    -> {new_name} (SKIPPED: file already exists)")
                skipped_count += 1
                continue
            
            try:
                mp3_file.rename(new_path)
                print(f"  ✓ {original_name}")
                print(f"    -> {new_name}")
                renamed_count += 1
            except Exception as e:
                print(f"  ✗ {original_name}")
                print(f"    ERROR: {e}")
    
    print("\n" + "=" * 60)
    print(f"Summary:")
    print(f"  Renamed: {renamed_count}")
    print(f"  Skipped: {skipped_count}")
    print(f"  Total: {renamed_count + skipped_count}")

if __name__ == "__main__":
    # Get the directory where the script is located
    script_dir = Path(__file__).parent
    rename_songs_in_directory(script_dir)

