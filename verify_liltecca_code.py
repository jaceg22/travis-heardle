#!/usr/bin/env python3
"""
Verify Lil Tecca song list in code matches what should be in Supabase.
Based on the renaming we did earlier.
"""

# From the rename script output, these are the ACTUAL files that were renamed:
actual_files = {
    "WLYT": [
        "The Score",
        "DUI",
        "Weatherman",
        "Ransom",  # Was "Lil Tecca ft. Juice WRLD - Ransom"
        "Amigo",
        "Shots",
        "Bossanova",
        "Out Of Luck",
        "Count Me Out",
        "Left, Right",  # Note: has comma
        "Sidenote",
        "Did It Again",
        "Phenom",
        "Love Me",
        "Molly Girl",
        "Senorita",
    ],
    "Virgo World": [
        "Actin Up",
        "Closest To Heaven",
        "DID THAT",
        "REPEAT IT",
        "True To The Game ft. Guwop Reign",
        "Our Time",
        "YOU DON'T NEED ME NO MORE",
        "NADA",
        "MONEY ON ME",
        "When You Down ft. Lil Durk & Polo G",
        "Take 10",
        "FEE",
        "EVERYWHERE I GO",
        "Last Call",
        "Tic Toc",
        "Foreign ft. NAV",
        "Chemistry",
        "INVESTIGATION",
        "Royal Rumble",
        "Level Up",
        "MY SIDE",
        "CAUTION",
        "WHATEVER",
        "Out Of Love ft. Internet Money",
        "LOT OF ME",
        "Miss Me",
        "ABOUT YOU ft. NAV",
        "BANK TELLER",
        "Back It Up",
        "SEASIDE",
        "SHOOTERS",
        "YOU GOTTA GO DO BETTER",
        "Selection ft. Skrillex & DJ Scheme",
        "NEVER LEFT",
        "Dolly ft. Lil Uzi Vert",
        "Insecurities",
        "No Answers",
        "CHOPPA SHOOT THE LOUDEST",
        "NO DISCUSSION",
    ],
    "WLYT2": [
        "DID THAT",
        "REPEAT IT",
        "YOU DON'T NEED ME NO MORE",
        "NADA",
        "MONEY ON ME",
        "FEE",
        "EVERYWHERE I GO",
        "INVESTIGATION",
        "MY SIDE",
        "CAUTION",
        "WHATEVER",
        "LOT OF ME",
        "ABOUT YOU ft. NAV",
        "BANK TELLER",
        "SEASIDE",
        "SHOOTERS",
        "YOU GOTTA GO DO BETTER",
        "NEVER LEFT",
        "CHOPPA SHOOT THE LOUDEST",
        "NO DISCUSSION",
    ],
    "Other": [
        "All Star ft. Lil Tjay",
        "Dark Thoughts",
        "Favorite Lie",
        "Never Left",
        "Out of Love",  # Note: lowercase "of"
        "Treesha",
    ]
}

# Songs currently in the CODE:
code_songs = {
    "WLYT": [
        "Ransom",
        "Out Of Love",
        "Love Me",
        "Shots",
        "Count Me Out",
        "Did It Again",
        "Royal Rage",
        "Left Right",
        "Sidenote",
        "Amigo",
        "Glocca Morra",
        "200 My Baby",
        "IDK",
        "Bosses & Workers",
        "Came In",
        "Our Time",
    ],
    "Virgo World": [
        "Virgo World",
        "Never Left",
        "When You Down",
        "Moshpit",
        "Take 10",
        "Fallin",
        "Dolly",
        "Pressure",
        "No Answer",
        "Repeat It",
        "Tattoo",
    ],
    "WLYT2": [
        "Sunny Days",
        "Money On Me",
        "Not A Game",
        "Millionaire",
        "Lot Of Me",
        "500lbs",
        "Heartbreaker",
        "Chemistry",
        "How I Want Ya",
        "Both Of Em",
        "Understand",
        "Foreign",
    ],
    "Other": [
        "Faster",
        "Show Me Up",
        "All Star",
        "Out of Love",
        "Ransom (Remix)",
        "TEC",
        "A Million",
        "Bank Account",
    ]
}

print("=" * 80)
print("COMPARISON: CODE vs ACTUAL FILES")
print("=" * 80)

all_issues = []

for folder in ["WLYT", "Virgo World", "WLYT2", "Other"]:
    print(f"\n📁 {folder}/")
    print("-" * 80)
    
    code_list = code_songs.get(folder, [])
    actual_list = actual_files.get(folder, [])
    
    # Files in code but NOT in actual
    in_code_not_actual = set(code_list) - set(actual_list)
    if in_code_not_actual:
        print(f"\n❌ In CODE but NOT in actual files:")
        for song in sorted(in_code_not_actual):
            print(f"   - {song}.mp3")
            all_issues.append(f"{folder}/{song} - IN CODE BUT NOT IN FILES")
    
    # Files in actual but NOT in code
    in_actual_not_code = set(actual_list) - set(code_list)
    if in_actual_not_code:
        print(f"\n⚠️  In ACTUAL files but NOT in code:")
        for song in sorted(in_actual_not_code):
            print(f"   - {song}.mp3")
            all_issues.append(f"{folder}/{song} - IN FILES BUT NOT IN CODE")
    
    # Files in both (should work)
    in_both = set(code_list) & set(actual_list)
    if in_both:
        print(f"\n✓ Files in both ({len(in_both)} files):")
        for song in sorted(in_both):
            print(f"   ✓ {song}.mp3")

print("\n" + "=" * 80)
print("SUMMARY OF ISSUES:")
print("=" * 80)
if all_issues:
    for issue in all_issues:
        print(f"  - {issue}")
    print(f"\n⚠️  Total issues found: {len(all_issues)}")
else:
    print("✅ No issues found - code matches files!")

print("\n" + "=" * 80)
print("RECOMMENDATION:")
print("=" * 80)
print("\nYou need to update the code to match the ACTUAL filenames in Supabase.")
print("The code currently has placeholder songs that don't match the renamed files.")

