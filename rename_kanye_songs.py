#!/usr/bin/env python3
import os
import re
from pathlib import Path

KANYE_FOLDER = Path('/Users/jacegandhi/Desktop/Kanye')

# Album folder mapping
ALBUM_FOLDERS = {
    'The College Dropout': 'tcd',
    'Late Registration': 'late',
    'Graduation': 'graduation',
    "808's & Heartbreak": '808',
    'My Beautiful Dark Twisted Fantasy': 'mbdtf',
    'Yeezus': 'yeezus',
    'The Life Of Pablo': 'tlop',
    'Ye': 'ye',
    'Donda': 'donda',
    'other': 'kanye'
}

def clean_filename(filename):
    """Clean filename to match song list format: song.mp3 or song (ft. artists).mp3"""
    # Remove .mp3 extension
    name = filename.replace('.mp3', '').replace('.MP3', '')
    
    # Remove "Kanye West - ", "Kanye West, ", "Ye - ", etc.
    name = re.sub(r'^Kanye\s+West\s*[-,]\s*', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^Kanye\s+West\s+', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^Ye\s*[-,]\s*', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^Ye\s+', '', name, flags=re.IGNORECASE)
    
    # Remove special characters and prefixes
    name = re.sub(r'^¥\$,\s*', '', name)  # Remove "¥$, " prefix
    name = re.sub(r'^¥\$,\s*Kanye\s+West,\s*Ty\s+Dolla\s+\$ign\s*[-,]\s*', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^¥\$,\s*Ye,\s*Ty\s+Dolla\s+\$ign\s*[-,]\s*', '', name, flags=re.IGNORECASE)
    
    # Remove "(Official Audio)", "(Audio)", "(HD)", etc.
    name = re.sub(r'\s*\(Official[^)]*\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(Audio\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(Video\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(Music Video\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(HD\)', '', name, flags=re.IGNORECASE)
    
    # Remove [Remix] tags
    name = re.sub(r'\s*\[Remix\]', '', name, flags=re.IGNORECASE)
    
    # Format features: convert "ft.", "feat.", "featuring" to " (ft. "
    name = re.sub(r'\s+ft\.\s+', ' (ft. ', name, flags=re.IGNORECASE)
    name = re.sub(r'\s+feat\.\s+', ' (ft. ', name, flags=re.IGNORECASE)
    name = re.sub(r'\s+featuring\s+', ' (ft. ', name, flags=re.IGNORECASE)
    
    # Handle "pt. 2" or "pt 2" patterns - keep them as part of song name
    # But format them consistently
    name = re.sub(r'\s+pt\.?\s*(\d+)', r' pt. \1', name, flags=re.IGNORECASE)
    
    # If there's a feature but no closing parenthesis, add it
    if ' (ft. ' in name and not re.search(r'\(ft\.[^)]+\)', name, flags=re.IGNORECASE):
        name = name + ')'
    
    # Clean up extra whitespace
    name = ' '.join(name.split())
    
    return name

def main():
    print('Starting Kanye West song renaming process...\n')
    print(f'Folder: {KANYE_FOLDER}\n')
    
    if not KANYE_FOLDER.exists():
        print(f'Error: Folder not found: {KANYE_FOLDER}')
        return
    
    renamed_count = 0
    skipped_count = 0
    
    # Process each album folder
    for folder_name in KANYE_FOLDER.iterdir():
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

