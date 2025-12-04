import requests
from urllib.parse import quote, quote_plus

base_url = "https://ggkanqgcvvxtpdhzmoon.supabase.co/storage/v1/object/public/Drake"

# Files that returned 400 errors
problematic = [
    "Wants and Needs",
    "That's How You Feel",
    "Successful (feat. Trey Songz & Lil Wayne) (Bonus Track)",
    "Uptown (feat. Bun B & Lil Wayne) (Bonus Track)",
    "Redemption",
    "Too Good ft. Rihanna",
    "U With Me？",
    "Views"
]

print("Checking problematic files with different encoding methods...\n")

for song in problematic:
    print(f"Checking: {song}")
    
    # Try different encoding methods
    methods = [
        ("Standard quote", quote(song + ".mp3")),
        ("Quote plus", quote_plus(song + ".mp3")),
        ("No encoding", song + ".mp3"),
        ("Space as +", (song + ".mp3").replace(" ", "+")),
        ("Space as %20", (song + ".mp3").replace(" ", "%20")),
    ]
    
    found = False
    for method_name, encoded in methods:
        test_url = f"{base_url}/{encoded}"
        try:
            response = requests.head(test_url, timeout=5, allow_redirects=True)
            if response.status_code == 200:
                print(f"  ✅ FOUND with {method_name}: {encoded}")
                print(f"     URL: {test_url}")
                found = True
                break
            elif response.status_code != 404:
                print(f"  ⚠️  {method_name}: Status {response.status_code}")
        except Exception as e:
            print(f"  ❌ {method_name}: Error - {e}")
    
    if not found:
        print(f"  ❌ NOT FOUND with any encoding method")
    
    print()

