#!/usr/bin/env python3
import os
from pathlib import Path

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
    print('Scanning Kanye West folder for current files...\n')
    
    if not KANYE_FOLDER.exists():
        print(f'Error: Folder not found: {KANYE_FOLDER}')
        return
    
    songs_by_album = {}
    for album in ALBUM_MAP.keys():
        songs_by_album[album] = []
    
    # Scan each album folder
    for folder_name in KANYE_FOLDER.iterdir():
        if not folder_name.is_dir():
            continue
        
        folder_path = folder_name
        album_key = folder_name.name
        
        if album_key not in ALBUM_MAP:
            album_key = 'other'
        
        print(f'Scanning {folder_name.name}...')
        
        mp3_files = list(folder_path.glob('*.mp3'))
        for mp3_file in mp3_files:
            song_name = mp3_file.stem  # Get filename without extension
            songs_by_album[album_key].append(song_name)
            print(f'  {song_name}')
        
        print(f'  Found {len(mp3_files)} songs\n')
    
    # Generate backend code
    print('=' * 60)
    print('BACKEND CODE (backend/kanye_songs.js):')
    print('=' * 60)
    print('\nexport const kanyeSongs = [')
    
    for album_name, album_code in ALBUM_MAP.items():
        if songs_by_album[album_name]:
            if album_name == "808's & Heartbreak":
                print(f"  // {album_name}")
            else:
                print(f'  // {album_name}')
            for song in sorted(songs_by_album[album_name]):
                print(f'  "{song}",')
            print('')
    
    print('];\n')
    print('export const kanyeAlbumMap = {')
    
    for album_name, album_code in ALBUM_MAP.items():
        if songs_by_album[album_name]:
            print(f'  // {album_name} - {album_code}.jpg')
            for song in sorted(songs_by_album[album_name]):
                print(f'  "{song}": "{album_code}",')
            print('')
    
    print('};')
    
    # Generate frontend code
    print('\n' + '=' * 60)
    print('FRONTEND CODE (frontend/script.js - KANYE_SONGS array):')
    print('=' * 60)
    print('\nconst KANYE_SONGS = [')
    
    for album_name, album_code in ALBUM_MAP.items():
        if songs_by_album[album_name]:
            if album_name == "808's & Heartbreak":
                print(f"  // {album_name}")
            else:
                print(f'  // {album_name}')
            for song in sorted(songs_by_album[album_name]):
                print(f'  "{song}",')
            print('')
    
    print('];\n')
    print('const KANYE_ALBUM_COVERS = {')
    
    for album_name, album_code in ALBUM_MAP.items():
        if songs_by_album[album_name]:
            print(f'  // {album_name} - {album_code}.jpg')
            for song in sorted(songs_by_album[album_name]):
                print(f'  "{song}": "{album_code}",')
            print('')
    
    print('};')
    
    # Summary
    total = sum(len(songs) for songs in songs_by_album.values())
    print(f'\nTotal songs: {total}')

if __name__ == '__main__':
    scan_folder()

