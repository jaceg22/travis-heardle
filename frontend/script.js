// ---------------------------
// CONFIG
// ---------------------------
// Cloudflare R2 Configuration
// Each bucket has its own public development URL from R2 dashboard

// R2 Public URLs for each bucket
const R2_PUBLIC_URLS = {
    travis: 'https://pub-8ae2a9bcf0924a44ba373e8e64badd68.r2.dev',
    drake: 'https://pub-f23f1ecab6c7445e8a19980474554deb.r2.dev',
    liltecca: 'https://pub-c30b681927a64769b6f6abe522f33b80.r2.dev',
    bbbm: 'https://pub-9e5222dfa3a94b5487bacd2300d24648.r2.dev',
    album: 'https://pub-7afdb7ae46e64d4981ebeda51a6cec5d.r2.dev',
    // New artists (buckets created, songs to be added later)
    kanye: 'https://pub-0b4313b4af4b4a9a9318b78e80af6cc2.r2.dev',
    kendrick: 'https://pub-af106888801c475e8fe5d07a3e5983d5.r2.dev',
    'lil-baby': 'https://pub-9301e2ae621f453aa6a6cc123575606c.r2.dev'
};

const BACKEND_URL = "https://travis-heardle.onrender.com";

// R2 Bucket names (for reference, not used in URL construction)
const R2_BUCKETS = {
    travis: 'songs',
    drake: 'drake',
    liltecca: 'lil-tecca',
    bbbm: 'bbbm',
    album: 'album',
    kanye: 'kanye',
    kendrick: 'kendrick',
    'lil-baby': 'lil-baby'
};

// Legacy variables for compatibility
let SUPABASE_BASE = R2_PUBLIC_URLS.travis || '';
const SUPABASE_COVERS_BASE = R2_PUBLIC_URLS.album || '';

// ---------------------------
// USER AUTHENTICATION STATE
// ---------------------------
let currentUser = null;
let selectedArtist = null; // 'travis', 'drake', 'bbbm', 'liltecca', or 'chooserappers'
let selectedRappers = ['travis', 'drake', 'liltecca']; // Array of selected rappers for 'chooserappers' mode

// Check if user is logged in from localStorage
function initAuth() {
    const savedUser = localStorage.getItem('currentUser');
    const skipLogin = localStorage.getItem('skipLogin');
    const savedArtist = localStorage.getItem('selectedArtist');
    
    // Set selectedArtist from localStorage if it exists (for initialization)
    if (savedArtist) {
        selectedArtist = savedArtist;
        if (savedArtist === 'chooserappers') {
            const savedRappers = localStorage.getItem('selectedRappers');
            if (savedRappers) {
                try {
                    selectedRappers = JSON.parse(savedRappers);
                } catch (e) {
                    selectedRappers = ['travis', 'drake', 'liltecca'];
                }
            }
        }
    }
    
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            localStorage.removeItem('skipLogin'); // Clear skip flag if user logs in
            // Always show artist selection first to let user choose
            showArtistSelection();
        } catch (e) {
            localStorage.removeItem('currentUser');
            showLoginPage();
        }
    } else if (skipLogin === 'true') {
        // User previously skipped login
        currentUser = null;
        // Always show artist selection first to let user choose
        showArtistSelection();
    } else {
        showLoginPage();
    }
}

function showLoginPage() {
    document.getElementById("loginPage").style.display = "block";
    document.getElementById("artistSelection").style.display = "none";
    document.getElementById("chooseRappers").style.display = "none";
    document.getElementById("home").style.display = "none";
    document.getElementById("soloGame").style.display = "none";
    document.getElementById("h2hMenu").style.display = "none";
    document.getElementById("h2hGame").style.display = "none";
    document.getElementById("speedGame").style.display = "none";
    document.getElementById("speedGameOver").style.display = "none";
    document.getElementById("speedLeaderboard").style.display = "none";
}

function showArtistSelection() {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("artistSelection").style.display = "block";
    document.getElementById("chooseRappers").style.display = "none";
    document.getElementById("home").style.display = "none";
    document.getElementById("soloGame").style.display = "none";
    document.getElementById("h2hMenu").style.display = "none";
    document.getElementById("h2hGame").style.display = "none";
    document.getElementById("speedGame").style.display = "none";
    document.getElementById("speedGameOver").style.display = "none";
    document.getElementById("speedLeaderboard").style.display = "none";
}

function showChooseRappersPage() {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("artistSelection").style.display = "none";
    document.getElementById("chooseRappers").style.display = "block";
    document.getElementById("home").style.display = "none";
    document.getElementById("soloGame").style.display = "none";
    document.getElementById("h2hMenu").style.display = "none";
    document.getElementById("h2hGame").style.display = "none";
    document.getElementById("speedGame").style.display = "none";
    document.getElementById("speedGameOver").style.display = "none";
    document.getElementById("speedLeaderboard").style.display = "none";
    
    // Load saved rappers or default to all checked
    const savedRappers = localStorage.getItem('selectedRappers');
    if (savedRappers) {
        try {
            selectedRappers = JSON.parse(savedRappers);
        } catch (e) {
            selectedRappers = ['travis', 'drake', 'liltecca'];
        }
    }
    
    // Update checkboxes
    document.getElementById("travisCheckbox").checked = selectedRappers.includes('travis');
    document.getElementById("drakeCheckbox").checked = selectedRappers.includes('drake');
    document.getElementById("lilteccaCheckbox").checked = selectedRappers.includes('liltecca');
}

function showHomePage() {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("artistSelection").style.display = "none";
    document.getElementById("chooseRappers").style.display = "none";
    document.getElementById("home").style.display = "block";
    document.getElementById("soloGame").style.display = "none";
    document.getElementById("h2hMenu").style.display = "none";
    document.getElementById("h2hGame").style.display = "none";
    document.getElementById("speedGame").style.display = "none";
    document.getElementById("speedGameOver").style.display = "none";
    document.getElementById("speedLeaderboard").style.display = "none";
    
    // Update title based on selected artist
    if (selectedArtist === 'drake') {
        document.querySelector("#home h1").textContent = "Drake Heardle";
    } else if (selectedArtist === 'bbbm') {
        document.querySelector("#home h1").textContent = "Big Black Banana Man Heardle";
    } else if (selectedArtist === 'liltecca') {
        document.querySelector("#home h1").textContent = "Lil Tecca Heardle";
    } else if (selectedArtist === 'chooserappers') {
        const rapperNames = selectedRappers.map(r => {
            if (r === 'travis') return 'Travis Scott';
            if (r === 'drake') return 'Drake';
            if (r === 'liltecca') return 'Lil Tecca';
            return r;
        }).join(' & ');
        document.querySelector("#home h1").textContent = `${rapperNames} Heardle`;
    } else {
        document.querySelector("#home h1").textContent = "Travis Scott Heardle";
    }
    
    if (currentUser) {
        document.getElementById("loggedInUser").textContent = `Logged in as: ${currentUser.username}`;
        document.getElementById("logoutBtn").style.display = "block";
    } else {
        const skipLogin = localStorage.getItem('skipLogin');
        if (skipLogin === 'true') {
            document.getElementById("loggedInUser").textContent = "Playing without account (stats not recorded)";
            document.getElementById("logoutBtn").style.display = "none";
        } else {
            document.getElementById("loggedInUser").textContent = "";
            document.getElementById("logoutBtn").style.display = "none";
        }
    }
}

// ---------------------------
// LOGIN/REGISTER HANDLERS
// ---------------------------
document.getElementById("showRegisterBtn").onclick = () => {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "block";
    document.getElementById("loginError").textContent = "";
};

document.getElementById("showLoginBtn").onclick = () => {
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("registerError").textContent = "";
};

document.getElementById("registerBtn").onclick = async () => {
    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("registerConfirmPassword").value;
    const errorDiv = document.getElementById("registerError");
    
    errorDiv.textContent = "";
    
    if (!username || !password) {
        errorDiv.textContent = "Please fill in all fields";
        return;
    }
    
    if (password !== confirmPassword) {
        errorDiv.textContent = "Passwords do not match";
        return;
    }
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            errorDiv.textContent = data.error || "Registration failed";
            return;
        }
        
        // Registration successful, auto-login
        currentUser = data.user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Check if artist is already selected
        const savedArtist = localStorage.getItem('selectedArtist');
        if (savedArtist) {
            selectedArtist = savedArtist;
            showHomePage();
        } else {
            showArtistSelection();
        }
    } catch (error) {
        errorDiv.textContent = "Registration failed. Please try again.";
        console.error("Registration error:", error);
    }
};

document.getElementById("loginBtn").onclick = async () => {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;
    const errorDiv = document.getElementById("loginError");
    
    errorDiv.textContent = "";
    
    if (!username || !password) {
        errorDiv.textContent = "Please fill in all fields";
        return;
    }
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            errorDiv.textContent = data.error || "Login failed";
            return;
        }
        
        // Login successful
        currentUser = data.user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Check if artist is already selected
        const savedArtist = localStorage.getItem('selectedArtist');
        if (savedArtist) {
            selectedArtist = savedArtist;
            showHomePage();
        } else {
            showArtistSelection();
        }
    } catch (error) {
        errorDiv.textContent = "Login failed. Please try again.";
        console.error("Login error:", error);
    }
};

document.getElementById("logoutBtn").onclick = () => {
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('skipLogin');
    showLoginPage();
};

document.getElementById("changeArtistBtn").onclick = () => {
    // Clear saved artist and show artist selection
    localStorage.removeItem('selectedArtist');
    selectedArtist = null;
    showArtistSelection();
};

document.getElementById("skipLoginBtn").onclick = () => {
    // Skip login - allow play without recording stats
    currentUser = null;
    localStorage.setItem('skipLogin', 'true');
    
    // Always show artist selection first to let user choose
    showArtistSelection();
};

// Artist selection handlers
document.getElementById("travisSelectBtn").onclick = () => {
    selectArtist('travis');
};

document.getElementById("chooseRappersSelectBtn").onclick = () => {
    showChooseRappersPage();
};

document.getElementById("drakeSelectBtn").onclick = () => {
    selectArtist('drake');
};

document.getElementById("bbbmSelectBtn").onclick = () => {
    selectArtist('bbbm');
};

document.getElementById("lilteccaSelectBtn").onclick = () => {
    selectArtist('liltecca');
};

// Choose Rappers handlers
document.getElementById("confirmRappersBtn").onclick = () => {
    // Get selected rappers from checkboxes
    const rappers = [];
    if (document.getElementById("travisCheckbox").checked) {
        rappers.push('travis');
    }
    if (document.getElementById("drakeCheckbox").checked) {
        rappers.push('drake');
    }
    if (document.getElementById("lilteccaCheckbox").checked) {
        rappers.push('liltecca');
    }
    
    // Must select at least one
    if (rappers.length === 0) {
        alert("Please select at least one rapper!");
        return;
    }
    
    selectedRappers = rappers;
    selectedArtist = 'chooserappers';
    localStorage.setItem('selectedArtist', 'chooserappers');
    localStorage.setItem('selectedRappers', JSON.stringify(selectedRappers));
    
    showHomePage();
};

document.getElementById("cancelRappersBtn").onclick = () => {
    showArtistSelection();
};

// Helper function to ensure selectedArtist is initialized from localStorage
function ensureArtistSelected() {
    if (!selectedArtist) {
        const savedArtist = localStorage.getItem('selectedArtist');
        if (savedArtist) {
            selectedArtist = savedArtist;
        } else {
            // Default to travis if no artist selected
            selectedArtist = 'travis';
        }
    }
}

function selectArtist(artist) {
    selectedArtist = artist;
    localStorage.setItem('selectedArtist', artist);
    
    showHomePage();
}

// Initialize auth when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    // DOM already loaded
    initAuth();
}

// Album cover mapping: song name -> album cover filename
// Images should be in Supabase Storage at: /album/{filename}
const ALBUM_COVERS = {
    // UTOPIA (2023)
    "HYAENA": "utopia",
    "THANK GOD": "utopia",
    "MODERN JAM": "utopia",
    "MY EYES": "utopia",
    "GOD'S COUNTRY": "utopia",
    "SIRENS": "utopia",
    "MELTDOWN": "utopia",
    "FE!N": "utopia",
    "DELRESTO (ECHOES)": "utopia",
    "I KNOW ?": "utopia",
    "TOPIA TWINS": "utopia",
    "CIRCUS MAXIMUS": "utopia",
    "PARASAIL": "utopia",
    "SKITZO": "utopia",
    "LOST FOREVER": "utopia",
    "LOOOVE": "utopia",
    "K-POP": "utopia",
    "TELEKINESIS": "utopia",
    "TIL FURTHER NOTICE": "utopia",
    
    // ASTROWORLD (2018)
    "STARGAZING": "astroworld",
    "CAROUSEL": "astroworld",
    "SICKO MODE": "astroworld",
    "R.I.P. SCREW": "astroworld",
    "STOP TRYING TO BE GOD": "astroworld",
    "NO BYSTANDERS": "astroworld",
    "SKELETONS": "astroworld",
    "WAKE UP": "astroworld",
    "NC-17": "astroworld",
    "ASTROTHUNDER": "astroworld",
    "YOSEMITE": "astroworld",
    "CAN'T SAY": "astroworld",
    "WHO? WHAT!": "astroworld",
    "Butterfly Effect": "astroworld",
    "HOUSTONFORNICATION": "astroworld",
    "COFFEE BEAN": "astroworld",
    
    // BIRDS IN THE TRAP SING MCKNIGHT (2016)
    "the ends": "bittsm",
    "way back": "bittsm",
    "coordinate": "bittsm",
    "through the late night": "bittsm",
    "biebs in the trap": "bittsm",
    "sdp interlude": "bittsm",
    "sweet sweet": "bittsm",
    "outside": "bittsm",
    "goosebumps": "bittsm",
    "first take": "bittsm",
    "guidance": "bittsm",
    "wonderful": "bittsm",
    
    // RODEO (2015)
    "90210": "rodeo",
    "Pray 4 Love": "rodeo",
    "Nightcrawler": "rodeo",
    "Antidote": "rodeo",
    "Impossible": "rodeo",
    "Apple Pie": "rodeo",
    "I Can Tell": "rodeo",
    "3500": "rodeo",
    "Never Catch Me": "rodeo",
    "Pornography": "rodeo",
    "Maria I'm Drunk": "rodeo",
    
    // DAYS BEFORE RODEO (2014)
    "Mamacita": "dbr",
    "Don't Play": "dbr",
    "Skyfall": "dbr",
    "Drugs You Should Try It": "dbr",
    "Sloppy Toppy": "dbr",
    "Grey": "dbr",
    "BACC": "dbr",
    "Basement Freestyle": "dbr",
    "Backyard": "dbr",
    "Mo City flexologist": "dbr",
    "Quintana Pt. 2": "dbr",
    "The Prayer": "dbr",
    "Zombies": "dbr",
    
    // OWL PHARAOH (2013)
    "Quintana": "owl",
    "Drive": "owl",
    "Upper Echelon": "owl",
    "Dance on the Moon": "owl",
    "Uptown": "owl",
    "Bad Mood Shit On You": "owl",
    "16 Chapels": "owl",
    "Bandz": "owl",
    "Hell of a Night": "owl",
    "Naked": "owl",
    "Blocka La Flame": "owl",
    "MIA": "owl",
    
    // NOT ALL HEROES WEAR CAPES - Metro Boomin (2018)
    "Overdue": "nahwc",
    "Only 1": "nahwc",
    
    // JB2
    "FLORIDA FLOW": "jb2",
    "PBT": "jb2",
    "DA WIZARD": "jb2",
    "CHAMPAIN & VACAY": "jb2",
    "DUMBO": "jb2",
    "KICK OUT": "jb2",
    
    // A-TEAM
    "A-Team": "ateam",
    
    // OTHER (singles/collabs/etc.)
    "THE SCOTTS": "travis",
    "MAFIA": "travis",
    "ESCAPE PLAN": "travis",
    "Watch": "travis",
    "Trance": "travis",
    "Raindrops (Insane)": "travis",
    "Highest in the Room": "travis"
};

const DURATIONS = [1, 2.5, 4.5, 8, 16, 30];

// Song list (same as Python version)
const SONGS = [
    "16 Chapels",
    "3500",
    "90210",
    "A-Team",
    "Antidote",
    "Apple Pie",
    "ASTROTHUNDER",
    "BACC",
    "Backyard",
    "Bad Mood Shit On You",
    "Bandz",
    "Basement Freestyle",
    "biebs in the trap",
    "Blocka La Flame",
    "Butterfly Effect",
    "CAN'T SAY",
    "CAROUSEL",
    "CHAMPAIN & VACAY",
    "CIRCUS MAXIMUS",
    "COFFEE BEAN",
    "coordinate",
    "DA WIZARD",
    "Dance on the Moon",
    "DELRESTO (ECHOES)",
    "Don't Play",
    "Drive",
    "Drugs You Should Try It",
    "DUMBO",
    "ESCAPE PLAN",
    "FE!N",
    "first take",
    "FLORIDA FLOW",
    "GOD'S COUNTRY",
    "goosebumps",
    "Grey",
    "guidance",
    "Hell of a Night",
    "Highest in the Room",
    "HOUSTONFORNICATION",
    "HYAENA",
    "I Can Tell",
    "I KNOW ?",
    "Impossible",
    "K-POP",
    "KICK OUT",
    "LOOOVE",
    "LOST FOREVER",
    "MAFIA",
    "Mamacita",
    "Maria I'm Drunk",
    "MELTDOWN",
    "MIA",
    "Mo City flexologist",
    "MODERN JAM",
    "MY EYES",
    "Naked",
    "NC-17",
    "Never Catch Me",
    "Nightcrawler",
    "NO BYSTANDERS",
    "Only 1",
    "outside",
    "Overdue",
    "PARASAIL",
    "PBT",
    "Pornography",
    "Pray 4 Love",
    "Quintana Pt. 2",
    "Quintana",
    "R.I.P. SCREW",
    "Raindrops (Insane)",
    "sdp interlude","SICKO MODE","SIRENS","SKELETONS","SKITZO",
    "Skyfall","Sloppy Toppy","STARGAZING","STOP TRYING TO BE GOD","sweet sweet","TELEKINESIS","THANK GOD",
    "the ends","The Prayer","THE SCOTTS","through the late night","TIL FURTHER NOTICE","TOPIA TWINS","Trance","Upper Echelon",
    "Uptown","WAKE UP","Watch","way back","WHO? WHAT!","wonderful","YOSEMITE","Zombies"
  ];

// Drake songs list
const DRAKE_SONGS = [
  // Care Package
  "4PM In Calabasas",
  "5 Am in Toronto",
  "How Bout Now",
  "Jodeci Freestyle",
  "The Motion (feat. Sampha)",
  
  // Certified Lover Boy
  "Champagne Poetry",
  "Fair Trade ft. Travis Scott",
  "Girls Want Girls ft. Lil Baby",
  "IMY2 ft. Kid Cudi",
  "In The Bible ft. Lil Durk & Giveon",
  "Knife Talk ft. 21 Savage & Project Pat",
  "Love All ft. Jay-Z",
  "No Friends In The Industry",
  "Papi's Home",
  "Pipe Down",
  "TSU",
  "The Remorse",
  "Way 2 Sexy ft. Future & Young Thug",
  "Yebbas Heartbreak ft. Yebba",
  "You Only Live Twice ft. Lil Wayne & Rick Ross",
  
  // Dark Lane Demo Tapes
  "Chicago Freestyle ft. Giveon",
  "Demons ft. Fivio Foreign, Sosa Geek",
  "Desires ft. Future",
  "From Florida With Love",
  "Landed",
  "Pain 1993 ft. Playboi Carti",
  "Time Flies",
  "Toosie Slide",
  "War",
  "D4L",
  
  // For All The Dogs
  "8am in Charlotte",
  "All The Parties",
  "Away From Home",
  "Bahamas Promises",
  "Calling For You",
  "Daylight",
  "Drew A Picasso",
  "Fear Of Heights",
  "First Person Shooter",
  "IDGAF",
  "Members Only",
  "Polar Opposites",
  "Rich Baby Daddy",
  "Slime You Out",
  "Tried Our Best",
  "Virginia Beach",
  "What Would Pluto Do",
  
  // Honestly Nevermind
  "Jimmy Cooks",
  "Sticky",
  
  // If Youre Reading This Its Too Late
  "10 Bands",
  "6 God",
  "6 Man",
  "6PM In New York",
  "Company",
  "Energy",
  "Jungle",
  "Know Yourself",
  "Legend",
  "No Tellin'",
  "Now & Forever",
  "Preach",
  "Star67",
  "Used To",
  
  // More Life
  "4422",
  "Blem",
  "Can't Have Everything",
  "Do Not Disturb",
  "Fake Love",
  "Free Smoke",
  "Get It Together",
  "Glow",
  "Gyalchester",
  "Ice Melts",
  "Jorja Interlude",
  "KMT",
  "Lose You",
  "Madiba Riddim",
  "No Long Talk",
  "Nothings Into Somethings",
  "Passionfruit",
  "Portland",
  "Sacrifices",
  "Since Way Back",
  "Skepta Interlude",
  "Teenage Fever",
  
  // Nothing Was The Same
  "All Me",
  "From Time",
  "Furthest Thing",
  "Hold On, We're Going Home (Album Version)",
  "Own It",
  "Pound Cake Paris Morton Music 2",
  "Started From the Bottom (Explicit Version)",
  "Too Much",
  "Tuscan Leather",
  "Worst Behavior",
  "Wu-Tang Forever",
  
  // Other
  "Lemon Pepper Freestyle",
  "Money In The Grave",
  "Stories About My Brother",
  "The Shoe Fits",
  "Wants and Needs",
  "What's Next",
  "You Broke My Heart",
  
  // Scorpion
  "8 Out Of 10",
  "Blue Tint",
  "Cant Take A Joke",
  "Dont Matter To Me",
  "Elevate",
  "Emotionless",
  "God's Plan",
  "I'm Upset",
  "In My Feelings",
  "Mob Ties",
  "Nice For What",
  "Nonstop",
  "Summer Games",
  "Survival",
  "Talk Up",
  "Thats How You Feel",
  
  // So Far Gone
  "A Night Off",
  "Best I Ever Had",
  "Brand New",
  "Bria's Interlude",
  "Houstatlantavegas",
  "Ignant Shit",
  "Lets Call It Off",
  "Little Bit",
  "Lust For Life",
  "November 18th",
  "Outro",
  "Say Whats Real",
  "Sooner Than Later",
  "Successful",
  "The Calm",
  "Unstoppable",
  "Uptown",
  
  // Take Care
  "Crew Love",
  "HYFR (Hell Ya Fucking Right)",
  "Headlines (Explicit)",
  "Lord Knows",
  "Marvins Room",
  "Over My Dead Body",
  "Practice",
  "Take Care",
  "The Ride",
  "Under Ground Kings",
  "We'll Be Fine",
  
  // Thank Me Later
  "Fireworks (feat. Alicia Keys)",
  "Karaoke",
  "The Resistance",
  "Over",
  "Show Me A Good Time",
  "Up All Night (feat. Nicki Minaj)",
  "Fancy (feat. T.I. & Swizz Beatz)",
  "Shut It Down (feat. The-Dream)",
  "Unforgettable (feat. Young Jeezy)",
  "Light Up (feat. Jay-Z)",
  "Miss Me (feat. Lil Wayne)",
  "Cece's Interlude",
  "Find Your Love",
  "Thank Me Now",
  "Best I Ever Had (Bonus Track)",
  "Successful (feat. Trey Songz & Lil Wayne) (Bonus Track)",
  "Uptown (feat. Bun B & Lil Wayne) (Bonus Track)",
  "9AM In Dallas (Bonus Track)",
  
  // Views
  "9",
  "Childs Play",
  "Controlla",
  "Feel No Ways",
  "Fire & Desire",
  "Grammys ft. Future",
  "Hotline Bling",
  "Hype",
  "One Dance ft. Wizkid & Kyla",
  "Pop Style",
  "Redemption",
  "Still Here",
  "Too Good",
  "U With Me",
  "Views",
  "Weston Road Flows",
  "With You ft. PARTYNEXTDOOR"
];

// Drake album mapping
const DRAKE_ALBUM_COVERS = {
  "4PM In Calabasas": "carepackage",
  "5 Am in Toronto": "carepackage",
  "How Bout Now": "carepackage",
  "Jodeci Freestyle": "carepackage",
  "The Motion (feat. Sampha)": "carepackage",
  "Champagne Poetry": "clb",
  "Fair Trade ft. Travis Scott": "clb",
  "Girls Want Girls ft. Lil Baby": "clb",
  "IMY2 ft. Kid Cudi": "clb",
  "In The Bible ft. Lil Durk & Giveon": "clb",
  "Knife Talk ft. 21 Savage & Project Pat": "clb",
  "Love All ft. Jay-Z": "clb",
  "No Friends In The Industry": "clb",
  "Papi's Home": "clb",
  "Pipe Down": "clb",
  "TSU": "clb",
  "The Remorse": "clb",
  "Way 2 Sexy ft. Future & Young Thug": "clb",
  "Yebbas Heartbreak ft. Yebba": "clb",
  "You Only Live Twice ft. Lil Wayne & Rick Ross": "clb",
  "Chicago Freestyle ft. Giveon": "darklane",
  "Demons ft. Fivio Foreign, Sosa Geek": "darklane",
  "Desires ft. Future": "darklane",
  "From Florida With Love": "darklane",
  "Landed": "darklane",
  "Pain 1993 ft. Playboi Carti": "darklane",
  "Time Flies": "darklane",
  "Toosie Slide": "darklane",
  "War": "darklane",
  "D4L": "darklane",
  "8am in Charlotte": "fad",
  "All The Parties": "fad",
  "Away From Home": "fad",
  "Bahamas Promises": "fad",
  "Calling For You": "fad",
  "Daylight": "fad",
  "Drew A Picasso": "fad",
  "Fear Of Heights": "fad",
  "First Person Shooter": "fad",
  "IDGAF": "fad",
  "Members Only": "fad",
  "Polar Opposites": "fad",
  "Rich Baby Daddy": "fad",
  "Slime You Out": "fad",
  "Tried Our Best": "fad",
  "Virginia Beach": "fad",
  "What Would Pluto Do": "fad",
  "Jimmy Cooks": "hnm",
  "Sticky": "hnm",
  "10 Bands": "iyrtitl",
  "6 God": "iyrtitl",
  "6 Man": "iyrtitl",
  "6PM In New York": "iyrtitl",
  "Company": "iyrtitl",
  "Energy": "iyrtitl",
  "Jungle": "iyrtitl",
  "Know Yourself": "iyrtitl",
  "Legend": "iyrtitl",
  "No Tellin'": "iyrtitl",
  "Now & Forever": "iyrtitl",
  "Preach": "iyrtitl",
  "Star67": "iyrtitl",
  "Used To": "iyrtitl",
  "4422": "morelife",
  "Blem": "morelife",
  "Can't Have Everything": "morelife",
  "Do Not Disturb": "morelife",
  "Fake Love": "morelife",
  "Free Smoke": "morelife",
  "Get It Together": "morelife",
  "Glow": "morelife",
  "Gyalchester": "morelife",
  "Ice Melts": "morelife",
  "Jorja Interlude": "morelife",
  "KMT": "morelife",
  "Lose You": "morelife",
  "Madiba Riddim": "morelife",
  "No Long Talk": "morelife",
  "Nothings Into Somethings": "morelife",
  "Passionfruit": "morelife",
  "Portland": "morelife",
  "Sacrifices": "morelife",
  "Since Way Back": "morelife",
  "Skepta Interlude": "morelife",
  "Teenage Fever": "morelife",
  "All Me": "nwts",
  "From Time": "nwts",
  "Furthest Thing": "nwts",
  "Hold On, We're Going Home (Album Version)": "nwts",
  "Own It": "nwts",
  "Pound Cake Paris Morton Music 2": "nwts",
  "Started From the Bottom (Explicit Version)": "nwts",
  "Too Much": "nwts",
  "Tuscan Leather": "nwts",
  "Worst Behavior": "nwts",
  "Wu-Tang Forever": "nwts",
  "Lemon Pepper Freestyle": "drake",
  "Money In The Grave": "drake",
  "Stories About My Brother": "drake",
  "The Shoe Fits": "drake",
  "Wants and Needs": "drake",
  "What's Next": "drake",
  "You Broke My Heart": "drake",
  "8 Out Of 10": "scorpion",
  "Blue Tint": "scorpion",
  "Cant Take A Joke": "scorpion",
  "Dont Matter To Me": "scorpion",
  "Elevate": "scorpion",
  "Emotionless": "scorpion",
  "God's Plan": "scorpion",
  "I'm Upset": "scorpion",
  "In My Feelings": "scorpion",
  "Mob Ties": "scorpion",
  "Nice For What": "scorpion",
  "Nonstop": "scorpion",
  "Summer Games": "scorpion",
  "Survival": "scorpion",
  "Talk Up": "scorpion",
  "Thats How You Feel": "scorpion",
  "A Night Off": "sfg",
  "Best I Ever Had": "sfg",
  "Brand New": "sfg",
  "Bria's Interlude": "sfg",
  "Houstatlantavegas": "sfg",
  "Ignant Shit": "sfg",
  "Lets Call It Off": "sfg",
  "Little Bit": "sfg",
  "Lust For Life": "sfg",
  "November 18th": "sfg",
  "Outro": "sfg",
  "Say Whats Real": "sfg",
  "Sooner Than Later": "sfg",
  "Successful": "sfg",
  "The Calm": "sfg",
  "Unstoppable": "sfg",
  "Uptown": "sfg",
  "Crew Love": "takecare",
  "HYFR (Hell Ya Fucking Right)": "takecare",
  "Headlines (Explicit)": "takecare",
  "Lord Knows": "takecare",
  "Marvins Room": "takecare",
  "Over My Dead Body": "takecare",
  "Practice": "takecare",
  "Take Care": "takecare",
  "The Ride": "takecare",
  "Under Ground Kings": "takecare",
  "We'll Be Fine": "takecare",
  "Fireworks (feat. Alicia Keys)": "tml",
  "Karaoke": "tml",
  "The Resistance": "tml",
  "Over": "tml",
  "Show Me A Good Time": "tml",
  "Up All Night (feat. Nicki Minaj)": "tml",
  "Fancy (feat. T.I. & Swizz Beatz)": "tml",
  "Shut It Down (feat. The-Dream)": "tml",
  "Unforgettable (feat. Young Jeezy)": "tml",
  "Light Up (feat. Jay-Z)": "tml",
  "Miss Me (feat. Lil Wayne)": "tml",
  "Cece's Interlude": "tml",
  "Find Your Love": "tml",
  "Thank Me Now": "tml",
  "Best I Ever Had (Bonus Track)": "tml",
  "Successful (feat. Trey Songz & Lil Wayne) (Bonus Track)": "tml",
  "Uptown (feat. Bun B & Lil Wayne) (Bonus Track)": "tml",
  "9AM In Dallas (Bonus Track)": "tml",
  "9": "views",
  "Childs Play": "views",
  "Controlla": "views",
  "Feel No Ways": "views",
  "Fire & Desire": "views",
  "Grammys ft. Future": "views",
  "Hotline Bling": "views",
  "Hype": "views",
  "One Dance ft. Wizkid & Kyla": "views",
  "Pop Style": "views",
  "Redemption": "views",
  "Still Here": "views",
  "Too Good": "views",
  "U With Me": "views",
  "Views": "views",
  "Weston Road Flows": "views",
  "With You ft. PARTYNEXTDOOR": "views"
};

// Big Black Banana Man songs list
const BBBM_SONGS = [
  "Hey Its 21",
  "Astagfurillah",
  "Whats Happen Gonna Next",
  "Free Mr Sandhu ft. Mr Nize"
];

// Big Black Banana Man album mapping
const BBBM_ALBUM_COVERS = {
  "Hey Its 21": "21",
  "Astagfurillah": "ast",
  "Whats Happen Gonna Next": "whgn",
  "Free Mr Sandhu ft. Mr Nize": "sandhu"
};

// Lil Tecca songs list
const LILTECCA_SONGS = [
  // We Love You Tecca (WLYT)
  "Ransom",
  "Love Me",
  "Shots",
  "Count Me Out",
  "Did It Again",
  "Left, Right",
  "Sidenote",
  "Amigo",
  "Bossanova",
  "Out Of Luck",
  "Phenom",
  "Molly Girl",
  "Senorita",
  "The Score",
  "DUI",
  "Weatherman",
  
  // Virgo World
  "Actin Up",
  "Closest To Heaven",
  "True To The Game ft. Guwop Reign",
  "Our Time",
  "When You Down ft. Lil Durk & Polo G",
  "Take 10",
  "Last Call",
  "Tic Toc",
  "Foreign ft. NAV",
  "Chemistry",
  "Royal Rumble",
  "Level Up",
  "Miss Me",
  "Back It Up",
  "Selection ft. Skrillex & DJ Scheme",
  "Dolly ft. Lil Uzi Vert",
  "Insecurities",
  "No Answers",
  
  // We Love You Tecca 2 (WLYT2)
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
  
  // Other/Singles
  "All Star ft. Lil Tjay",
  "Dark Thoughts",
  "Favorite Lie",
  "Never Left",
  "Out of Love",
  "Treesha"
];

// Lil Tecca album mapping
// Image files in Supabase: wlyt.jpg, virgo.jpg, wlyt2.jpg, tecca.jpg
const LILTECCA_ALBUM_COVERS = {
  // We Love You Tecca (WLYT) - wlyt.jpg
  "Ransom": "wlyt",
  "Love Me": "wlyt",
  "Shots": "wlyt",
  "Count Me Out": "wlyt",
  "Did It Again": "wlyt",
  "Left, Right": "wlyt",
  "Sidenote": "wlyt",
  "Amigo": "wlyt",
  "Bossanova": "wlyt",
  "Out Of Luck": "wlyt",
  "Phenom": "wlyt",
  "Molly Girl": "wlyt",
  "Senorita": "wlyt",
  "The Score": "wlyt",
  "DUI": "wlyt",
  "Weatherman": "wlyt",
  
  // Virgo World - virgo.jpg
  "Actin Up": "virgo",
  "Closest To Heaven": "virgo",
  "True To The Game ft. Guwop Reign": "virgo",
  "Our Time": "virgo",
  "When You Down ft. Lil Durk & Polo G": "virgo",
  "Take 10": "virgo",
  "Last Call": "virgo",
  "Tic Toc": "virgo",
  "Foreign ft. NAV": "virgo",
  "Chemistry": "virgo",
  "Royal Rumble": "virgo",
  "Level Up": "virgo",
  "Miss Me": "virgo",
  "Back It Up": "virgo",
  "Selection ft. Skrillex & DJ Scheme": "virgo",
  "Dolly ft. Lil Uzi Vert": "virgo",
  "Insecurities": "virgo",
  "No Answers": "virgo",
  
  // We Love You Tecca 2 (WLYT2) - wlyt2.jpg
  "DID THAT": "wlyt2",
  "REPEAT IT": "wlyt2",
  "YOU DON'T NEED ME NO MORE": "wlyt2",
  "NADA": "wlyt2",
  "MONEY ON ME": "wlyt2",
  "FEE": "wlyt2",
  "EVERYWHERE I GO": "wlyt2",
  "INVESTIGATION": "wlyt2",
  "MY SIDE": "wlyt2",
  "CAUTION": "wlyt2",
  "WHATEVER": "wlyt2",
  "LOT OF ME": "wlyt2",
  "ABOUT YOU ft. NAV": "wlyt2",
  "BANK TELLER": "wlyt2",
  "SEASIDE": "wlyt2",
  "SHOOTERS": "wlyt2",
  "YOU GOTTA GO DO BETTER": "wlyt2",
  "NEVER LEFT": "wlyt2",
  "CHOPPA SHOOT THE LOUDEST": "wlyt2",
  "NO DISCUSSION": "wlyt2",
  
  // Other/Singles - tecca.jpg
  "All Star ft. Lil Tjay": "tecca",
  "Dark Thoughts": "tecca",
  "Favorite Lie": "tecca",
  "Never Left": "tecca",
  "Out of Love": "tecca",
  "Treesha": "tecca"
};

// All Rappers mode: combines Drake, Travis Scott, and Lil Tecca songs
const ALL_RAPPERS_SONGS = [...SONGS, ...DRAKE_SONGS, ...LILTECCA_SONGS];

// All Rappers mode: combines album covers from Travis Scott, Drake, and Lil Tecca
const ALL_RAPPERS_ALBUM_COVERS = {
  ...ALBUM_COVERS,
  ...DRAKE_ALBUM_COVERS,
  ...LILTECCA_ALBUM_COVERS
};

// Helper function to determine which artist(s) a song belongs to
// Returns an array of artist names that have this song
function getArtistsForSong(songName) {
    const artists = [];
    if (SONGS.includes(songName)) {
        artists.push('travis');
    }
    if (DRAKE_SONGS.includes(songName)) {
        artists.push('drake');
    }
    if (LILTECCA_SONGS.includes(songName)) {
        artists.push('liltecca');
    }
    return artists;
}

// Helper function to randomly select an artist for a song in "all rappers" mode
// If song is in multiple lists, randomly picks one
function selectArtistForSong(songName) {
    const artists = getArtistsForSong(songName);
    if (artists.length === 0) {
        // Default to travis if not found (shouldn't happen)
        return 'travis';
    }
    // Randomly select one if multiple artists have this song
    return artists[Math.floor(Math.random() * artists.length)];
}

// Helper functions to get artist-specific data
function getSongsForArtist(artist) {
    if (artist === 'chooserappers') {
        // Combine songs from selected rappers only
        const songs = [];
        if (selectedRappers.includes('travis')) {
            songs.push(...SONGS);
        }
        if (selectedRappers.includes('drake')) {
            songs.push(...DRAKE_SONGS);
        }
        if (selectedRappers.includes('liltecca')) {
            songs.push(...LILTECCA_SONGS);
        }
        return songs;
    } else if (artist === 'drake') {
        return DRAKE_SONGS;
    } else if (artist === 'bbbm') {
        return BBBM_SONGS;
    } else if (artist === 'liltecca') {
        return LILTECCA_SONGS;
    }
    return SONGS;
}

function getAlbumMapForArtist(artist) {
    if (artist === 'chooserappers') {
        // Combine album covers from selected rappers only
        const covers = {};
        if (selectedRappers.includes('travis')) {
            Object.assign(covers, ALBUM_COVERS);
        }
        if (selectedRappers.includes('drake')) {
            Object.assign(covers, DRAKE_ALBUM_COVERS);
        }
        if (selectedRappers.includes('liltecca')) {
            Object.assign(covers, LILTECCA_ALBUM_COVERS);
        }
        return covers;
    } else if (artist === 'drake') {
        return DRAKE_ALBUM_COVERS;
    } else if (artist === 'bbbm') {
        return BBBM_ALBUM_COVERS;
    } else if (artist === 'liltecca') {
        return LILTECCA_ALBUM_COVERS;
    }
    return ALBUM_COVERS;
}

// Helper function to construct audio file URL for a song using Cloudflare R2
// songArtist is optional - if provided, use it; otherwise determine from song name
function getAudioUrl(songName, songArtist = null) {
    // Determine which artist to use for this song
    let artistToUse = songArtist;
    
    // In "choose rappers" mode, determine which artist the song belongs to
    if (selectedArtist === 'chooserappers') {
        if (!artistToUse) {
            // If not provided, determine it (should be provided from state, but fallback)
            // Only check selected rappers
            const artists = getArtistsForSong(songName).filter(a => selectedRappers.includes(a));
            if (artists.length > 0) {
                artistToUse = artists[Math.floor(Math.random() * artists.length)];
            } else {
                // Fallback to first selected rapper if song not found
                artistToUse = selectedRappers[0] || 'travis';
            }
        }
    } else {
        // Use the selected artist
        artistToUse = selectedArtist;
    }
    
    // Get the public URL for this artist's bucket
    const bucketPublicUrl = R2_PUBLIC_URLS[artistToUse] || R2_PUBLIC_URLS.travis;
    
    // Construct R2 URL: {bucket-public-url}/song.mp3
    // All songs are in root of bucket (no folders)
    const url = `${bucketPublicUrl}/${encodeURIComponent(songName)}.mp3`;
    
    // Debug logging
    console.log('Audio URL:', url, 'Artist:', artistToUse, 'Song:', songName);
    
    return url;
}

// ---------------------------
// SOCKET.IO (only for H2H mode)
// ---------------------------
const socket = io(BACKEND_URL);

// ---------------------------
// GLOBAL STATE
// ---------------------------
let currentMode = null; // 'solo' or 'h2h'
let gameMode = 'regular'; // 'regular' or 'random'
let soloState = {
    currentSong: null,
    skips: 0,
    startTime: 0,
    audio: null,
    guessed: false,
    strikes: 0,
    progressBars: [],
    songDuration: 0,
    progressInterval: null
};
let h2hState = {
    lobbyId: null,
    currentSong: null,
    skips: 0,
    startTime: 0,
    audio: null,
    username: null,
    guessed: false,
    strikes: 0,
    gameStarted: false,
    playerCount: 0,
    scores: {},
    roundFinished: false,
    finished: false,
    progressBars: [],
    songDuration: 0,
    progressInterval: null,
    gameMode: 'regular'
};

let speedState = {
    currentSong: null,
    skips: 0,
    startTime: 0,
    audio: null,
    guessed: false,
    strikes: 0,
    progressBars: [],
    songDuration: 0,
    progressInterval: null,
    round: 1,
    totalRounds: 15,
    timer: 0,
    timerInterval: null,
    gameOver: false,
    songsPlayed: [] // Track songs to avoid repeats
};

// ---------------------------
// DOM ELEMENTS
// ---------------------------
const home = document.getElementById("home");
const soloGame = document.getElementById("soloGame");
const h2hMenu = document.getElementById("h2hMenu");
const h2hGame = document.getElementById("h2hGame");

// ---------------------------
// MODE SELECTION
// ---------------------------
document.getElementById("soloRegularBtn").onclick = () => {
    currentMode = 'solo';
    gameMode = 'regular';
    home.style.display = "none";
    soloGame.style.display = "block";
    startSoloGame();
};

document.getElementById("soloRandomBtn").onclick = () => {
    currentMode = 'solo';
    gameMode = 'random';
    home.style.display = "none";
    soloGame.style.display = "block";
    startSoloGame();
};

document.getElementById("h2hRegularBtn").onclick = () => {
    currentMode = 'h2h';
    gameMode = 'regular';
    home.style.display = "none";
    h2hMenu.style.display = "block";
};

document.getElementById("h2hRandomBtn").onclick = () => {
    currentMode = 'h2h';
    gameMode = 'random';
    home.style.display = "none";
    h2hMenu.style.display = "block";
};

document.getElementById("speedBtn").onclick = () => {
    currentMode = 'speed';
    home.style.display = "none";
    speedGame.style.display = "block";
    startSpeedGame();
};

document.getElementById("h2hMenuHome").onclick = () => {
    h2hMenu.style.display = "none";
    home.style.display = "block";
    currentMode = null;
};

document.getElementById("h2hHome").onclick = () => {
    if (h2hState.audio) {
        h2hState.audio.pause();
        h2hState.audio = null;
    }
    h2hGame.style.display = "none";
    home.style.display = "block";
    socket.emit("leaveLobby", { lobbyId: h2hState.lobbyId });
    h2hState = { lobbyId: null, currentSong: null, skips: 0, startTime: 0, audio: null, username: null, guessed: false, strikes: 0 };
    currentMode = null;
};

document.getElementById("soloHome").onclick = () => {
    if (soloState.audio) {
        soloState.audio.pause();
        soloState.audio = null;
    }
    soloGame.style.display = "none";
    home.style.display = "block";
    currentMode = null;
};

// ---------------------------
// SOLO MODE
// ---------------------------
async function startSoloGame() {
    // Ensure selectedArtist is set from localStorage if not already set
    ensureArtistSelected();
    const songs = getSongsForArtist(selectedArtist || 'travis');
    const songName = songs[Math.floor(Math.random() * songs.length)];
    
    // In "choose rappers" mode, determine which artist this song belongs to
    let songArtist = null;
    if (selectedArtist === 'chooserappers') {
        const artists = getArtistsForSong(songName).filter(a => selectedRappers.includes(a));
        if (artists.length > 0) {
            songArtist = artists[Math.floor(Math.random() * artists.length)];
        } else {
            songArtist = selectedRappers[0] || 'travis';
        }
    }
    
    let startTime = 0;
    
    if (gameMode === 'random') {
        // Get song duration and calculate random start (0 to duration-40)
        const duration = await getSongDuration(songName, songArtist);
        const maxStart = Math.max(0, duration - 40);
        startTime = parseFloat((Math.random() * maxStart).toFixed(2));
    }
    
    soloState = {
        currentSong: songName,
        songArtist: songArtist, // Store which artist this song belongs to
        skips: 0,
        startTime: startTime,
        audio: null,
        guessed: false,
        strikes: 0,
        progressBars: [],
        songDuration: await getSongDuration(songName, songArtist),
        progressInterval: null
    };
    
    // Reset progress bars
    for (let i = 1; i <= 6; i++) {
        const bar = document.getElementById(`soloBar${i}`);
        if (bar) {
            bar.className = 'progress-bar';
            bar.textContent = '';
        }
    }
    
    document.getElementById("soloStrikes").textContent = "0/6 strikes";
    document.getElementById("soloFeedback").textContent = "";
    document.getElementById("soloFeedback").className = "feedback";
    document.getElementById("soloGuessInput").value = "";
    document.getElementById("soloSkip").disabled = false;
    document.getElementById("soloGuess").disabled = false;
    document.getElementById("soloPlay").textContent = "Play";
    document.getElementById("soloSongProgressFill").style.width = "0%";
    
    // Stop any playing audio
    if (soloState.audio) {
        soloState.audio.pause();
        soloState.audio = null;
    }
    if (soloState.progressInterval) {
        clearInterval(soloState.progressInterval);
    }
}

// ---------------------------
// STATS TRACKING HELPER FUNCTIONS
// ---------------------------
async function saveGameStats(mode, won) {
    if (!currentUser) return;
    
    try {
        await fetch(`${BACKEND_URL}/api/stats`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: currentUser.id,
                mode: mode,
                won: won
            })
        });
    } catch (error) {
        console.error("Failed to save stats:", error);
    }
}

async function saveGameHistory(mode, songName, strikes, won, duration = null) {
    if (!currentUser) return;
    
    try {
        await fetch(`${BACKEND_URL}/api/game-history`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: currentUser.id,
                mode: mode,
                song_name: songName,
                strikes: strikes,
                won: won,
                duration: duration
            })
        });
    } catch (error) {
        console.error("Failed to save game history:", error);
    }
}

// Helper function to update progress bars
function updateProgressBar(mode, index, type, text) {
    const prefix = mode === 'solo' ? 'solo' : 'h2h';
    const bar = document.getElementById(`${prefix}Bar${index + 1}`);
    if (!bar) return;
    
    bar.className = 'progress-bar';
    if (type === 'skip') {
        bar.classList.add('skipped');
        bar.textContent = 'Skipped';
    } else if (type === 'correct') {
        bar.classList.add('correct');
        bar.textContent = text || 'Guessed Correct!';
    } else if (type === 'incorrect') {
        bar.classList.add('incorrect');
        bar.textContent = text || `Guessed "${text || ''}" Incorrect`;
    }
}

// Helper function to get song duration for random mode
async function getSongDuration(songName, songArtist = null) {
    const url = getAudioUrl(songName, songArtist);
    return new Promise((resolve) => {
        const audio = new Audio(url);
        audio.addEventListener('loadedmetadata', () => {
            resolve(audio.duration);
        });
        audio.addEventListener('error', (e) => {
            console.error('Error loading audio for duration:', url, e);
            resolve(180); // Default 3 minutes if can't load
        });
        audio.load();
    });
}

document.getElementById("soloPlay").onclick = () => {
    if (!soloState.currentSong) return;
    
    // If round is finished (guessed or strikes >= 6), play full song
    if (soloState.guessed || soloState.strikes >= 6) {
        if (soloState.audio) {
            if (!soloState.audio.paused) {
                soloState.audio.pause();
                document.getElementById("soloPlay").textContent = "Play";
                if (soloState.progressInterval) {
                    clearInterval(soloState.progressInterval);
                }
                return;
            } else {
                soloState.audio.pause();
                soloState.audio = null;
            }
        }
        
        const url = getAudioUrl(soloState.currentSong, soloState.songArtist);
        soloState.audio = new Audio(url);
        soloState.audio.currentTime = 0;
        
        soloState.audio.play().catch(err => {
            console.error("Error playing audio:", err);
            document.getElementById("soloFeedback").textContent = "Error loading audio. Try again.";
        });
        
        document.getElementById("soloPlay").textContent = "Pause";
        
        // Update progress bar for full song
        if (soloState.progressInterval) {
            clearInterval(soloState.progressInterval);
        }
        
        soloState.progressInterval = setInterval(() => {
            if (soloState.audio && !soloState.audio.paused) {
                const current = soloState.audio.currentTime;
                const total = soloState.songDuration || 180;
                const overallProgress = (current / total) * 100;
                document.getElementById("soloSongProgressFill").style.width = `${Math.min(100, Math.max(0, overallProgress))}%`;
            }
        }, 50);
        
        soloState.audio.onended = () => {
            document.getElementById("soloPlay").textContent = "Play";
            if (soloState.progressInterval) {
                clearInterval(soloState.progressInterval);
            }
        };
        
        soloState.audio.onpause = () => {
            document.getElementById("soloPlay").textContent = "Play";
        };
        
        return;
    }
    
    // Normal gameplay - play snippet
    if (soloState.audio) {
        soloState.audio.pause();
        soloState.audio = null;
    }
    
    const duration = DURATIONS[Math.min(soloState.skips, 5)];
    const url = getAudioUrl(soloState.currentSong, soloState.songArtist);
    
    soloState.audio = new Audio(url);
    soloState.audio.currentTime = soloState.startTime;
    
    // Start progress bar animation
    if (soloState.progressInterval) {
        clearInterval(soloState.progressInterval);
    }
    
    const startProgress = soloState.startTime;
    const endProgress = startProgress + duration;
    
    soloState.audio.play().catch(err => {
        console.error("Error playing audio:", err);
        document.getElementById("soloFeedback").textContent = "Error loading audio. Try again.";
    });
    
    // Update progress bar
    soloState.progressInterval = setInterval(() => {
        if (soloState.audio && !soloState.audio.paused) {
            const current = soloState.audio.currentTime;
            const total = soloState.songDuration || 180;
            const progress = ((current - startProgress) / duration) * 100;
            const overallProgress = (current / total) * 100;
            document.getElementById("soloSongProgressFill").style.width = `${Math.min(100, Math.max(0, overallProgress))}%`;
        }
    }, 50);
    
    setTimeout(() => {
        if (soloState.audio) {
            soloState.audio.pause();
        }
        if (soloState.progressInterval) {
            clearInterval(soloState.progressInterval);
        }
    }, duration * 1000);
};

document.getElementById("soloSkip").onclick = () => {
    // Don't allow skip if we have 5 or more strikes (6th strike must be incorrect guess)
    // This check must be first - if strikes >= 5, skip button should not work
    if (soloState.strikes >= 5) {
        document.getElementById("soloSkip").disabled = true;
        return;
    }
    if (soloState.guessed || soloState.strikes >= 6) return;
    
    soloState.skips++;
    soloState.strikes++;
    const strikeIndex = soloState.strikes - 1;
    updateProgressBar('solo', strikeIndex, 'skip', 'Skipped');
    document.getElementById("soloStrikes").textContent = `${soloState.strikes}/6 strikes`;
    
    // Disable skip if we're now at 5 strikes (can't skip for 6th strike)
    if (soloState.strikes >= 5) {
        document.getElementById("soloSkip").disabled = true;
    }
    
        if (soloState.strikes >= 6) {
            document.getElementById("soloSkip").disabled = true;
            document.getElementById("soloGuess").disabled = true;
            document.getElementById("soloFeedback").textContent = `Out of strikes! The correct song was: ${soloState.currentSong}`;
            document.getElementById("soloFeedback").className = "feedback incorrect";
            if (soloState.audio) {
                soloState.audio.pause();
            }
            // Save stats and game history
            const artistPrefix = selectedArtist || 'travis';
            const mode = `${artistPrefix}-solo-${gameMode}`;
            saveGameStats(mode, false);
            saveGameHistory(mode, soloState.currentSong, soloState.strikes, false);
            // Show result modal
            showSongResultModal(soloState.currentSong, `Incorrect! The song was: ${soloState.currentSong}`, false);
        if (soloState.progressInterval) {
            clearInterval(soloState.progressInterval);
        }
        return;
    }
    
    if (soloState.audio) {
        soloState.audio.pause();
        soloState.audio = null;
    }
    if (soloState.progressInterval) {
        clearInterval(soloState.progressInterval);
        document.getElementById("soloSongProgressFill").style.width = "0%";
    }
};

// Update guess button - use soloGuess button and soloGuessInput field
document.getElementById("soloGuess").onclick = () => {
    if (soloState.guessed || soloState.strikes >= 6) return;
    
    const guess = document.getElementById("soloGuessInput").value.trim();
    if (!guess) return;
    
    // Check if song exists in list
    const songs = getSongsForArtist(selectedArtist || 'travis');
    let matchedSong = null;
    for (const song of songs) {
        if (song.toLowerCase().replace(/'/g, "") === guess.toLowerCase().replace(/'/g, "")) {
            matchedSong = song;
            break;
        }
    }
    
    if (!matchedSong) {
        soloState.strikes++;
        document.getElementById("soloStrikes").textContent = `${soloState.strikes}/6 strikes`;
        const strikeIndex = soloState.strikes - 1;
        updateProgressBar('solo', strikeIndex, 'incorrect', `Guessed "${guess}" Incorrect`);
        document.getElementById("soloFeedback").textContent = `"${guess}": Song not found. Try Again.`;
        document.getElementById("soloFeedback").className = "feedback not-found";
        document.getElementById("soloGuessInput").value = "";
        
        // Disable skip if we're now at 5 strikes (can't skip for 6th strike)
        if (soloState.strikes >= 5) {
            document.getElementById("soloSkip").disabled = true;
        }
        
        if (soloState.strikes >= 6) {
            document.getElementById("soloSkip").disabled = true;
            document.getElementById("soloGuess").disabled = true;
            document.getElementById("soloFeedback").textContent = `Out of strikes! The correct song was: ${soloState.currentSong}`;
            document.getElementById("soloFeedback").className = "feedback incorrect";
            if (soloState.audio) {
                soloState.audio.pause();
            }
        }
        hideAutocomplete("solo");
        return;
    }
    
    if (matchedSong.toLowerCase() === soloState.currentSong.toLowerCase()) {
        // Correct guess - don't increment strikes, use current strike count
        soloState.guessed = true;
        const strikeIndex = soloState.strikes;
        updateProgressBar('solo', strikeIndex, 'correct', 'Guessed Correct!');
        document.getElementById("soloStrikes").textContent = `${soloState.strikes}/6 strikes`;
        const tries = soloState.strikes + 1; // Tries = strikes (incorrect/skips) + 1 (successful guess)
        document.getElementById("soloFeedback").textContent = `You guessed "${soloState.currentSong}" in ${tries} tries!`;
        document.getElementById("soloFeedback").className = "feedback correct";
        if (soloState.audio) {
            soloState.audio.pause();
        }
        // Save stats and game history
        const artistPrefix = selectedArtist || 'travis';
        const mode = `${artistPrefix}-solo-${gameMode}`;
        saveGameStats(mode, true);
        saveGameHistory(mode, soloState.currentSong, soloState.strikes, true);
        // Show result modal
        showSongResultModal(soloState.currentSong, `You guessed "${soloState.currentSong}" in ${tries} tries!`, true);
        if (soloState.progressInterval) {
            clearInterval(soloState.progressInterval);
        }
    } else {
        // Incorrect guess - increment strikes
        soloState.strikes++;
        const strikeIndex = soloState.strikes - 1;
        updateProgressBar('solo', strikeIndex, 'incorrect', `Guessed "${matchedSong}" Incorrect`);
        document.getElementById("soloStrikes").textContent = `${soloState.strikes}/6 strikes`;
        document.getElementById("soloFeedback").textContent = `"${matchedSong}": Incorrect. Try Again.`;
        document.getElementById("soloFeedback").className = "feedback incorrect";
        document.getElementById("soloGuessInput").value = "";
        
        if (soloState.strikes >= 6) {
            document.getElementById("soloSkip").disabled = true;
            document.getElementById("soloGuess").disabled = true;
            document.getElementById("soloFeedback").textContent = `Out of strikes! The correct song was: ${soloState.currentSong}`;
            document.getElementById("soloFeedback").className = "feedback incorrect";
            if (soloState.audio) {
                soloState.audio.pause();
            }
        }
    }
    
    hideAutocomplete("solo");
};

document.getElementById("soloNewGame").onclick = () => {
    if (soloState.audio) {
        soloState.audio.pause();
        soloState.audio = null;
    }
    startSoloGame();
};

// Autocomplete for Solo
setupAutocomplete("soloGuessInput", "soloAutocomplete");

// ---------------------------
// SPEED MODE
// ---------------------------
async function startSpeedGame() {
    // Ensure selectedArtist is set from localStorage if not already set
    ensureArtistSelected();
    
    // Reset state for new game
    speedState = {
        currentSong: null,
        skips: 0,
        startTime: 0,
        audio: null,
        guessed: false,
        strikes: 0,
        progressBars: [],
        songDuration: 0,
        progressInterval: null,
        round: 1,
        totalRounds: 15,
        timer: 0,
        timerInterval: null,
        gameOver: false,
        songsPlayed: []
    };
    
    // Reset UI
    for (let i = 1; i <= 6; i++) {
        const bar = document.getElementById(`speedBar${i}`);
        if (bar) {
            bar.className = 'progress-bar';
            bar.textContent = '';
        }
    }
    
    document.getElementById("speedStrikes").textContent = "0/6 strikes";
    document.getElementById("speedRound").textContent = `Round ${speedState.round}/${speedState.totalRounds}`;
    document.getElementById("speedTimer").textContent = "0:00";
    document.getElementById("speedFeedback").textContent = "";
    document.getElementById("speedFeedback").className = "feedback";
    document.getElementById("speedGuessInput").value = "";
    
    // Start timer
    startSpeedTimer();
    
    // Start first round
    await startSpeedRound();
}

async function startSpeedRound() {
    // Ensure selectedArtist is set from localStorage if not already set
    ensureArtistSelected();
    
    // Select a random song that hasn't been played yet
    const songs = getSongsForArtist(selectedArtist || 'travis');
    let availableSongs = songs.filter(s => !speedState.songsPlayed.includes(s));
    if (availableSongs.length === 0) {
        // Reset if all songs used
        speedState.songsPlayed = [];
        availableSongs = songs;
    }
    
    const songName = availableSongs[Math.floor(Math.random() * availableSongs.length)];
    speedState.songsPlayed.push(songName);
    
    // In "choose rappers" mode, determine which artist this song belongs to
    let songArtist = null;
    if (selectedArtist === 'chooserappers') {
        const artists = getArtistsForSong(songName).filter(a => selectedRappers.includes(a));
        if (artists.length > 0) {
            songArtist = artists[Math.floor(Math.random() * artists.length)];
        } else {
            songArtist = selectedRappers[0] || 'travis';
        }
    }
    
    speedState.currentSong = songName;
    speedState.songArtist = songArtist; // Store which artist this song belongs to
    speedState.skips = 0;
    speedState.strikes = 0;
    speedState.guessed = false;
    speedState.startTime = 0;
    speedState.gameOver = false;
    
    // Reset progress bars for this round
    for (let i = 1; i <= 6; i++) {
        const bar = document.getElementById(`speedBar${i}`);
        if (bar) {
            bar.className = 'progress-bar';
            bar.textContent = '';
        }
    }
    
    document.getElementById("speedStrikes").textContent = "0/6 strikes";
    document.getElementById("speedRound").textContent = `Round ${speedState.round}/${speedState.totalRounds}`;
    document.getElementById("speedFeedback").textContent = "";
    document.getElementById("speedFeedback").className = "feedback";
    document.getElementById("speedGuessInput").value = "";
    
    // Enable controls
    document.getElementById("speedPlay").disabled = false;
    document.getElementById("speedSkip").disabled = false;
    document.getElementById("speedGuess").disabled = false;
    document.getElementById("speedGuessInput").disabled = false;
    
    speedState.songDuration = await getSongDuration(songName, songArtist);
}

function startSpeedTimer() {
    if (speedState.timerInterval) {
        clearInterval(speedState.timerInterval);
    }
    
    speedState.timerInterval = setInterval(() => {
        if (!speedState.gameOver) {
            speedState.timer += 0.1;
            const minutes = Math.floor(speedState.timer / 60);
            const seconds = Math.floor(speedState.timer % 60);
            const milliseconds = Math.floor((speedState.timer % 1) * 10);
            document.getElementById("speedTimer").textContent = `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds}`;
        }
    }, 100);
}

function addSpeedPenalty() {
    speedState.timer += 3;
}

function endSpeedGame(won, completedRounds = null) {
    speedState.gameOver = true;
    if (speedState.timerInterval) {
        clearInterval(speedState.timerInterval);
    }
    
    // Disable controls
    document.getElementById("speedPlay").disabled = true;
    document.getElementById("speedSkip").disabled = true;
    document.getElementById("speedGuess").disabled = true;
    document.getElementById("speedGuessInput").disabled = true;
    
    if (speedState.audio) {
        speedState.audio.pause();
    }
    
    if (speedState.progressInterval) {
        clearInterval(speedState.progressInterval);
    }
    
    // Use completedRounds if provided, otherwise calculate from current round
    const roundsCompleted = completedRounds !== null ? completedRounds : (speedState.round - 1);
    const allRoundsCompleted = roundsCompleted === speedState.totalRounds;
    
    if (won && allRoundsCompleted) {
        // Completed all rounds - show success
        const minutes = Math.floor(speedState.timer / 60);
        const seconds = Math.floor(speedState.timer % 60);
        const milliseconds = Math.floor((speedState.timer % 1) * 100);
        
        document.getElementById("speedGame").style.display = "none";
        document.getElementById("speedGameOver").style.display = "block";
        document.getElementById("speedGameOverTitle").textContent = "Congratulations!";
        document.getElementById("speedGameOverMessage").textContent = `You completed all ${speedState.totalRounds} rounds!`;
        document.getElementById("speedFinalTime").textContent = `Final Time: ${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
        
        // Save to leaderboard if completed all rounds
        if (currentUser && allRoundsCompleted) {
            console.log("Saving speed run to leaderboard:", { 
                timer: speedState.timer, 
                rounds: roundsCompleted,
                allRoundsCompleted 
            });
            saveSpeedRun(speedState.timer, roundsCompleted);
        }
    } else {
        // Lost - show game over
        document.getElementById("speedGame").style.display = "none";
        document.getElementById("speedGameOver").style.display = "block";
        document.getElementById("speedGameOverTitle").textContent = "Game Over!";
        document.getElementById("speedGameOverMessage").textContent = `You completed ${speedState.round - 1} rounds. The song was: ${speedState.currentSong}`;
        document.getElementById("speedFinalTime").textContent = "";
    }
}

async function saveSpeedRun(totalTime, roundsCompleted) {
    if (!currentUser) {
        console.error("Cannot save speed run: No current user");
        return;
    }
    
    console.log("Attempting to save speed run:", {
        user_id: currentUser.id,
        username: currentUser.username,
        total_time: totalTime,
        rounds_completed: roundsCompleted
    });
    
    try {
        const artistPrefix = selectedArtist || 'travis';
        const response = await fetch(`${BACKEND_URL}/api/speed-leaderboard`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: currentUser.id,
                username: currentUser.username,
                total_time: totalTime,
                rounds_completed: roundsCompleted,
                artist: artistPrefix
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error("Failed to save speed run:", data.error || "Unknown error");
            return;
        }
        
        console.log("Speed run saved successfully:", data);
    } catch (error) {
        console.error("Failed to save speed run (network error):", error);
    }
}

// Speed mode button handlers
document.getElementById("speedPlay").onclick = () => {
    if (!speedState.currentSong || speedState.gameOver) return;
    
    // Always reset audio and play from start - button always says "Play"
    if (speedState.audio) {
        speedState.audio.pause();
        speedState.audio = null;
    }
    
    if (speedState.progressInterval) {
        clearInterval(speedState.progressInterval);
    }
    
    const duration = DURATIONS[Math.min(speedState.skips, 5)];
    const url = getAudioUrl(speedState.currentSong, speedState.songArtist);
    
    speedState.audio = new Audio(url);
    speedState.audio.currentTime = speedState.startTime;
    
    speedState.audio.play().catch(err => {
        console.error("Error playing audio:", err);
        document.getElementById("speedFeedback").textContent = "Error loading audio. Try again.";
    });
    
    // Button always says "Play" - don't change text
    document.getElementById("speedPlay").textContent = "Play";
    
    const startProgress = speedState.startTime;
    
    speedState.progressInterval = setInterval(() => {
        if (speedState.audio && !speedState.audio.paused) {
            const current = speedState.audio.currentTime;
            const total = speedState.songDuration || 180;
            const overallProgress = (current / total) * 100;
            document.getElementById("speedSongProgressFill").style.width = `${Math.min(100, Math.max(0, overallProgress))}%`;
        }
    }, 50);
    
    setTimeout(() => {
        if (speedState.audio) {
            speedState.audio.pause();
        }
        if (speedState.progressInterval) {
            clearInterval(speedState.progressInterval);
        }
    }, duration * 1000);
};

document.getElementById("speedSkip").onclick = () => {
    // Don't allow skip if we have 5 strikes (6th strike must be incorrect guess)
    if (speedState.strikes >= 5) {
        document.getElementById("speedSkip").disabled = true;
        return;
    }
    if (speedState.gameOver || speedState.guessed || speedState.strikes >= 6) return;
    
    if (speedState.audio) {
        speedState.audio.pause();
    }
    
    speedState.skips++;
    speedState.strikes++;
    addSpeedPenalty(); // 3 second penalty
    
    const strikeIndex = speedState.strikes - 1;
    updateProgressBar('speed', strikeIndex, 'skip', 'Skipped');
    document.getElementById("speedStrikes").textContent = `${speedState.strikes}/6 strikes`;
    
    // Disable skip if we're now at 5 strikes (can't skip for 6th strike)
    if (speedState.strikes >= 5) {
        document.getElementById("speedSkip").disabled = true;
    }
    
    if (speedState.strikes >= 6) {
        endSpeedGame(false);
        return;
    }
    
    if (speedState.progressInterval) {
        clearInterval(speedState.progressInterval);
    }
};

document.getElementById("speedGuess").onclick = () => {
    if (speedState.gameOver || speedState.guessed || speedState.strikes >= 6) return;
    
    const guess = document.getElementById("speedGuessInput").value.trim();
    if (!guess) return;
    
    const songs = getSongsForArtist(selectedArtist || 'travis');
    let matchedSong = null;
    for (const song of songs) {
        if (song.toLowerCase().replace(/'/g, "") === guess.toLowerCase().replace(/'/g, "")) {
            matchedSong = song;
            break;
        }
    }
    
    if (!matchedSong) {
        speedState.strikes++;
        addSpeedPenalty(); // 3 second penalty
        document.getElementById("speedStrikes").textContent = `${speedState.strikes}/6 strikes`;
        const strikeIndex = speedState.strikes - 1;
        updateProgressBar('speed', strikeIndex, 'incorrect', `Guessed "${guess}" Incorrect`);
        document.getElementById("speedFeedback").textContent = `"${guess}": Song not found. Try Again.`;
        document.getElementById("speedFeedback").className = "feedback not-found";
        document.getElementById("speedGuessInput").value = "";
        
        // Disable skip if we're now at 5 strikes (can't skip for 6th strike)
        if (speedState.strikes >= 5) {
            document.getElementById("speedSkip").disabled = true;
        }
        
        if (speedState.strikes >= 6) {
            endSpeedGame(false);
        }
        hideAutocomplete("speed");
        return;
    }
    
    if (matchedSong.toLowerCase() === speedState.currentSong.toLowerCase()) {
        // Correct guess
        speedState.guessed = true;
        const strikeIndex = speedState.strikes;
        updateProgressBar('speed', strikeIndex, 'correct', 'Guessed Correct!');
        document.getElementById("speedStrikes").textContent = `${speedState.strikes}/6 strikes`;
        document.getElementById("speedFeedback").textContent = `Correct!`;
        document.getElementById("speedFeedback").className = "feedback correct";
        
        if (speedState.audio) {
            speedState.audio.pause();
        }
        
        if (speedState.progressInterval) {
            clearInterval(speedState.progressInterval);
        }
        
        // Auto-start next round after short delay
        setTimeout(async () => {
            const completedRound = speedState.round; // Store current round before incrementing
            speedState.round++;
            if (speedState.round > speedState.totalRounds) {
                // Player just completed the final round (15), so completedRound is 15
                endSpeedGame(true, completedRound);
            } else {
                await startSpeedRound();
            }
        }, 1500);
    } else {
        // Incorrect guess
        speedState.strikes++;
        addSpeedPenalty(); // 3 second penalty
        const strikeIndex = speedState.strikes - 1;
        updateProgressBar('speed', strikeIndex, 'incorrect', `Guessed "${matchedSong}" Incorrect`);
        document.getElementById("speedStrikes").textContent = `${speedState.strikes}/6 strikes`;
        document.getElementById("speedFeedback").textContent = `"${matchedSong}": Incorrect. Try Again.`;
        document.getElementById("speedFeedback").className = "feedback incorrect";
        document.getElementById("speedGuessInput").value = "";
        
        if (speedState.strikes >= 6) {
            endSpeedGame(false);
        }
    }
    
    hideAutocomplete("speed");
};

document.getElementById("speedHome").onclick = () => {
    if (speedState.audio) {
        speedState.audio.pause();
    }
    if (speedState.timerInterval) {
        clearInterval(speedState.timerInterval);
    }
    if (speedState.progressInterval) {
        clearInterval(speedState.progressInterval);
    }
    document.getElementById("speedGame").style.display = "none";
    document.getElementById("speedGameOver").style.display = "none";
    home.style.display = "block";
    currentMode = null;
};

document.getElementById("speedRestart").onclick = () => {
    document.getElementById("speedGameOver").style.display = "none";
    document.getElementById("speedGame").style.display = "block";
    startSpeedGame();
};

document.getElementById("speedGameOverHome").onclick = () => {
    document.getElementById("speedGameOver").style.display = "none";
    home.style.display = "block";
    currentMode = null;
};

// Setup autocomplete for Speed mode
setupAutocomplete("speedGuessInput", "speedAutocomplete");

// ---------------------------
// LEADERBOARD POPUP
// ---------------------------
let currentLeaderboardMode = 'solo-regular';

async function loadLeaderboard(mode) {
    const leaderboardContent = document.getElementById("leaderboardContent");
    leaderboardContent.innerHTML = "<p style='text-align: center; color: #999;'>Loading...</p>";
    
    try {
        let response;
        if (mode === 'speed') {
            // Speed mode includes artist in the request
            const artistPrefix = selectedArtist || 'travis';
            response = await fetch(`${BACKEND_URL}/api/speed-leaderboard?artist=${artistPrefix}`);
        } else {
            response = await fetch(`${BACKEND_URL}/api/leaderboard/${mode}`);
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            leaderboardContent.innerHTML = `<p style='text-align: center; color: #ff4444;'>Error loading leaderboard</p>`;
            return;
        }
        
        const leaderboard = data.leaderboard || [];
        
        if (leaderboard.length === 0) {
            leaderboardContent.innerHTML = "<p style='text-align: center; color: #999; padding: 40px;'>No entries yet. Be the first!</p>";
            return;
        }
        
        // Create leaderboard HTML
        let html = '<div class="leaderboard-table">';
        leaderboard.forEach((entry, index) => {
            if (mode === 'speed') {
                const minutes = Math.floor(entry.total_time / 60);
                const seconds = Math.floor(entry.total_time % 60);
                const milliseconds = Math.floor((entry.total_time % 1) * 100);
                const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
                html += `
                    <div class="leaderboard-row ${index < 3 ? 'rank-' + (index + 1) : ''}">
                        <span class="leaderboard-rank">${index + 1}</span>
                        <span class="leaderboard-username">${entry.username || 'Unknown'}</span>
                        <span class="leaderboard-time">${timeString}</span>
                    </div>
                `;
            } else {
                const isSoloMode = mode.startsWith('solo-');
                if (isSoloMode && entry.strikeStats) {
                    // Solo mode with detailed strike stats
                    html += `
                        <div class="leaderboard-row ${index < 3 ? 'rank-' + (index + 1) : ''}">
                            <span class="leaderboard-rank">${index + 1}</span>
                            <span class="leaderboard-username">${entry.username || 'Unknown'}</span>
                            <span class="leaderboard-wins">Wins: ${entry.wins || 0}</span>
                            <span class="leaderboard-losses">Losses: ${entry.losses || 0}</span>
                            <span class="leaderboard-winrate">${entry.winRate || '0.0'}%</span>
                        </div>
                        <div class="leaderboard-strike-stats">
                            <span class="strike-stat">1 try: ${entry.strikeStats[0] || 0}</span>
                            <span class="strike-stat">2 tries: ${entry.strikeStats[1] || 0}</span>
                            <span class="strike-stat">3 tries: ${entry.strikeStats[2] || 0}</span>
                            <span class="strike-stat">4 tries: ${entry.strikeStats[3] || 0}</span>
                            <span class="strike-stat">5 tries: ${entry.strikeStats[4] || 0}</span>
                            <span class="strike-stat">6 tries: ${entry.strikeStats[5] || 0}</span>
                        </div>
                    `;
                } else {
                    // H2H mode or solo without strike stats
                    html += `
                        <div class="leaderboard-row ${index < 3 ? 'rank-' + (index + 1) : ''}">
                            <span class="leaderboard-rank">${index + 1}</span>
                            <span class="leaderboard-username">${entry.username || 'Unknown'}</span>
                            <span class="leaderboard-wins">Wins: ${entry.wins || 0}</span>
                            <span class="leaderboard-losses">Losses: ${entry.losses || 0}</span>
                            <span class="leaderboard-winrate">${entry.winRate || '0.0'}%</span>
                        </div>
                    `;
                }
            }
        });
        html += '</div>';
        leaderboardContent.innerHTML = html;
    } catch (error) {
        console.error("Error loading leaderboard:", error);
        leaderboardContent.innerHTML = `<p style='text-align: center; color: #ff4444;'>Error loading leaderboard</p>`;
    }
}

function showLeaderboardPopup() {
    document.getElementById("leaderboardModal").style.display = "flex";
    const artistPrefix = selectedArtist || 'travis';
    currentLeaderboardMode = `${artistPrefix}-solo-regular`;
    
    // Set active tab - update mode names with artist prefix
    document.querySelectorAll('.leaderboard-tab').forEach(tab => {
        tab.classList.remove('active');
        const baseMode = tab.dataset.mode;
        const prefixedMode = baseMode === 'speed' ? 'speed' : `${artistPrefix}-${baseMode}`;
        if (prefixedMode === currentLeaderboardMode) {
            tab.classList.add('active');
        }
    });
    
    loadLeaderboard(currentLeaderboardMode);
}

function hideLeaderboardPopup() {
    document.getElementById("leaderboardModal").style.display = "none";
}

// Leaderboard button handlers
document.getElementById("showLeaderboardBtn").onclick = showLeaderboardPopup;
document.getElementById("speedLeaderboardBtn").onclick = showLeaderboardPopup;
document.getElementById("leaderboardCloseBtn").onclick = hideLeaderboardPopup;

// Tab click handlers
document.querySelectorAll('.leaderboard-tab').forEach(tab => {
    tab.onclick = () => {
        document.querySelectorAll('.leaderboard-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const baseMode = tab.dataset.mode;
        const artistPrefix = selectedArtist || 'travis';
        currentLeaderboardMode = baseMode === 'speed' ? 'speed' : `${artistPrefix}-${baseMode}`;
        loadLeaderboard(currentLeaderboardMode);
    };
});

// Close modal when clicking outside
document.getElementById("leaderboardModal").onclick = (e) => {
    if (e.target.id === "leaderboardModal") {
        hideLeaderboardPopup();
    }
};

// Leaderboard functionality
async function loadSpeedLeaderboard() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/speed-leaderboard`);
        const data = await response.json();
        
        if (!response.ok) {
            console.error("Failed to load leaderboard");
            return;
        }
        
        const leaderboardList = document.getElementById("leaderboardList");
        leaderboardList.innerHTML = "";
        
        if (!data.leaderboard || data.leaderboard.length === 0) {
            leaderboardList.innerHTML = "<p style='text-align: center; color: #999;'>No entries yet. Be the first!</p>";
            return;
        }
        
        data.leaderboard.forEach((entry, index) => {
            const entryDiv = document.createElement("div");
            entryDiv.className = `leaderboard-entry ${index < 3 ? 'rank-' + (index + 1) : ''}`;
            
            const minutes = Math.floor(entry.total_time / 60);
            const seconds = Math.floor(entry.total_time % 60);
            const milliseconds = Math.floor((entry.total_time % 1) * 100);
            const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
            
            entryDiv.innerHTML = `
                <span class="leaderboard-rank">${index + 1}</span>
                <span class="leaderboard-username">${entry.username}</span>
                <span class="leaderboard-time">${timeString}</span>
            `;
            
            leaderboardList.appendChild(entryDiv);
        });
    } catch (error) {
        console.error("Error loading leaderboard:", error);
    }
}

document.getElementById("leaderboardBack").onclick = () => {
    document.getElementById("speedLeaderboard").style.display = "none";
    home.style.display = "block";
};

// Add leaderboard button to home page (optional - you can add this later)
// For now, leaderboard can be accessed after completing Speed mode

// ---------------------------
// H2H MODE - LOBBY
// ---------------------------
document.getElementById("create").onclick = () => {
    const username = document.getElementById("createUsername").value.trim();
    if (!username) {
        alert("Enter your username");
        return;
    }
    
    h2hState.username = username;
    h2hState.gameMode = gameMode;
    socket.emit("createLobby", { 
        username, 
        gameMode,
        artist: selectedArtist || 'travis'
    });
};

socket.on("lobbyCreated", data => {
    h2hState.lobbyId = data.lobbyId;
    h2hState.currentSong = data.song;
    // In "choose rappers" mode, determine which artist this song belongs to
    if (selectedArtist === 'chooserappers') {
        const artists = getArtistsForSong(data.song).filter(a => selectedRappers.includes(a));
        if (artists.length > 0) {
            h2hState.songArtist = artists[Math.floor(Math.random() * artists.length)];
        } else {
            h2hState.songArtist = selectedRappers[0] || 'travis';
        }
    } else {
        h2hState.songArtist = null;
    }
    h2hState.startTime = data.startTime;
    h2hState.skips = 0;
    h2hState.strikes = 0;
    h2hState.gameStarted = false;
    h2hState.playerCount = data.playerCount || 1;
    h2hState.scores = data.scores || {};
    h2hState.roundFinished = false;
    h2hState.finished = false;

    h2hMenu.style.display = "none";
    h2hGame.style.display = "block";

    document.getElementById("lobbyText").innerText = `Lobby: ${data.lobbyId} (Share this code!)`;
    document.getElementById("h2hStrikes").textContent = "0/6 strikes";
    document.getElementById("h2hStatus").textContent = data.playerCount < 2 ? "Waiting for opponent... (1/2)" : "Game starting...";
    document.getElementById("h2hFeedback").textContent = "";
    document.getElementById("h2hFeedback").className = "feedback";
    document.getElementById("h2hGuessInput").value = "";
    updateScoreDisplay();
    disableGameControls();
    document.getElementById("h2hNewGame").disabled = true;
    document.getElementById("h2hRequestNewSong").disabled = true;
    
    // Reset progress bars
    for (let i = 1; i <= 6; i++) {
        const bar = document.getElementById(`h2hBar${i}`);
        if (bar) {
            bar.className = 'progress-bar';
            bar.textContent = '';
        }
    }
    
    // Setup chat resize functionality
    setTimeout(() => setupChatResize(), 100);
});

document.getElementById("join").onclick = () => {
    const username = document.getElementById("joinUsername").value.trim();
    const id = document.getElementById("joinId").value.trim();

    if (!username || !id) { 
        alert("Enter username + lobby code"); 
        return; 
    }

    h2hState.lobbyId = id;
    h2hState.username = username;

    socket.emit("joinLobby", { lobbyId: id, username });
};

socket.on("playerJoined", data => {
    console.log("Player joined event received:", data);
    h2hState.playerCount = data.playerCount;
    h2hState.scores = data.scores || {};
    updateScoreDisplay();
    
    if (data.playerCount < 2) {
        document.getElementById("h2hStatus").textContent = `Waiting for opponent... (${data.playerCount}/2)`;
        disableGameControls();
    } else {
        // Game will start, wait for gameStart event
        document.getElementById("h2hStatus").textContent = "Game starting... (2/2)";
        // Note: gameStart event will handle the actual UI update
    }
});

socket.on("gameStart", data => {
    console.log("Received gameStart event:", data, "Current state:", h2hState);
    
    // Make sure we're in the game view
    h2hMenu.style.display = "none";
    h2hGame.style.display = "block";
    
    h2hState.currentSong = data.song;
    // In "choose rappers" mode, determine which artist this song belongs to
    if (selectedArtist === 'chooserappers') {
        const artists = getArtistsForSong(data.song).filter(a => selectedRappers.includes(a));
        if (artists.length > 0) {
            h2hState.songArtist = artists[Math.floor(Math.random() * artists.length)];
        } else {
            h2hState.songArtist = selectedRappers[0] || 'travis';
        }
    } else {
        h2hState.songArtist = null;
    }
    h2hState.startTime = data.startTime;
    h2hState.gameMode = data.gameMode || 'regular';
    h2hState.skips = 0;
    h2hState.guessed = false;
    h2hState.strikes = 0;
    h2hState.gameStarted = true;
    h2hState.roundFinished = false;
    h2hState.finished = false;
    h2hState.scores = data.scores || {};
    
    // Update lobby ID if provided
    if (data.lobbyId) {
        h2hState.lobbyId = data.lobbyId;
    }

    const statusEl = document.getElementById("h2hStatus");
    const lobbyTextEl = document.getElementById("lobbyText");
    
    if (lobbyTextEl) {
        lobbyTextEl.innerText = "Lobby: " + h2hState.lobbyId;
    }
    if (statusEl) {
        statusEl.textContent = "Game started!";
    }
    
    document.getElementById("h2hStrikes").textContent = "0/6 strikes";
    document.getElementById("h2hFeedback").textContent = "";
    document.getElementById("h2hFeedback").className = "feedback";
    document.getElementById("h2hGuessInput").value = "";
    updateScoreDisplay();
    enableGameControls();
    document.getElementById("h2hNewGame").disabled = true;
    document.getElementById("h2hRequestNewSong").disabled = false;
    document.getElementById("h2hPlay").textContent = "Play";
    
    // Reset progress bars
    for (let i = 1; i <= 6; i++) {
        const bar = document.getElementById(`h2hBar${i}`);
        if (bar) {
            bar.className = 'progress-bar';
            bar.textContent = '';
        }
    }
    
    // Reset song progress bar
    const progressFill = document.getElementById("h2hSongProgressFill");
    if (progressFill) {
        progressFill.style.width = "0%";
    }
    
    // Get song duration for progress bar
    // Determine song artist for duration calculation
    let songArtist = null;
    if (selectedArtist === 'allrappers') {
        songArtist = selectArtistForSong(data.song);
    }
    getSongDuration(data.song, songArtist).then(duration => {
        h2hState.songDuration = duration;
    });
    
    // Setup chat resize functionality after DOM is ready
    setTimeout(() => setupChatResize(), 100);
});


socket.on("lobbyError", msg => {
    alert(msg);
});

// ---------------------------
// H2H MODE - GAMEPLAY
// ---------------------------
function enableGameControls() {
    document.getElementById("h2hPlay").disabled = false;
    document.getElementById("h2hSkip").disabled = false;
    document.getElementById("h2hGuess").disabled = false;
}

function disableGameControls() {
    document.getElementById("h2hPlay").disabled = true;
    document.getElementById("h2hSkip").disabled = true;
    document.getElementById("h2hGuess").disabled = true;
}

function updateScoreDisplay() {
    const scoreDiv = document.getElementById("h2hScore");
    if (Object.keys(h2hState.scores).length === 0) {
        scoreDiv.textContent = "";
        return;
    }
    
    let scoreText = "Score: ";
    const players = Object.keys(h2hState.scores);
    scoreText += players.map(username => {
        const score = h2hState.scores[username];
        return `${username} (${score.wins}W-${score.losses}L)`;
    }).join(" | ");
    
    scoreDiv.textContent = scoreText;
}

document.getElementById("h2hPlay").onclick = () => {
    if (!h2hState.currentSong) return;
    
    // If round is finished, play full song
    if (h2hState.roundFinished) {
        if (h2hState.audio) {
            if (!h2hState.audio.paused) {
                h2hState.audio.pause();
                document.getElementById("h2hPlay").textContent = "Play";
                return;
            } else {
                h2hState.audio.pause();
                h2hState.audio = null;
            }
        }
        
        const url = getAudioUrl(h2hState.currentSong, h2hState.songArtist);
        h2hState.audio = new Audio(url);
        h2hState.audio.currentTime = 0;
        
        h2hState.audio.play().catch(err => {
            console.error("Error playing audio:", err);
            document.getElementById("h2hStatus").textContent = "Error loading audio. Try again.";
        });
        
        document.getElementById("h2hPlay").textContent = "Pause";
        
        h2hState.audio.onended = () => {
            document.getElementById("h2hPlay").textContent = "Play";
        };
        
        h2hState.audio.onpause = () => {
            document.getElementById("h2hPlay").textContent = "Play";
        };
        
        return;
    }
    
    // Normal gameplay - play snippet
    if (h2hState.guessed || !h2hState.gameStarted) return;
    
    if (h2hState.audio) {
        h2hState.audio.pause();
        h2hState.audio = null;
    }
    
    const duration = DURATIONS[Math.min(h2hState.skips, 5)];
    const url = getAudioUrl(h2hState.currentSong, h2hState.songArtist);
    
    h2hState.audio = new Audio(url);
    h2hState.audio.currentTime = h2hState.startTime;
    
    h2hState.audio.play().catch(err => {
        console.error("Error playing audio:", err);
        document.getElementById("h2hStatus").textContent = "Error loading audio. Try again.";
    });
    
    setTimeout(() => {
        if (h2hState.audio) {
            h2hState.audio.pause();
        }
    }, duration * 1000);
};

document.getElementById("h2hSkip").onclick = () => {
    // Don't allow skip if we have 5 strikes (6th strike must be incorrect guess)
    if (h2hState.strikes >= 5) {
        document.getElementById("h2hSkip").disabled = true;
        return;
    }
    if (h2hState.guessed || !h2hState.currentSong || h2hState.strikes >= 6 || !h2hState.gameStarted || h2hState.roundFinished) return;
    
    h2hState.skips++;
    h2hState.strikes++;
    const strikeIndex = h2hState.strikes - 1;
    updateProgressBar('h2h', strikeIndex, 'skip', 'Skipped');
    document.getElementById("h2hStrikes").textContent = `${h2hState.strikes}/6 strikes`;
    
    // Disable skip if we're now at 5 strikes (can't skip for 6th strike)
    if (h2hState.strikes >= 5) {
        document.getElementById("h2hSkip").disabled = true;
    }
    
        if (h2hState.strikes >= 6) {
            h2hState.finished = true;
            document.getElementById("h2hSkip").disabled = true;
            document.getElementById("h2hGuess").disabled = true;
            document.getElementById("h2hFeedback").textContent = `Out of strikes! Waiting for song name...`;
            document.getElementById("h2hFeedback").className = "feedback incorrect";
            if (h2hState.audio) {
                h2hState.audio.pause();
            }
            // Notify server that player struck out
            socket.emit("playerStrikesOut", {
                lobbyId: h2hState.lobbyId,
                username: h2hState.username,
                strikes: h2hState.strikes
            });
            return;
        }
    
    if (h2hState.audio) {
        h2hState.audio.pause();
        h2hState.audio = null;
    }
};

document.getElementById("h2hGuess").onclick = () => {
    if (h2hState.guessed || !h2hState.currentSong || !h2hState.username || h2hState.strikes >= 6 || !h2hState.gameStarted || h2hState.roundFinished) return;
    
    const guess = document.getElementById("h2hGuessInput").value.trim();
    if (!guess) return;
    
    // Check if song exists in list
    const songs = getSongsForArtist(selectedArtist || 'travis');
    let matchedSong = null;
    for (const song of songs) {
        if (song.toLowerCase().replace(/'/g, "") === guess.toLowerCase().replace(/'/g, "")) {
            matchedSong = song;
            break;
        }
    }
    
    if (!matchedSong) {
        h2hState.strikes++;
        const strikeIndex = h2hState.strikes - 1;
        updateProgressBar('h2h', strikeIndex, 'incorrect', `Guessed "${guess}" Incorrect`);
        document.getElementById("h2hStrikes").textContent = `${h2hState.strikes}/6 strikes`;
        document.getElementById("h2hFeedback").textContent = `"${guess}": Song not found. Try Again.`;
        document.getElementById("h2hFeedback").className = "feedback not-found";
        document.getElementById("h2hGuessInput").value = "";
        
        // Disable skip if we're now at 5 strikes (can't skip for 6th strike)
        if (h2hState.strikes >= 5) {
            document.getElementById("h2hSkip").disabled = true;
        }
        
        if (h2hState.strikes >= 6) {
            h2hState.finished = true;
            document.getElementById("h2hSkip").disabled = true;
            document.getElementById("h2hGuess").disabled = true;
            document.getElementById("h2hFeedback").textContent = `Out of strikes! Waiting for song name...`;
            document.getElementById("h2hFeedback").className = "feedback incorrect";
            if (h2hState.audio) {
                h2hState.audio.pause();
            }
            // Notify server that player struck out
            socket.emit("playerStrikesOut", {
                lobbyId: h2hState.lobbyId,
                username: h2hState.username,
                strikes: h2hState.strikes
            });
        }
        hideAutocomplete("h2h");
        return;
    }
    
    const duration = DURATIONS[Math.min(h2hState.skips, 5)];
    const timestamp = Date.now();
    
    if (matchedSong.toLowerCase() === h2hState.currentSong.toLowerCase()) {
        // Correct guess - don't increment strikes, use current strike count
        const currentStrikes = h2hState.strikes;
        socket.emit("playerGuess", {
            lobbyId: h2hState.lobbyId,
            username: h2hState.username,
            guess: matchedSong,
            duration: duration,
            timestamp: timestamp,
            strikes: currentStrikes
        });
        h2hState.guessed = true;
        h2hState.finished = true;
        const strikeIndex = h2hState.strikes;
        updateProgressBar('h2h', strikeIndex, 'correct', 'Guessed Correct!');
        document.getElementById("h2hStrikes").textContent = `${h2hState.strikes}/6 strikes`;
        document.getElementById("h2hFeedback").textContent = `Correct! Waiting for opponent...`;
        document.getElementById("h2hFeedback").className = "feedback correct";
        if (h2hState.audio) {
            h2hState.audio.pause();
        }
        if (h2hState.progressInterval) {
            clearInterval(h2hState.progressInterval);
        }
    } else {
        // Incorrect guess - increment strikes
        h2hState.strikes++;
        const strikeIndex = h2hState.strikes - 1;
        updateProgressBar('h2h', strikeIndex, 'incorrect', `Guessed "${matchedSong}" Incorrect`);
        document.getElementById("h2hStrikes").textContent = `${h2hState.strikes}/6 strikes`;
        document.getElementById("h2hFeedback").textContent = `"${matchedSong}": Incorrect. Try Again.`;
        document.getElementById("h2hFeedback").className = "feedback incorrect";
        document.getElementById("h2hGuessInput").value = "";
        
        if (h2hState.strikes >= 6) {
            h2hState.finished = true;
            document.getElementById("h2hSkip").disabled = true;
            document.getElementById("h2hGuess").disabled = true;
            document.getElementById("h2hFeedback").textContent = `Out of strikes! Waiting for song name...`;
            document.getElementById("h2hFeedback").className = "feedback incorrect";
            if (h2hState.audio) {
                h2hState.audio.pause();
            }
            // Notify server that player struck out
            socket.emit("playerStrikesOut", {
                lobbyId: h2hState.lobbyId,
                username: h2hState.username,
                strikes: h2hState.strikes
            });
        }
    }
    
    hideAutocomplete("h2h");
};

socket.on("opponentStrikesOut", data => {
    document.getElementById("h2hStatus").textContent = `${data.username} ran out of strikes!`;
});

socket.on("playerStrikesOutResponse", data => {
    document.getElementById("h2hFeedback").textContent = `Out of strikes! The song was: ${data.song}`;
    document.getElementById("h2hFeedback").className = "feedback incorrect";
    // Show result modal
    showSongResultModal(data.song, `Incorrect! The song was: ${data.song}`, false);
});

socket.on("gameOver", data => {
    h2hState.roundFinished = true;
    h2hState.scores = data.scores || h2hState.scores;
    updateScoreDisplay();
    
    const songName = data.song || h2hState.currentSong;
    const isWinner = data.winner === h2hState.username;
    const guessedCorrectly = h2hState.guessed; // Check if current player guessed correctly
    
    let message = "";
    let feedbackMessage = "";
    
    // Save stats for H2H game
    const artistPrefix = selectedArtist || 'travis';
    const h2hMode = `${artistPrefix}-h2h-${h2hState.gameMode || 'regular'}`;
    saveGameStats(h2hMode, isWinner);
    if (h2hState.guessed) {
        saveGameHistory(h2hMode, songName, h2hState.strikes, isWinner);
    }
    
    if (isWinner) {
        message = `You won! You guessed in ${data.winnerDuration}s with ${data.winnerStrikes || '?'} strikes`;
        document.getElementById("h2hFeedback").className = "feedback correct";
        feedbackMessage = `Correct song: ${songName}`;
    } else {
        // Current player lost
        if (guessedCorrectly && data.winnerStrikes !== undefined) {
            // Player guessed correctly but lost (both guessed correctly)
            if (data.sameStrikes) {
                // Same strikes, opponent guessed first
                message = `${data.winner} guessed "${songName}" in first`;
            } else {
                // Opponent had fewer strikes
                const winnerTries = data.winnerStrikes !== undefined ? data.winnerStrikes + 1 : '?';
                message = `${data.winner} guessed "${songName}" in ${winnerTries} tries`;
            }
            document.getElementById("h2hFeedback").className = "feedback correct";
            feedbackMessage = `Correct song: ${songName}`;
        } else {
            // Player struck out
            message = `${data.winner} won! They guessed in ${data.winnerDuration}s with ${data.winnerStrikes || '?'} strikes`;
            document.getElementById("h2hFeedback").className = "feedback incorrect";
            feedbackMessage = `Out of strikes! The song was: ${songName}`;
        }
    }
    
    document.getElementById("h2hStatus").textContent = message;
    
    // Enable request new song button
    document.getElementById("h2hRequestNewSong").disabled = false;
    document.getElementById("h2hFeedback").textContent = feedbackMessage;
    h2hState.finished = true;
    
    // Disable game controls
    disableGameControls();
    
    // Enable New Game button
    document.getElementById("h2hNewGame").disabled = false;
    
    if (h2hState.audio) {
        h2hState.audio.pause();
    }
    
    // Show result modal
    const winnerTries = data.winnerStrikes !== undefined ? data.winnerStrikes + 1 : '?';
    const resultMessage = isWinner 
        ? `You guessed "${songName}" in ${winnerTries} tries!`
        : guessedCorrectly && data.winnerStrikes !== undefined
            ? (data.sameStrikes 
                ? `${data.winner} guessed "${songName}" in first`
                : `${data.winner} guessed "${songName}" in ${winnerTries} tries`)
            : `Incorrect! The song was: ${songName}`;
    
    showSongResultModal(songName, resultMessage, guessedCorrectly || isWinner);
});

document.getElementById("h2hRequestNewSong").onclick = () => {
    if (!h2hState.gameStarted || h2hState.roundFinished) return;
    socket.emit("requestNewSong", { 
        lobbyId: h2hState.lobbyId, 
        username: h2hState.username 
    });
    document.getElementById("h2hRequestNewSong").disabled = true;
    document.getElementById("h2hStatus").textContent = "Requested new song. Waiting for other player...";
};

socket.on("newSongRequestStatus", data => {
    const requested = data.requests.length;
    const total = data.total;
    if (requested < total) {
        document.getElementById("h2hStatus").textContent = `New song requested (${requested}/${total} players)`;
    }
});

document.getElementById("h2hNewGame").onclick = () => {
    if (!h2hState.roundFinished) return;
    socket.emit("newRound", { lobbyId: h2hState.lobbyId });
    document.getElementById("h2hRequestNewSong").disabled = true;
};

// ---------------------------
// CHAT FUNCTIONALITY
// ---------------------------
document.getElementById("h2hChatSend").onclick = () => {
    const input = document.getElementById("h2hChatInput");
    const message = input.value.trim();
    if (!message) return;
    
    if (!h2hState.username || !h2hState.lobbyId) {
        alert("Not in a lobby yet");
        return;
    }
    
    console.log("Sending chat message:", { lobbyId: h2hState.lobbyId, username: h2hState.username, message });
    
    socket.emit("chatMessage", {
        lobbyId: h2hState.lobbyId,
        username: h2hState.username,
        message: message
    });
    
    input.value = "";
};

document.getElementById("h2hChatInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        document.getElementById("h2hChatSend").click();
    }
});

socket.on("chatMessage", data => {
    console.log("Received chat message:", data);
    const chatMessages = document.getElementById("h2hChatMessages");
    if (!chatMessages) {
        console.error("Chat messages container not found!");
        return;
    }
    
    const messageDiv = document.createElement("div");
    messageDiv.className = "chat-message";
    
    const time = new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    // Color: green for own name, yellow for opponent
    const isOwnMessage = data.username === h2hState.username;
    const usernameColor = isOwnMessage ? '#0f0' : '#ff0';
    
    messageDiv.innerHTML = `<span class="username" style="color: ${usernameColor};">${data.username}:</span> ${data.message} <span style="color: #666; font-size: 11px; margin-left: 5px;">${time}</span>`;
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    requestAnimationFrame(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
});

// ---------------------------
// CHAT RESIZE FUNCTIONALITY
// ---------------------------
let chatResizeState = {
    isResizing: false,
    startY: 0,
    startHeight: 0,
    initialized: false
};

function setupChatResize() {
    const resizeHandle = document.getElementById("h2hChatResize");
    const chatContainer = document.getElementById("h2hChatContainer");
    
    if (!resizeHandle || !chatContainer || chatResizeState.initialized) return;
    
    chatResizeState.initialized = true;
    
    resizeHandle.addEventListener("mousedown", (e) => {
        chatResizeState.isResizing = true;
        chatResizeState.startY = e.clientY;
        chatResizeState.startHeight = chatContainer.offsetHeight;
        document.body.style.cursor = "ns-resize";
        e.preventDefault();
    });
    
    document.addEventListener("mousemove", (e) => {
        if (!chatResizeState.isResizing) return;
        
        const deltaY = chatResizeState.startY - e.clientY; // Inverted because we're resizing from top
        const newHeight = Math.max(120, Math.min(600, chatResizeState.startHeight + deltaY));
        chatContainer.style.height = newHeight + "px";
        
        // Update game container padding
        const h2hGame = document.getElementById("h2hGame");
        if (h2hGame) {
            h2hGame.style.paddingBottom = (newHeight + 20) + "px";
        }
    });
    
    document.addEventListener("mouseup", () => {
        if (chatResizeState.isResizing) {
            chatResizeState.isResizing = false;
            document.body.style.cursor = "";
        }
    });
}


socket.on("opponentGuess", data => {
    document.getElementById("h2hStatus").textContent = `${data.username} guessed! Waiting for results...`;
});

// ---------------------------
// AUTocomplete FUNCTIONALITY
// ---------------------------
function setupAutocomplete(inputId, listId) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    
    input.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query === "") {
            list.style.display = "none";
            return;
        }
        
    ensureArtistSelected();
    const songs = getSongsForArtist(selectedArtist || 'travis');
    const filtered = songs.filter(song => 
        song.toLowerCase().replace(/'/g, "").startsWith(query.replace(/'/g, ""))
    );
        
        if (filtered.length === 0) {
            list.style.display = "none";
            return;
        }
        
        list.innerHTML = "";
        filtered.slice(0, 10).forEach(song => {
            const item = document.createElement("div");
            item.className = "autocomplete-item";
            item.textContent = song;
            item.onclick = () => {
                input.value = song;
                list.style.display = "none";
            };
            list.appendChild(item);
        });
        
        list.style.display = "block";
    });
    
    input.addEventListener("blur", () => {
        setTimeout(() => {
            list.style.display = "none";
        }, 200);
    });
    
    input.addEventListener("keydown", (e) => {
        const items = list.querySelectorAll(".autocomplete-item");
        let selected = Array.from(items).findIndex(item => 
            item.style.backgroundColor !== ""
        );
        
        if (e.key === "ArrowDown") {
            e.preventDefault();
            selected = (selected + 1) % items.length;
            items.forEach((item, i) => {
                item.style.backgroundColor = i === selected ? "#555" : "";
            });
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            selected = selected <= 0 ? items.length - 1 : selected - 1;
            items.forEach((item, i) => {
                item.style.backgroundColor = i === selected ? "#555" : "";
            });
        } else if (e.key === "Enter" && selected >= 0 && items[selected]) {
            e.preventDefault();
            input.value = items[selected].textContent;
            list.style.display = "none";
        }
    });
}

function hideAutocomplete(mode) {
    let listId;
    if (mode === "solo") {
        listId = "soloAutocomplete";
    } else if (mode === "h2h") {
        listId = "h2hAutocomplete";
    } else if (mode === "speed") {
        listId = "speedAutocomplete";
    } else {
        return;
    }
    const list = document.getElementById(listId);
    if (list) {
        list.style.display = "none";
    }
}

// ---------------------------
// SONG RESULT MODAL
// ---------------------------
function getAlbumCoverUrl(songName) {
    // Check if we have a custom cover mapped
    const albumMap = getAlbumMapForArtist(selectedArtist || 'travis');
    if (albumMap[songName]) {
        const albumName = albumMap[songName];
        // Try common image extensions
        return `${SUPABASE_COVERS_BASE}/${encodeURIComponent(albumName)}.jpg`;
    }
    // Default album cover based on artist
    const defaultCover = 'travis';
    return `${SUPABASE_COVERS_BASE}/${defaultCover}.jpg`;
}

function showSongResultModal(songName, resultMessage, isCorrect) {
    const modal = document.getElementById("songResultModal");
    const albumImage = document.getElementById("modalAlbumImage");
    const songNameEl = document.getElementById("modalSongName");
    const resultMessageEl = document.getElementById("modalResultMessage");
    
    // Set song name
    songNameEl.textContent = songName;
    
    // Set result message
    resultMessageEl.textContent = resultMessage;
    resultMessageEl.style.color = isCorrect ? "#0f0" : "#ff4444";
    
    // Load album cover
    const coverUrl = getAlbumCoverUrl(songName);
    albumImage.src = coverUrl;
    albumImage.onerror = () => {
        // If image fails to load, use a placeholder
        albumImage.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Crect fill='%23333' width='250' height='250'/%3E%3Ctext fill='%23999' font-family='Arial' font-size='16' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Cover%3C/text%3E%3C/svg%3E";
    };
    
    // Show modal
    modal.style.display = "flex";
}

function hideSongResultModal() {
    const modal = document.getElementById("songResultModal");
    modal.style.display = "none";
}

// Setup modal handlers after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.getElementById("modalCloseBtn");
    const modal = document.getElementById("songResultModal");
    
    if (closeBtn) {
        closeBtn.onclick = hideSongResultModal;
    }
    
    if (modal) {
        modal.onclick = (e) => {
            if (e.target.id === "songResultModal") {
                hideSongResultModal();
            }
        };
    }
    
    // Close on Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            const modalEl = document.getElementById("songResultModal");
            if (modalEl && modalEl.style.display === "flex") {
                hideSongResultModal();
            }
        }
    });
});

// Setup autocomplete for H2H
setupAutocomplete("h2hGuessInput", "h2hAutocomplete");
