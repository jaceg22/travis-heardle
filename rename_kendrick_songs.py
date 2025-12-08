#!/usr/bin/env python3
import os
import re
from pathlib import Path

KENDRICK_FOLDER = Path('/Users/jacegandhi/Desktop/travis-heardle/Kendrick')

# Album folder mapping
ALBUM_FOLDERS = {
    'Section 80': 'section',
    'good kid mAAd city': 'gkmc',
    'To Pimp A Butterfly': 'tpab',
    'DAMN.': 'damn',
    'Mr Morale and the Big Steppers': 'mmtbs',
    'gnx': 'gnx',
    'other': 'kendrick'
}

def clean_filename(filename):
    """Clean filename to match song list format: song.mp3 or song (ft. artists).mp3"""
    # Remove .mp3 extension
    name = filename.replace('.mp3', '').replace('.MP3', '')
    
    # Remove "Kendrick Lamar - ", "Kendrick Lamar, ", etc. from the beginning
    name = re.sub(r'^Kendrick\s+Lamar\s*[-,]\s*', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^Kendrick\s+Lamar\s+', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^Kendrick\s+Lamar\s*Feat\.?\s*', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^Kendrick\s+Lamar\s*,\s*', '', name, flags=re.IGNORECASE)
    
    # Remove " - Kendrick Lamar" or " - Kendrick Lamar (anything)" from anywhere in the name
    name = re.sub(r'\s*-\s*Kendrick\s+Lamar\s*\([^)]*\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*-\s*Kendrick\s+Lamar', '', name, flags=re.IGNORECASE)
    
    # Remove album-specific suffixes (but keep song name clean)
    name = re.sub(r'\s*\(DAMN\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(from[^)]*\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(good kid m\.A\.A\.d city[^)]*\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(from GNX\)', '', name, flags=re.IGNORECASE)
    
    # Remove any remaining " - Kendrick Lamar" patterns that might be in the middle
    name = re.sub(r'\s*-\s*Kendrick\s+Lamar', '', name, flags=re.IGNORECASE)
    
    # Remove "(Official Audio)", "(Audio)", "(Lyrics)", etc.
    name = re.sub(r'\s*\(Official[^)]*\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(Audio\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(Video\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(Music Video\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(Lyrics\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(HD\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(unreleased\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*Türkçe çeviri', '', name, flags=re.IGNORECASE)
    
    # Remove YouTube video IDs and other brackets
    name = re.sub(r'\s*\[.*?\]', '', name)
    name = re.sub(r'\s*"', '', name)  # Remove quotes
    
    # Format features: convert "ft.", "feat.", "featuring" to " (ft. "
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
    print('Starting Kendrick Lamar song renaming process...\n')
    print(f'Folder: {KENDRICK_FOLDER}\n')
    
    if not KENDRICK_FOLDER.exists():
        print(f'Error: Folder not found: {KENDRICK_FOLDER}')
        return
    
    renamed_count = 0
    skipped_count = 0
    
    # Process each album folder
    for folder_name in KENDRICK_FOLDER.iterdir():
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

