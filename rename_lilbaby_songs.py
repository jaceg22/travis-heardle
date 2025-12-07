#!/usr/bin/env python3
import os
import re
from pathlib import Path

LILBABY_FOLDER = Path('/Users/jacegandhi/Desktop/Lil Baby')

# Album folder mapping
ALBUM_FOLDERS = {
    'My Turn': 'myturn',
    'Too Hard': 'toohard',
    'Harder Than Ever': 'harderthanever',
    'Drip Harder': 'dripharder',
    "It's Only Me": 'itsonlyme',
    'other': 'lilbaby'
}

def clean_filename(filename):
    """Clean filename to match song list format"""
    # Remove .mp3 extension
    name = filename.replace('.mp3', '').replace('.MP3', '')
    
    # Remove "Lil Baby - ", "Lil Baby, ", etc.
    name = re.sub(r'^Lil\s+Baby\s*[-,]\s*', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^Lil\s+Baby\s+', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^Lil\s+Baby\s*Feat\.?\s*', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^Lil\s+Baby\s*x\s*', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^Lil\s+Baby\s*&\s*', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^Lil\s+Baby\s*,\s*', '', name, flags=re.IGNORECASE)
    
    # Remove album-specific suffixes
    name = re.sub(r'\s*\(Harder Than Ever\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(Too Hard\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(My Turn\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(Drip Harder\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(It\'s Only Me\)', '', name, flags=re.IGNORECASE)
    
    # Remove "(Official Audio)", "(Audio)", etc.
    name = re.sub(r'\s*\(Official[^)]*\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(Audio\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(Video\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(Music Video\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(On Me Challenge\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(from[^)]*\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(432Hz\)', '', name, flags=re.IGNORECASE)  # Remove "(432Hz)" from It's Only Me files
    name = re.sub(r'\(432Hz\)', '', name, flags=re.IGNORECASE)  # Also handle cases where it's not preceded by space
    
    # Fix malformed parentheses (e.g., "Song (ft. Artist (432Hz)" -> "Song (ft. Artist)")
    name = re.sub(r'\(([^)]*)\s*\(432Hz\)', r'(\1)', name, flags=re.IGNORECASE)
    
    # Format features: convert "Ft.", "ft.", "feat." to " (ft. "
    name = re.sub(r'\s+Ft\.\s+', ' (ft. ', name)
    name = re.sub(r'\s+ft\.\s+', ' (ft. ', name, flags=re.IGNORECASE)
    name = re.sub(r'\s+feat\.\s+', ' (ft. ', name, flags=re.IGNORECASE)
    name = re.sub(r'\s+featuring\s+', ' (ft. ', name, flags=re.IGNORECASE)
    
    # If there's a feature but no closing parenthesis, add it
    if ' (ft. ' in name and not re.search(r'\(ft\.[^)]+\)', name, flags=re.IGNORECASE):
        name = name + ')'
    
    # Clean up extra whitespace
    name = ' '.join(name.split())
    
    return name

def main():
    print('Starting Lil Baby song renaming process...\n')
    print(f'Folder: {LILBABY_FOLDER}\n')
    
    if not LILBABY_FOLDER.exists():
        print(f'Error: Folder not found: {LILBABY_FOLDER}')
        return
    
    renamed_count = 0
    skipped_count = 0
    
    # Process each album folder
    for folder_name in LILBABY_FOLDER.iterdir():
        if not folder_name.is_dir():
            continue
        
        folder_path = folder_name
        print(f'Processing {folder_name.name}...')
        
        for mp3_file in folder_path.glob('*.mp3'):
            old_name = mp3_file.name
            cleaned_name = clean_filename(old_name)
            new_name = f'{cleaned_name}.mp3'
            new_path = folder_path / new_name
            
            if old_name == new_name:
                print(f'  ✓ Already formatted: {old_name}')
                skipped_count += 1
                continue
            
            if new_path.exists() and new_path != mp3_file:
                print(f'  ⚠ Skipping {old_name} - {new_name} already exists')
                skipped_count += 1
                continue
            
            try:
                mp3_file.rename(new_path)
                print(f'  ✓ Renamed: {old_name} → {new_name}')
                renamed_count += 1
            except Exception as e:
                print(f'  ✗ Error renaming {old_name}: {e}')
    
    print(f'\n═══════════════════════════════════════════════════════')
    print(f'Summary:')
    print(f'  Renamed: {renamed_count} files')
    print(f'  Skipped: {skipped_count} files')
    print(f'═══════════════════════════════════════════════════════\n')

if __name__ == '__main__':
    main()

