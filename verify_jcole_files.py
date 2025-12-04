import requests
from urllib.parse import quote

# Expected J. Cole songs from backend/jcole_songs.js - we'll need to check a few to see if they load
# Let me check a sample of J. Cole songs
test_songs = [
    "No Role Modelz",
    "Work Out",
    "Crooked Smile",
    "Middle Child",
    "Love Yourz",
    "Wet Dreamz",
    "G.O.M.D.",
    "Apparently",
    "Neighbors",
    "03 Adolescence"
]

base_url = "https://ggkanqgcvvxtpdhzmoon.supabase.co/storage/v1/object/public/JCole"

print(f"Testing J. Cole bucket access...")
print("Testing a sample of songs to verify bucket is working...\n")

found = []
missing = []
errors = []

for song in test_songs:
    encoded_name = quote(song + ".mp3")
    test_url = f"{base_url}/{encoded_name}"
    
    try:
        response = requests.head(test_url, timeout=10, allow_redirects=True)
        if response.status_code == 200:
            found.append(song)
            print(f"✅ {song}")
        elif response.status_code == 404:
            missing.append(song)
            print(f"❌ {song} - NOT FOUND")
        else:
            errors.append((song, response.status_code))
            print(f"⚠️  {song} - Status {response.status_code}")
    except Exception as e:
        errors.append((song, str(e)))
        print(f"⚠️  {song} - Error: {e}")

print(f"\n=== Summary ===")
print(f"✅ Found: {len(found)}/{len(test_songs)}")
print(f"❌ Missing: {len(missing)}")
print(f"⚠️  Errors: {len(errors)}")

if len(found) == 0:
    print("\n⚠️  No files found! This could mean:")
    print("1. The bucket name might be different (try 'J Cole' with space, or 'jcole' lowercase)")
    print("2. The bucket might not be public")
    print("3. Files might not be uploaded yet")

