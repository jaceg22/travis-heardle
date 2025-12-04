#!/usr/bin/env python3
"""
Script to list and process Lil Tecca songs from Supabase bucket.
Cleans up song names by removing "lil tecca - " and "(official audio)" etc.
"""

import requests
import re
from urllib.parse import quote

SUPABASE_URL = "https://ggkanqgcvvxtpdhzmoon.supabase.co"
BUCKET_NAME = "Lil Tecca"

def clean_song_name(filename):
    """Clean up song name by removing common prefixes/suffixes."""
    # Remove .mp3 extension
    name = filename.replace('.mp3', '')
    
    # Remove "lil tecca - " or "Lil Tecca - " (case insensitive)
    name = re.sub(r'^(lil\s+)?tecca\s*-\s*', '', name, flags=re.IGNORECASE)
    
    # Remove common suffixes
    name = re.sub(r'\s*\(official\s+audio\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(official\s+video\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\[official\s+audio\]', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\[official\s+video\]', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(audio\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(video\)', '', name, flags=re.IGNORECASE)
    
    # Clean up extra spaces
    name = name.strip()
    
    return name

def list_bucket_files(folder=""):
    """List files in bucket using Supabase REST API."""
    url = f"{SUPABASE_URL}/storage/v1/object/list/{BUCKET_NAME}"
    if folder:
        url += f"/{folder}"
    
    headers = {
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdna2FucWdjdnZ4dHBkaHptb29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4MjIyMzcsImV4cCI6MjA1MDM5ODIzN30.cw1LGAaY-V8wEw3qqfqtB3NgJe5qdQw9bJcWfULgHZo"
    }
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error {response.status_code}: {response.text}")
            return []
    except Exception as e:
        print(f"Error listing files: {e}")
        return []

def main():
    """Main function to list and organize Lil Tecca songs."""
    print(f"Scanning '{BUCKET_NAME}' bucket...\n")
    
    songs_by_album = {}
    all_songs = []
    
    # List root level
    root_files = list_bucket_files("")
    print(f"Found {len(root_files)} items in root\n")
    
    for item in root_files:
        name = item.get('name', '')
        
        if name.endswith('.mp3'):
            # Song in root
            cleaned = clean_song_name(name)
            all_songs.append((cleaned, 'root', name))
            if 'root' not in songs_by_album:
                songs_by_album['root'] = []
            songs_by_album['root'].append((cleaned, name))
            print(f"Root: {name} -> {cleaned}")
        elif not name.endswith('.') and '/' not in name:
            # Likely a folder (album)
            print(f"\n--- Found folder/album: {name} ---")
            folder_files = list_bucket_files(name)
            if folder_files:
                songs_by_album[name] = []
                for song_item in folder_files:
                    song_name = song_item.get('name', '')
                    if song_name.endswith('.mp3'):
                        cleaned = clean_song_name(song_name)
                        full_path = f"{name}/{song_name}"
                        all_songs.append((cleaned, name, full_path))
                        songs_by_album[name].append((cleaned, song_name))
                        print(f"  {song_name} -> {cleaned}")
    
    # Print organized results
    print("\n" + "="*60)
    print("SONGS ORGANIZED BY ALBUM:")
    print("="*60)
    
    for album, songs in sorted(songs_by_album.items()):
        print(f"\n{album} ({len(songs)} songs):")
        for cleaned, original in sorted(songs):
            print(f"  - {cleaned}")
    
    print("\n" + "="*60)
    print("ALL SONGS (cleaned names) - FOR CODE:")
    print("="*60)
    for cleaned, album, original in sorted(all_songs):
        print(f'  "{cleaned}",')
    
    return songs_by_album, all_songs

if __name__ == "__main__":
    main()
