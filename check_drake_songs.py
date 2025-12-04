from supabase import create_client, Client
import json
import re
import requests

# Replace these with your actual Supabase credentials
url = "https://ggkanqgcvvxtpdhzmoon.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdna2FucWdjdnZ4dHBkaHptb29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NDM5NjIsImV4cCI6MjA4MDExOTk2Mn0.4rvz934NiX4pv_6pxhYOY1ys-HUJ_7xV-BcOx4S_Hjw"

supabase = create_client(url, key)

# Get all files from the Drake bucket
print("Fetching files from Drake bucket...")
bucket_files = set()
files_response = None

# Try different bucket name variations
bucket_names_to_try = ["Drake", "drake", "DRAKE"]

for bucket_name in bucket_names_to_try:
    try:
        print(f"Trying bucket name: '{bucket_name}'...")
        # Try listing from root path explicitly
        files_response = supabase.storage.from_(bucket_name).list(path="")
        
        # Debug: print response type and structure
        print(f"   Response type: {type(files_response)}")
        if files_response is not None:
            print(f"   Response length: {len(files_response)}")
            if len(files_response) > 0:
                print(f"   First item: {files_response[0]}")
                print(f"   First item type: {type(files_response[0])}")
        
        if files_response is not None and len(files_response) > 0:
            print(f"✅ Success! Found {len(files_response)} files in '{bucket_name}' bucket")
            # Check if any are folders vs files
            folders = [f for f in files_response if f.get("metadata") is None or f.get("id") is None]
            files_list = [f for f in files_response if f.get("name") and f.get("name").endswith('.mp3')]
            print(f"   - Folders: {len(folders)}")
            print(f"   - MP3 files: {len(files_list)}")
            if len(folders) > 0:
                print(f"   - Found subfolders, checking first few...")
                for folder in folders[:3]:
                    print(f"      Checking folder: {folder.get('name', 'unknown')}")
                    try:
                        sub_files = supabase.storage.from_(bucket_name).list(path=folder.get('name', ''))
                        print(f"         Found {len(sub_files) if sub_files else 0} items")
                    except:
                        pass
            break
        elif files_response is not None:
            print(f"⚠️  Bucket '{bucket_name}' exists but is empty at root")
        else:
            print(f"❌ Bucket '{bucket_name}' returned None")
    except Exception as e:
        print(f"❌ Error with bucket '{bucket_name}': {e}")
        import traceback
        traceback.print_exc()
        continue

if files_response is None or len(files_response) == 0:
    print("\n❌ ERROR: Could not find any files in any bucket variation!")
    print("Please check:")
    print("1. The bucket name in Supabase dashboard")
    print("2. That the bucket is public")
    print("3. That files are actually uploaded")
    exit(1)

# Extract just the filenames (remove .mp3 extension for comparison)
print(f"\n=== Files in bucket (found {len(files_response)} files) ===")
for f in files_response:
    if isinstance(f, dict) and "name" in f:
        name = f["name"]
        print(name)
        # Remove .mp3 extension for comparison
        if name.endswith('.mp3'):
            bucket_files.add(name[:-4])  # Remove .mp3
        else:
            bucket_files.add(name)
    else:
        print(f"Unexpected file format: {f}")

print(f"\nTotal unique files (after removing .mp3): {len(bucket_files)}")

# Expected songs from backend/drake_songs.js (all 254 songs)
expected_songs = [
    "4PM In Calabasas", "5 Am in Toronto", "Can I", "Club Paradise", "Days in The East",
    "Draft Day", "Dreams Money Can Buy", "Free Spirit", "Girls Love Beyonce",
    "Heat Of The Moment", "How Bout Now", "I Get Lonely", "Jodeci Freestyle",
    "My Side", "Paris Morton Music", "The Motion", "The Motion (feat. Sampha)",
    "Trust Issues", "Trust Issues (Remix)", "7am On Bridle Path", "Champagne Poetry",
    "Fair Trade ft. Travis Scott", "Fountains ft. Tems", "Fcking Fans",
    "Get Along Better ft. Ty Dolla $ign", "Girls Want Girls ft. Lil Baby",
    "IMY2 ft. Kid Cudi", "In The Bible ft. Lil Durk & Giveon",
    "Knife Talk ft. 21 Savage & Project Pat", "Love All ft. Jay-Z", "N 2 Deep ft. Future",
    "No Friends In The Industry", "Papi's Home", "Pipe Down", "Race My Mind", "TSU",
    "The Remorse", "Way 2 Sexy ft. Future & Young Thug", "Yebbas Heartbreak ft. Yebba",
    "You Only Live Twice ft. Lil Wayne & Rick Ross", "Chicago Freestyle ft. Giveon",
    "Deep Pockets", "Demons ft. Fivio Foreign, Sosa Geek", "Desires ft. Future",
    "From Florida With Love", "Landed", "Losses", "Not You Too ft. Chris Brown",
    "Pain 1993 ft. Playboi Carti", "Time Flies", "Toosie Slide", "War",
    "When To Say When", "D4L", "7969 Santa", "8am in Charlotte", "All The Parties",
    "Amen", "Another Late Night", "Away From Home", "BBL Love (Interlude)",
    "Bahamas Promises", "Calling For You", "Daylight", "Drew A Picasso",
    "Fear Of Heights", "First Person Shooter", "Gently", "IDGAF", "Members Only",
    "Polar Opposites", "Rich Baby Daddy", "Screw The World (Interlude)",
    "Slime You Out", "Tried Our Best", "Virginia Beach", "What Would Pluto Do",
    "A Keeper", "Calling My Name", "Currents", "Down Hill", "Falling Back",
    "Flight's Booked", "Intro", "Jimmy Cooks", "Liability", "Massive", "Overdrive",
    "Sticky", "Texts Go Green", "Tie That Binds", "10 Bands", "6 God", "6 Man",
    "6PM In New York", "Company", "Energy", "Jungle", "Know Yourself", "Legend",
    "Madonna", "No Tellin'", "Now & Forever", "Preach", "Star67", "Used To",
    "Wednesday Night Interlude", "You & The 6", "4422", "Blem", "Can't Have Everything",
    "Do Not Disturb", "Fake Love", "Free Smoke", "Get It Together", "Glow",
    "Gyalchester", "Ice Melts", "Jorja Interlude", "KMT", "Lose You",
    "Madiba Riddim", "No Long Talk", "Nothings Into Somethings", "Passionfruit",
    "Portland", "Sacrifices", "Since Way Back", "Skepta Interlude", "Teenage Fever",
    "305 To My City", "All Me", "Come Thru", "Connect", "From Time", "Furthest Thing",
    "Hold On, We're Going Home (Album Version)", "Own It", "Pound Cake Paris Morton Music 2",
    "Started From the Bottom (Explicit Version)", "The Language", "The Motion",
    "Too Much", "Tuscan Leather", "Worst Behavior", "Wu-Tang Forever",
    "Diplomatic Immunity", "Evil Ways", "Lemon Pepper Freestyle", "Money In The Grave",
    "Omerta", "Red Button", "Stories About My Brother", "The Shoe Fits",
    "Wants and Needs", "What's Next", "Wick Man", "You Broke My Heart",
    "8 Out Of 10", "After Dark", "Blue Tint", "Cant Take A Joke", "Dont Matter To Me",
    "Elevate", "Emotionless", "Final Fantasy", "Finesse", "God's Plan", "I'm Upset",
    "In My Feelings", "Is There More", "Jaded", "March 14", "Mob Ties", "Nice For What",
    "Nonstop", "Peak", "Ratchet Happy Birthday", "Sandras Rose", "Summer Games",
    "Survival", "Talk Up", "That's How You Feel", "A Night Off", "Best I Ever Had",
    "Brand New", "Bria's Interlude", "Houstatlantavegas", "Ignant Shit",
    "Lets Call It Off", "Little Bit", "Lust For Life", "November 18th", "Outro",
    "Say Whats Real", "Sooner Than Later", "Successful", "The Calm", "Unstoppable",
    "Uptown", "Cameras Good Ones Go Interlude (Medley)", "Crew Love", "Doing It Wrong",
    "HYFR (Hell Ya Fucking Right)", "Headlines (Explicit)", "Look What You've Done",
    "Lord Knows", "Make Me Proud", "Marvins Room", "Over My Dead Body", "Practice",
    "Shot For Me", "Take Care", "The Real Her", "The Ride", "Under Ground Kings",
    "We'll Be Fine", "Fireworks (feat. Alicia Keys)", "Karaoke", "The Resistance",
    "Over", "Show Me A Good Time", "Up All Night (feat. Nicki Minaj)",
    "Fancy (feat. T.I. & Swizz Beatz)", "Shut It Down (feat. The-Dream)",
    "Unforgettable (feat. Young Jeezy)", "Light Up (feat. Jay-Z)",
    "Miss Me (feat. Lil Wayne)", "Cece's Interlude", "Find Your Love", "Thank Me Now",
    "Best I Ever Had (Bonus Track)",
    "Successful (feat. Trey Songz & Lil Wayne) (Bonus Track)",
    "Uptown (feat. Bun B & Lil Wayne) (Bonus Track)", "9AM In Dallas (Bonus Track)",
    "9", "Childs Play", "Controlla", "Faithful ft. Pimp C & dvsn", "Feel No Ways",
    "Fire & Desire", "Grammys ft. Future", "Hotline Bling", "Hype",
    "Keep the Family Close", "One Dance ft. Wizkid & Kyla", "Pop Style", "Redemption",
    "Still Here", "Too Good ft. Rihanna", "U With Me？", "Views", "Weston Road Flows",
    "With You ft. PARTYNEXTDOOR"
]

def normalize_name(name):
    """Normalize song name for comparison - lowercase, remove special chars"""
    # Convert to lowercase
    name = name.lower().strip()
    # Remove common variations
    name = name.replace("'", "").replace("'", "").replace("'", "")
    name = name.replace(" ft.", " ft").replace(" ft ", " ft ")
    name = name.replace(" & ", " and ")
    return name

# Normalize expected songs
expected_normalized = {}
for song in expected_songs:
    normalized = normalize_name(song)
    expected_normalized[normalized] = song

# Normalize bucket files
bucket_normalized = {}
for f in bucket_files:
    normalized = normalize_name(f)
    bucket_normalized[normalized] = f

print(f"\n=== Comparison Results ===")
print(f"Expected songs in code: {len(expected_songs)}")
print(f"Files in Drake bucket: {len(bucket_files)}")

# Find missing files (in code but not in bucket)
missing_in_bucket = []
for song in expected_songs:
    normalized = normalize_name(song)
    if normalized not in bucket_normalized:
        missing_in_bucket.append(song)

# Find extra files (in bucket but not in code)
extra_in_bucket = []
for f in bucket_files:
    normalized = normalize_name(f)
    if normalized not in expected_normalized:
        extra_in_bucket.append(f)

print(f"\n=== Missing in Bucket ({len(missing_in_bucket)} files) ===")
for song in sorted(missing_in_bucket):
    print(f"  ❌ {song}")

print(f"\n=== Extra in Bucket ({len(extra_in_bucket)} files) ===")
for f in sorted(extra_in_bucket):
    print(f"  ➕ {f}")

# Try fuzzy matching for extra files
print(f"\n=== Potential Matches (Extra files that might match expected songs) ===")
matched = set()
for extra in sorted(extra_in_bucket):
    if extra in matched:
        continue
    extra_lower = normalize_name(extra)
    best_match = None
    best_score = 0
    
    for song in expected_songs:
        song_lower = normalize_name(song)
        # Check if they're similar
        if extra_lower == song_lower:
            matched.add(extra)
            print(f"  ✅ '{extra}' matches '{song}'")
            break
        # Check substring matches
        if extra_lower in song_lower or song_lower in extra_lower:
            score = len(set(extra_lower.split()) & set(song_lower.split()))
            if score > best_score:
                best_score = score
                best_match = song
    
    if best_match and extra not in matched:
        print(f"  🔍 '{extra}' might match '{best_match}' (similarity score: {best_score})")

print(f"\n=== Summary ===")
matched_count = len(expected_songs) - len(missing_in_bucket)
print(f"✅ Matched: {matched_count}/{len(expected_songs)} ({matched_count*100//len(expected_songs)}%)")
print(f"❌ Missing: {len(missing_in_bucket)}")
print(f"➕ Extra files in bucket: {len(extra_in_bucket)}")
