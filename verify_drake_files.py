import requests
from urllib.parse import quote

# Expected songs from backend/drake_songs.js
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

base_url = "https://ggkanqgcvvxtpdhzmoon.supabase.co/storage/v1/object/public/Drake"

print(f"Checking {len(expected_songs)} expected songs...")
print("This may take a few minutes...\n")

found = []
missing = []
errors = []

for i, song in enumerate(expected_songs, 1):
    encoded_name = quote(song + ".mp3")
    test_url = f"{base_url}/{encoded_name}"
    
    try:
        response = requests.head(test_url, timeout=10, allow_redirects=True)
        if response.status_code == 200:
            found.append(song)
            print(f"[{i}/{len(expected_songs)}] ✅ {song}")
        elif response.status_code == 404:
            missing.append(song)
            print(f"[{i}/{len(expected_songs)}] ❌ {song} - NOT FOUND")
        else:
            errors.append((song, response.status_code))
            print(f"[{i}/{len(expected_songs)}] ⚠️  {song} - Status {response.status_code}")
    except Exception as e:
        errors.append((song, str(e)))
        print(f"[{i}/{len(expected_songs)}] ⚠️  {song} - Error: {e}")

print(f"\n=== Summary ===")
print(f"✅ Found: {len(found)}/{len(expected_songs)} ({len(found)*100//len(expected_songs)}%)")
print(f"❌ Missing: {len(missing)}")
print(f"⚠️  Errors: {len(errors)}")

if missing:
    print(f"\n=== Missing Files ({len(missing)}) ===")
    for song in missing:
        print(f"  - {song}")

if errors:
    print(f"\n=== Errors ({len(errors)}) ===")
    for song, error in errors[:10]:  # Show first 10
        print(f"  - {song}: {error}")

