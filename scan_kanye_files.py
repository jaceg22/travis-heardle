#!/usr/bin/env python3
import os
from pathlib import Path
import sys

KANYE_FOLDER = Path('/Users/jacegandhi/Desktop/Kanye')

# Album folder mapping
ALBUM_MAP = {
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

def scan_folder():
    output = []
    output.append('Scanning Kanye West folder for current files...\n')
    
    if not KANYE_FOLDER.exists():
        output.append(f'Error: Folder not found: {KANYE_FOLDER}')
        print('\n'.join(output))
        return
    
    songs_by_album = {}
    for album in ALBUM_MAP.keys():
        songs_by_album[album] = []
    
    # Scan each album folder
    for folder_name in sorted(KANYE_FOLDER.iterdir()):
        if not folder_name.is_dir():
            continue
        
        folder_path = folder_name
        album_key = folder_name.name
        
        if album_key not in ALBUM_MAP:
            album_key = 'other'
        
        output.append(f'Scanning {folder_name.name}...')
        
        mp3_files = sorted(folder_path.glob('*.mp3'))
        for mp3_file in mp3_files:
            song_name = mp3_file.stem  # Get filename without extension
            songs_by_album[album_key].append(song_name)
            output.append(f'  {song_name}')
        
        output.append(f'  Found {len(mp3_files)} songs\n')
    
    # Generate backend code
    output.append('=' * 60)
    output.append('BACKEND CODE (backend/kanye_songs.js):')
    output.append('=' * 60)
    output.append('\nexport const kanyeSongs = [')
    
    for album_name, album_code in ALBUM_MAP.items():
        if songs_by_album[album_name]:
            output.append(f'  // {album_name}')
            for song in sorted(songs_by_album[album_name]):
                output.append(f'  "{song}",')
            output.append('')
    
    output.append('];\n')
    output.append('export const kanyeAlbumMap = {')
    
    for album_name, album_code in ALBUM_MAP.items():
        if songs_by_album[album_name]:
            output.append(f'  // {album_name} - {album_code}.jpg')
            for song in sorted(songs_by_album[album_name]):
                output.append(f'  "{song}": "{album_code}",')
            output.append('')
    
    output.append('};')
    
    # Generate frontend code
    output.append('\n' + '=' * 60)
    output.append('FRONTEND CODE (frontend/script.js - KANYE_SONGS array):')
    output.append('=' * 60)
    output.append('\nconst KANYE_SONGS = [')
    
    for album_name, album_code in ALBUM_MAP.items():
        if songs_by_album[album_name]:
            output.append(f'  // {album_name}')
            for song in sorted(songs_by_album[album_name]):
                output.append(f'  "{song}",')
            output.append('')
    
    output.append('];\n')
    output.append('const KANYE_ALBUM_COVERS = {')
    
    for album_name, album_code in ALBUM_MAP.items():
        if songs_by_album[album_name]:
            output.append(f'  // {album_name} - {album_code}.jpg')
            for song in sorted(songs_by_album[album_name]):
                output.append(f'  "{song}": "{album_code}",')
            output.append('')
    
    output.append('};')
    
    # Summary
    total = sum(len(songs) for songs in songs_by_album.values())
    output.append(f'\nTotal songs: {total}')
    
    # Print and write to file
    result = '\n'.join(output)
    print(result)
    
    # Also write to file
    with open('/tmp/kanye_songs_output.txt', 'w') as f:
        f.write(result)
    
    print('\n\nOutput also saved to /tmp/kanye_songs_output.txt')

if __name__ == '__main__':
    scan_folder()

