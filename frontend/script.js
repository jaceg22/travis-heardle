// ---------------------------
// CONFIG
// ---------------------------
let SUPABASE_BASE = "https://ggkanqgcvvxtpdhzmoon.supabase.co/storage/v1/object/public/songs";
const SUPABASE_COVERS_BASE = "https://ggkanqgcvvxtpdhzmoon.supabase.co/storage/v1/object/public/album";
const BACKEND_URL = "https://travis-heardle.onrender.com";

// Helper function to update SUPABASE_BASE based on artist
function updateSupabaseBase(artist) {
    if (artist === 'jcole') {
        SUPABASE_BASE = "https://ggkanqgcvvxtpdhzmoon.supabase.co/storage/v1/object/public/JCole";
        window.SUPABASE_BASE = SUPABASE_BASE;
    } else if (artist === 'drake') {
        SUPABASE_BASE = "https://ggkanqgcvvxtpdhzmoon.supabase.co/storage/v1/object/public/Drake";
        window.SUPABASE_BASE = SUPABASE_BASE;
    } else if (artist === 'bbbm') {
        SUPABASE_BASE = "https://ggkanqgcvvxtpdhzmoon.supabase.co/storage/v1/object/public/BBBM";
        window.SUPABASE_BASE = SUPABASE_BASE;
    } else if (artist === 'liltecca') {
        SUPABASE_BASE = "https://ggkanqgcvvxtpdhzmoon.supabase.co/storage/v1/object/public/Lil%20Tecca";
        window.SUPABASE_BASE = SUPABASE_BASE;
    } else {
        SUPABASE_BASE = "https://ggkanqgcvvxtpdhzmoon.supabase.co/storage/v1/object/public/songs";
        window.SUPABASE_BASE = SUPABASE_BASE;
    }
}

// Update SUPABASE_BASE on load if artist is selected
const savedArtist = localStorage.getItem('selectedArtist');
if (savedArtist) {
    updateSupabaseBase(savedArtist);
}

// ---------------------------
// USER AUTHENTICATION STATE
// ---------------------------
let currentUser = null;
let selectedArtist = null; // 'travis', 'jcole', 'drake', 'bbbm', or 'liltecca'

// Check if user is logged in from localStorage
function initAuth() {
    const savedUser = localStorage.getItem('currentUser');
    const skipLogin = localStorage.getItem('skipLogin');
    const savedArtist = localStorage.getItem('selectedArtist');
    
    // Set selectedArtist from localStorage if it exists (for initialization)
    if (savedArtist) {
        selectedArtist = savedArtist;
        updateSupabaseBase(savedArtist);
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
    document.getElementById("home").style.display = "none";
    document.getElementById("soloGame").style.display = "none";
    document.getElementById("h2hMenu").style.display = "none";
    document.getElementById("h2hGame").style.display = "none";
    document.getElementById("speedGame").style.display = "none";
    document.getElementById("speedGameOver").style.display = "none";
    document.getElementById("speedLeaderboard").style.display = "none";
}

function showHomePage() {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("artistSelection").style.display = "none";
    document.getElementById("home").style.display = "block";
    document.getElementById("soloGame").style.display = "none";
    document.getElementById("h2hMenu").style.display = "none";
    document.getElementById("h2hGame").style.display = "none";
    document.getElementById("speedGame").style.display = "none";
    document.getElementById("speedGameOver").style.display = "none";
    document.getElementById("speedLeaderboard").style.display = "none";
    
    // Update title based on selected artist
    if (selectedArtist === 'jcole') {
        document.querySelector("#home h1").textContent = "J. Cole Heardle";
    } else if (selectedArtist === 'drake') {
        document.querySelector("#home h1").textContent = "Drake Heardle";
    } else if (selectedArtist === 'bbbm') {
        document.querySelector("#home h1").textContent = "Big Black Banana Man Heardle";
    } else if (selectedArtist === 'liltecca') {
        document.querySelector("#home h1").textContent = "Lil Tecca Heardle";
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

document.getElementById("jcoleSelectBtn").onclick = () => {
    selectArtist('jcole');
};

document.getElementById("drakeSelectBtn").onclick = () => {
    selectArtist('drake');
};

document.getElementById("bbbmSelectBtn").onclick = () => {
    selectArtist('bbbm');
};

document.getElementByIddocument.getElementById("lilteccaSelectBtn").onclick = () => {
    selectArtist('liltecca');
};

// Helper function to ensure selectedArtist is initialized from localStorage
function ensureArtistSelected() {
    if (!selectedArtist) {
        const savedArtist = localStorage.getItem('selectedArtist');
        if (savedArtist) {
            selectedArtist = savedArtist;
            updateSupabaseBase(savedArtist);
        } else {
            // Default to travis if no artist selected
            selectedArtist = 'travis';
            updateSupabaseBase('travis');
        }
    }
}

function selectArtist(artist) {
    selectedArtist = artist;
    localStorage.setItem('selectedArtist', artist);
    
    // Update Supabase base URL based on artist
    updateSupabaseBase(artist);
    
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

// J. Cole songs list
const JCOLE_SONGS = [
  // 2014 Forest Hills Drive
  "January 28th",
  "Wet Dreamz",
  "03' Adolescence",
  "A Tale of 2 Citiez",
  "Fire Squad",
  "St. Tropez",
  "G.O.M.D.",
  "No Role Modelz",
  "Hello",
  "Apparently",
  "Love Yourz",
  "Note to Self",
  
  // 4 Your Eyez Only
  "For Whom the Bell Tolls",
  "Immortal",
  "Deja Vu",
  "Ville Mentality",
  "She's Mine Pt. 1",
  "Change",
  "Neighbors",
  "Foldin Clothes",
  "She's Mine Pt. 2",
  "4 Your Eyez Only",
  
  // Born Sinner
  "Villuminati",
  "Kerney Sermon (Skit)",
  "LAnd of the Snakes",
  "Power Trip (feat. Miguel)",
  "Mo Money (Interlude)",
  "Trouble",
  "Runaway",
  "She Knows (feat. Amber Coffman & Cults)",
  "Rich Niggaz",
  "Where's Jermaine (Skit)",
  "Forbidden Fruit (feat. Kendrick Lamar)",
  "Chaining Day",
  "Ain't That Some Shit (Interlude)",
  "Crooked Smile (feat. TLC)",
  "Let Nas Down",
  "Born Sinner (feat. @Fauntleroy)",
  "Miss America",
  "New York Times (feat. 50 Cent & Bas)",
  "Is She Gon Pop",
  "Niggaz Know",
  "Sparks Will Fly (feat. Jhene Aiko)",
  
  // Cole World: The Sideline Story
  "Dollar and a Dream III",
  "Can't Get Enough (feat. Trey Songz)",
  "Lights Please",
  "Interlude",
  "Sideline Story",
  "Mr. Nice Watch (feat. Jay-Z)",
  "Cole World",
  "In the Morning (feat. Drake)",
  "Lost Ones",
  "Nobody's Perfect (feat. Missy Elliott)",
  "Never Told",
  "Rise & Shine",
  "God's Gift",
  "Breakdown",
  "Work Out",
  "Who Dat",
  "Daddy's Little Girl",
  
  // Friday Night Lights
  "Friday Night Lights (Intro)",
  "Too Deep for the Intro",
  "Before I'm Gone",
  "Back to the Topic (Freestyle)",
  "You Got It (feat. Wale)",
  "Villematic",
  "Enchanted (feat. Wale)",
  "Blow Up",
  "Higher",
  "In the Morning (feat. Drake)",
  "2Face",
  "The Autograph",
  "Best Friend",
  "Cost Me a Lot",
  "Premeditated Murder",
  "Home for the Holidays",
  "Love Me Not",
  "See World",
  "Farewell",
  "Looking for Trouble (feat. Kanye West, Big Sean, Pusha T & Cyhi Da Prince)",
  
  // KOD
  "KOD",
  "Photograph",
  "The Cut Off (feat. kiLL edward)",
  "ATM",
  "Motiv8",
  "Kevins Heart",
  "BRACKETS",
  "Once an Addict (Interlude)",
  "FRIENDS (feat. kiLL edward)",
  "Window Pain (Outro)",
  "1985 (Intro to The Fall Off)",
  
  // The Come Up
  "Simba",
  "I'm the Man",
  "School Daze",
  "Dollar and a Dream",
  "Throw It Up",
  "Quote Me",
  "College Boy",
  "Split You Up",
  "Plain",
  "The Come Up",
  "Mighty Crazy",
  "Dead Presidents",
  "Lil' Ghetto Nigga",
  "Homecoming",
  "Carolina On My Mind",
  "Can't Cry",
  "Goin' Off",
  "Rags to Riches (At the Beep)",
  "Get It",
  "I Do My Thing",
  
  // The Warm Up
  "The Warm Up (Intro)",
  "Welcome",
  "Can I Live",
  "Grown Simba",
  "Just to Get By",
  "Lights Please",
  "Dead Presidents 2",
  "I Get Up",
  "World Is Empty",
  "Dreams (feat. Brandon Hines)",
  "Royal Flush",
  "Dollar and a Dream II",
  "Water Break (Interlude)",
  "Heartache",
  "Get Away",
  "Knock Knock",
  "Ladies (feat. Lee Fields & The Expressionists)",
  "Til Infinity",
  "The Badness (feat. Omen)",
  "Hold It Down",
  "Last Call",
  "Losing My Balance",
  
  // Truly Yours Vol. 1
  "Can I Holla At Ya",
  "Crunch Time",
  "Rise Above",
  "Tears for ODB",
  "Stay (2009)",
  
  // Truly Yours, Vol. 2
  "Cole Summer",
  "Kenny Lofton (feat. Young Jeezy)",
  "Chris Tucker (feat. 2 Chainz)",
  "Head Bussa",
  "Cousins (feat. Bas)",
  "3 Wishes"
];

// J. Cole album mapping
const JCOLE_ALBUM_COVERS = {
  // 2014 Forest Hills Drive
  "January 28th": "foresthills",
  "Wet Dreamz": "foresthills",
  "03' Adolescence": "foresthills",
  "A Tale of 2 Citiez": "foresthills",
  "Fire Squad": "foresthills",
  "St. Tropez": "foresthills",
  "G.O.M.D.": "foresthills",
  "No Role Modelz": "foresthills",
  "Hello": "foresthills",
  "Apparently": "foresthills",
  "Love Yourz": "foresthills",
  "Note to Self": "foresthills",
  
  // 4 Your Eyez Only
  "For Whom the Bell Tolls": "foureyez",
  "Immortal": "foureyez",
  "Deja Vu": "foureyez",
  "Ville Mentality": "foureyez",
  "She's Mine Pt. 1": "foureyez",
  "Change": "foureyez",
  "Neighbors": "foureyez",
  "Foldin Clothes": "foureyez",
  "She's Mine Pt. 2": "foureyez",
  "4 Your Eyez Only": "foureyez",
  
  // Born Sinner
  "Villuminati": "bornsinner",
  "Kerney Sermon (Skit)": "bornsinner",
  "LAnd of the Snakes": "bornsinner",
  "Power Trip (feat. Miguel)": "bornsinner",
  "Mo Money (Interlude)": "bornsinner",
  "Trouble": "bornsinner",
  "Runaway": "bornsinner",
  "She Knows (feat. Amber Coffman & Cults)": "bornsinner",
  "Rich Niggaz": "bornsinner",
  "Where's Jermaine (Skit)": "bornsinner",
  "Forbidden Fruit (feat. Kendrick Lamar)": "bornsinner",
  "Chaining Day": "bornsinner",
  "Ain't That Some Shit (Interlude)": "bornsinner",
  "Crooked Smile (feat. TLC)": "bornsinner",
  "Let Nas Down": "bornsinner",
  "Born Sinner (feat. @Fauntleroy)": "bornsinner",
  "Miss America": "bornsinner",
  "New York Times (feat. 50 Cent & Bas)": "bornsinner",
  "Is She Gon Pop": "bornsinner",
  "Niggaz Know": "bornsinner",
  "Sparks Will Fly (feat. Jhene Aiko)": "bornsinner",
  
  // Cole World: The Sideline Story
  "Dollar and a Dream III": "sideline",
  "Can't Get Enough (feat. Trey Songz)": "sideline",
  "Lights Please": "sideline",
  "Interlude": "sideline",
  "Sideline Story": "sideline",
  "Mr. Nice Watch (feat. Jay-Z)": "sideline",
  "Cole World": "sideline",
  "In the Morning (feat. Drake)": "sideline",
  "Lost Ones": "sideline",
  "Nobody's Perfect (feat. Missy Elliott)": "sideline",
  "Never Told": "sideline",
  "Rise & Shine": "sideline",
  "God's Gift": "sideline",
  "Breakdown": "sideline",
  "Work Out": "sideline",
  "Who Dat": "sideline",
  "Daddy's Little Girl": "sideline",
  
  // Friday Night Lights
  "Friday Night Lights (Intro)": "fnl",
  "Too Deep for the Intro": "fnl",
  "Before I'm Gone": "fnl",
  "Back to the Topic (Freestyle)": "fnl",
  "You Got It (feat. Wale)": "fnl",
  "Villematic": "fnl",
  "Enchanted (feat. Wale)": "fnl",
  "Blow Up": "fnl",
  "Higher": "fnl",
  "2Face": "fnl",
  "The Autograph": "fnl",
  "Best Friend": "fnl",
  "Cost Me a Lot": "fnl",
  "Premeditated Murder": "fnl",
  "Home for the Holidays": "fnl",
  "Love Me Not": "fnl",
  "See World": "fnl",
  "Farewell": "fnl",
  "Looking for Trouble (feat. Kanye West, Big Sean, Pusha T & Cyhi Da Prince)": "fnl",
  
  // KOD
  "KOD": "kod",
  "Photograph": "kod",
  "The Cut Off (feat. kiLL edward)": "kod",
  "ATM": "kod",
  "Motiv8": "kod",
  "Kevins Heart": "kod",
  "BRACKETS": "kod",
  "Once an Addict (Interlude)": "kod",
  "FRIENDS (feat. kiLL edward)": "kod",
  "Window Pain (Outro)": "kod",
  "1985 (Intro to The Fall Off)": "kod",
  
  // The Come Up
  "Simba": "warmup",
  "I'm the Man": "warmup",
  "School Daze": "warmup",
  "Dollar and a Dream": "warmup",
  "Throw It Up": "warmup",
  "Quote Me": "warmup",
  "College Boy": "warmup",
  "Split You Up": "warmup",
  "Plain": "warmup",
  "The Come Up": "warmup",
  "Mighty Crazy": "warmup",
  "Dead Presidents": "warmup",
  "Lil' Ghetto Nigga": "warmup",
  "Homecoming": "warmup",
  "Carolina On My Mind": "warmup",
  "Can't Cry": "warmup",
  "Goin' Off": "warmup",
  "Rags to Riches (At the Beep)": "warmup",
  "Get It": "warmup",
  "I Do My Thing": "warmup",
  
  // The Warm Up
  "The Warm Up (Intro)": "warmup",
  "Welcome": "warmup",
  "Can I Live": "warmup",
  "Grown Simba": "warmup",
  "Just to Get By": "warmup",
  "Dead Presidents 2": "warmup",
  "I Get Up": "warmup",
  "World Is Empty": "warmup",
  "Dreams (feat. Brandon Hines)": "warmup",
  "Royal Flush": "warmup",
  "Dollar and a Dream II": "warmup",
  "Water Break (Interlude)": "warmup",
  "Heartache": "warmup",
  "Get Away": "warmup",
  "Knock Knock": "warmup",
  "Ladies (feat. Lee Fields & The Expressionists)": "warmup",
  "Til Infinity": "warmup",
  "The Badness (feat. Omen)": "warmup",
  "Hold It Down": "warmup",
  "Last Call": "warmup",
  "Losing My Balance": "warmup",
  
  // Truly Yours Vol. 1
  "Can I Holla At Ya": "trulyyours",
  "Crunch Time": "trulyyours",
  "Rise Above": "trulyyours",
  "Tears for ODB": "trulyyours",
  "Stay (2009)": "trulyyours",
  
  // Truly Yours, Vol. 2
  "Cole Summer": "trulyyours2",
  "Kenny Lofton (feat. Young Jeezy)": "trulyyours2",
  "Chris Tucker (feat. 2 Chainz)": "trulyyours2",
  "Head Bussa": "trulyyours2",
  "Cousins (feat. Bas)": "trulyyours2",
  "3 Wishes": "trulyyours2"
};

// Drake songs list
const DRAKE_SONGS = [
  // Care Package
  "4PM In Calabasas",
  "5 Am in Toronto",
  "Can I",
  "Club Paradise",
  "Days in The East",
  "Draft Day",
  "Dreams Money Can Buy",
  "Free Spirit",
  "Girls Love Beyonce",
  "Heat Of The Moment",
  "How Bout Now",
  "I Get Lonely",
  "Jodeci Freestyle",
  "My Side",
  "Paris Morton Music",
  "The Motion",
  "The Motion (feat. Sampha)",
  "Trust Issues",
  "Trust Issues (Remix)",
  
  // Certified Lover Boy
  "7am On Bridle Path",
  "Champagne Poetry",
  "Fair Trade ft. Travis Scott",
  "Fountains ft. Tems",
  "Fcking Fans",
  "Get Along Better ft. Ty Dolla $ign",
  "Girls Want Girls ft. Lil Baby",
  "IMY2 ft. Kid Cudi",
  "In The Bible ft. Lil Durk & Giveon",
  "Knife Talk ft. 21 Savage & Project Pat",
  "Love All ft. Jay-Z",
  "N 2 Deep ft. Future",
  "No Friends In The Industry",
  "Papi's Home",
  "Pipe Down",
  "Race My Mind",
  "TSU",
  "The Remorse",
  "Way 2 Sexy ft. Future & Young Thug",
  "Yebbas Heartbreak ft. Yebba",
  "You Only Live Twice ft. Lil Wayne & Rick Ross",
  
  // Dark Lane Demo Tapes
  "Chicago Freestyle ft. Giveon",
  "Deep Pockets",
  "Demons ft. Fivio Foreign, Sosa Geek",
  "Desires ft. Future",
  "From Florida With Love",
  "Landed",
  "Losses",
  "Not You Too ft. Chris Brown",
  "Pain 1993 ft. Playboi Carti",
  "Time Flies",
  "Toosie Slide",
  "War",
  "When To Say When",
  "D4L",
  
  // For All The Dogs
  "7969 Santa",
  "8am in Charlotte",
  "All The Parties",
  "Amen",
  "Another Late Night",
  "Away From Home",
  "BBL Love (Interlude)",
  "Bahamas Promises",
  "Calling For You",
  "Daylight",
  "Drew A Picasso",
  "Fear Of Heights",
  "First Person Shooter",
  "Gently",
  "IDGAF",
  "Members Only",
  "Polar Opposites",
  "Rich Baby Daddy",
  "Screw The World (Interlude)",
  "Slime You Out",
  "Tried Our Best",
  "Virginia Beach",
  "What Would Pluto Do",
  
  // Honestly Nevermind
  "A Keeper",
  "Calling My Name",
  "Currents",
  "Down Hill",
  "Falling Back",
  "Flight's Booked",
  "Jimmy Cooks",
  "Liability",
  "Massive",
  "Overdrive",
  "Sticky",
  "Texts Go Green",
  "Tie That Binds",
  
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
  "Madonna",
  "No Tellin'",
  "Now & Forever",
  "Preach",
  "Star67",
  "Used To",
  "Wednesday Night Interlude",
  "You & The 6",
  
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
  "305 To My City",
  "All Me",
  "Come Thru",
  "Connect",
  "From Time",
  "Furthest Thing",
  "Hold On, We're Going Home (Album Version)",
  "Own It",
  "Pound Cake Paris Morton Music 2",
  "Started From the Bottom (Explicit Version)",
  "The Language",
  "The Motion",
  "Too Much",
  "Tuscan Leather",
  "Worst Behavior",
  "Wu-Tang Forever",
  
  // Other
  "Diplomatic Immunity",
  "Evil Ways",
  "Lemon Pepper Freestyle",
  "Money In The Grave",
  "Omerta",
  "Red Button",
  "Stories About My Brother",
  "The Shoe Fits",
  "Wants and Needs",
  "What's Next",
  "Wick Man",
  "You Broke My Heart",
  
  // Scorpion
  "8 Out Of 10",
  "After Dark",
  "Blue Tint",
  "Cant Take A Joke",
  "Dont Matter To Me",
  "Elevate",
  "Emotionless",
  "Final Fantasy",
  "Finesse",
  "God's Plan",
  "I'm Upset",
  "In My Feelings",
  "Is There More",
  "Jaded",
  "March 14",
  "Mob Ties",
  "Nice For What",
  "Nonstop",
  "Peak",
  "Ratchet Happy Birthday",
  "Sandras Rose",
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
  "Cameras Good Ones Go Interlude (Medley)",
  "Crew Love",
  "Doing It Wrong",
  "HYFR (Hell Ya Fucking Right)",
  "Headlines (Explicit)",
  "Look What You've Done",
  "Lord Knows",
  "Make Me Proud",
  "Marvins Room",
  "Over My Dead Body",
  "Practice",
  "Shot For Me",
  "Take Care",
  "The Real Her",
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
  "Faithful ft. Pimp C & dvsn",
  "Feel No Ways",
  "Fire & Desire",
  "Grammys ft. Future",
  "Hotline Bling",
  "Hype",
  "Keep the Family Close",
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
  "Can I": "carepackage",
  "Club Paradise": "carepackage",
  "Days in The East": "carepackage",
  "Draft Day": "carepackage",
  "Dreams Money Can Buy": "carepackage",
  "Free Spirit": "carepackage",
  "Girls Love Beyonce": "carepackage",
  "Heat Of The Moment": "carepackage",
  "How Bout Now": "carepackage",
  "I Get Lonely": "carepackage",
  "Jodeci Freestyle": "carepackage",
  "My Side": "carepackage",
  "Paris Morton Music": "carepackage",
  "The Motion": "carepackage",
  "The Motion (feat. Sampha)": "carepackage",
  "Trust Issues": "carepackage",
  "Trust Issues (Remix)": "carepackage",
  "7am On Bridle Path": "clb",
  "Champagne Poetry": "clb",
  "Fair Trade ft. Travis Scott": "clb",
  "Fountains ft. Tems": "clb",
  "Fcking Fans": "clb",
  "Get Along Better ft. Ty Dolla $ign": "clb",
  "Girls Want Girls ft. Lil Baby": "clb",
  "IMY2 ft. Kid Cudi": "clb",
  "In The Bible ft. Lil Durk & Giveon": "clb",
  "Knife Talk ft. 21 Savage & Project Pat": "clb",
  "Love All ft. Jay-Z": "clb",
  "N 2 Deep ft. Future": "clb",
  "No Friends In The Industry": "clb",
  "Papi's Home": "clb",
  "Pipe Down": "clb",
  "Race My Mind": "clb",
  "TSU": "clb",
  "The Remorse": "clb",
  "Way 2 Sexy ft. Future & Young Thug": "clb",
  "Yebbas Heartbreak ft. Yebba": "clb",
  "You Only Live Twice ft. Lil Wayne & Rick Ross": "clb",
  "Chicago Freestyle ft. Giveon": "darklane",
  "Deep Pockets": "darklane",
  "Demons ft. Fivio Foreign, Sosa Geek": "darklane",
  "Desires ft. Future": "darklane",
  "From Florida With Love": "darklane",
  "Landed": "darklane",
  "Losses": "darklane",
  "Not You Too ft. Chris Brown": "darklane",
  "Pain 1993 ft. Playboi Carti": "darklane",
  "Time Flies": "darklane",
  "Toosie Slide": "darklane",
  "War": "darklane",
  "When To Say When": "darklane",
  "D4L": "darklane",
  "7969 Santa": "fad",
  "8am in Charlotte": "fad",
  "All The Parties": "fad",
  "Amen": "fad",
  "Another Late Night": "fad",
  "Away From Home": "fad",
  "BBL Love (Interlude)": "fad",
  "Bahamas Promises": "fad",
  "Calling For You": "fad",
  "Daylight": "fad",
  "Drew A Picasso": "fad",
  "Fear Of Heights": "fad",
  "First Person Shooter": "fad",
  "Gently": "fad",
  "IDGAF": "fad",
  "Members Only": "fad",
  "Polar Opposites": "fad",
  "Rich Baby Daddy": "fad",
  "Screw The World (Interlude)": "fad",
  "Slime You Out": "fad",
  "Tried Our Best": "fad",
  "Virginia Beach": "fad",
  "What Would Pluto Do": "fad",
  "A Keeper": "hnm",
  "Calling My Name": "hnm",
  "Currents": "hnm",
  "Down Hill": "hnm",
  "Falling Back": "hnm",
  "Flight's Booked": "hnm",
  "Jimmy Cooks": "hnm",
  "Liability": "hnm",
  "Massive": "hnm",
  "Overdrive": "hnm",
  "Sticky": "hnm",
  "Texts Go Green": "hnm",
  "Tie That Binds": "hnm",
  "10 Bands": "iyrtitl",
  "6 God": "iyrtitl",
  "6 Man": "iyrtitl",
  "6PM In New York": "iyrtitl",
  "Company": "iyrtitl",
  "Energy": "iyrtitl",
  "Jungle": "iyrtitl",
  "Know Yourself": "iyrtitl",
  "Legend": "iyrtitl",
  "Madonna": "iyrtitl",
  "No Tellin'": "iyrtitl",
  "Now & Forever": "iyrtitl",
  "Preach": "iyrtitl",
  "Star67": "iyrtitl",
  "Used To": "iyrtitl",
  "Wednesday Night Interlude": "iyrtitl",
  "You & The 6": "iyrtitl",
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
  "305 To My City": "nwts",
  "All Me": "nwts",
  "Come Thru": "nwts",
  "Connect": "nwts",
  "From Time": "nwts",
  "Furthest Thing": "nwts",
  "Hold On, We're Going Home (Album Version)": "nwts",
  "Own It": "nwts",
  "Pound Cake Paris Morton Music 2": "nwts",
  "Started From the Bottom (Explicit Version)": "nwts",
  "The Language": "nwts",
  "The Motion": "nwts",
  "Too Much": "nwts",
  "Tuscan Leather": "nwts",
  "Worst Behavior": "nwts",
  "Wu-Tang Forever": "nwts",
  "Diplomatic Immunity": "drake",
  "Evil Ways": "drake",
  "Lemon Pepper Freestyle": "drake",
  "Money In The Grave": "drake",
  "Omerta": "drake",
  "Red Button": "drake",
  "Stories About My Brother": "drake",
  "The Shoe Fits": "drake",
  "Wants and Needs": "drake",
  "What's Next": "drake",
  "Wick Man": "drake",
  "You Broke My Heart": "drake",
  "8 Out Of 10": "scorpion",
  "After Dark": "scorpion",
  "Blue Tint": "scorpion",
  "Cant Take A Joke": "scorpion",
  "Dont Matter To Me": "scorpion",
  "Elevate": "scorpion",
  "Emotionless": "scorpion",
  "Final Fantasy": "scorpion",
  "Finesse": "scorpion",
  "God's Plan": "scorpion",
  "I'm Upset": "scorpion",
  "In My Feelings": "scorpion",
  "Is There More": "scorpion",
  "Jaded": "scorpion",
  "March 14": "scorpion",
  "Mob Ties": "scorpion",
  "Nice For What": "scorpion",
  "Nonstop": "scorpion",
  "Peak": "scorpion",
  "Ratchet Happy Birthday": "scorpion",
  "Sandras Rose": "scorpion",
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
  "Cameras Good Ones Go Interlude (Medley)": "takecare",
  "Crew Love": "takecare",
  "Doing It Wrong": "takecare",
  "HYFR (Hell Ya Fucking Right)": "takecare",
  "Headlines (Explicit)": "takecare",
  "Look What You've Done": "takecare",
  "Lord Knows": "takecare",
  "Make Me Proud": "takecare",
  "Marvins Room": "takecare",
  "Over My Dead Body": "takecare",
  "Practice": "takecare",
  "Shot For Me": "takecare",
  "Take Care": "takecare",
  "The Real Her": "takecare",
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
  "Faithful ft. Pimp C & dvsn": "views",
  "Feel No Ways": "views",
  "Fire & Desire": "views",
  "Grammys ft. Future": "views",
  "Hotline Bling": "views",
  "Hype": "views",
  "Keep the Family Close": "views",
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
  
  // Virgo World
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
  
  // We Love You Tecca 2 (WLYT2)
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
  
  // Other/Singles
  "Faster",
  "Show Me Up",
  "All Star",
  "Out of Love",
  "Ransom (Remix)",
  "TEC",
  "A Million",
  "Bank Account"
];

// Lil Tecca album mapping
// Image files in Supabase: wlyt.jpg, virgo.jpg, wlyt2.jpg, tecca.jpg
const LILTECCA_ALBUM_COVERS = {
  // We Love You Tecca (WLYT) - wlyt.jpg
  "Ransom": "wlyt",
  "Out Of Love": "wlyt",
  "Love Me": "wlyt",
  "Shots": "wlyt",
  "Count Me Out": "wlyt",
  "Did It Again": "wlyt",
  "Royal Rage": "wlyt",
  "Left Right": "wlyt",
  "Sidenote": "wlyt",
  "Amigo": "wlyt",
  "Glocca Morra": "wlyt",
  "200 My Baby": "wlyt",
  "IDK": "wlyt",
  "Bosses & Workers": "wlyt",
  "Came In": "wlyt",
  "Our Time": "wlyt",
  
  // Virgo World - virgo.jpg
  "Virgo World": "virgo",
  "Never Left": "virgo",
  "When You Down": "virgo",
  "Moshpit": "virgo",
  "Take 10": "virgo",
  "Fallin": "virgo",
  "Dolly": "virgo",
  "Pressure": "virgo",
  "No Answer": "virgo",
  "Repeat It": "virgo",
  "Tattoo": "virgo",
  
  // We Love You Tecca 2 (WLYT2) - wlyt2.jpg
  "Sunny Days": "wlyt2",
  "Money On Me": "wlyt2",
  "Not A Game": "wlyt2",
  "Millionaire": "wlyt2",
  "Lot Of Me": "wlyt2",
  "500lbs": "wlyt2",
  "Heartbreaker": "wlyt2",
  "Chemistry": "wlyt2",
  "How I Want Ya": "wlyt2",
  "Both Of Em": "wlyt2",
  "Understand": "wlyt2",
  "Foreign": "wlyt2",
  
  // Other/Singles - tecca.jpg
  "Faster": "tecca",
  "Show Me Up": "tecca",
  "All Star": "tecca",
  "Out of Love": "tecca",
  "Ransom (Remix)": "tecca",
  "TEC": "tecca",
  "A Million": "tecca",
  "Bank Account": "tecca"
};

// Helper functions to get artist-specific data
function getSongsForArtist(artist) {
    if (artist === 'jcole') {
        return JCOLE_SONGS;
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
    if (artist === 'jcole') {
        return JCOLE_ALBUM_COVERS;
    } else if (artist === 'drake') {
        return DRAKE_ALBUM_COVERS;
    } else if (artist === 'bbbm') {
        return BBBM_ALBUM_COVERS;
    } else if (artist === 'liltecca') {
        return LILTECCA_ALBUM_COVERS;
    }
    return ALBUM_COVERS;
}

// Helper function to construct audio file URL for a song
// For Lil Tecca, songs are in album folders, so we need to include the folder path
function getAudioUrl(songName) {
    if (selectedArtist === 'liltecca') {
        const albumMap = getAlbumMapForArtist('liltecca');
        const albumCode = albumMap[songName] || 'tecca'; // Default to 'tecca' for other songs
        
        // Map album codes to folder names in Supabase
        const folderMap = {
            'wlyt': 'WLYT',
            'virgo': 'Virgo World',
            'wlyt2': 'WLYT2',
            'tecca': 'Other' // Or root if singles are in root
        };
        
        const folder = folderMap[albumCode] || 'Other';
        // Construct URL with folder path: Lil Tecca/{folder}/{songName}.mp3
        return `${SUPABASE_BASE}/${encodeURIComponent(folder)}/${encodeURIComponent(songName)}.mp3`;
    }
    // For other artists, use standard path
    return `${SUPABASE_BASE}/${encodeURIComponent(songName)}.mp3`;
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
    let startTime = 0;
    
    if (gameMode === 'random') {
        // Get song duration and calculate random start (0 to duration-40)
        const duration = await getSongDuration(songName);
        const maxStart = Math.max(0, duration - 40);
        startTime = parseFloat((Math.random() * maxStart).toFixed(2));
    }
    
    soloState = {
        currentSong: songName,
        skips: 0,
        startTime: startTime,
        audio: null,
        guessed: false,
        strikes: 0,
        progressBars: [],
        songDuration: await getSongDuration(songName),
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
async function getSongDuration(songName) {
    const url = getAudioUrl(songName);
    return new Promise((resolve) => {
        const audio = new Audio(url);
        audio.addEventListener('loadedmetadata', () => {
            resolve(audio.duration);
        });
        audio.addEventListener('error', () => {
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
        
        const url = getAudioUrl(soloState.currentSong);
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
    const url = `${SUPABASE_BASE}/${encodeURIComponent(soloState.currentSong)}.mp3`;
    
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
    
    speedState.currentSong = songName;
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
    
    speedState.songDuration = await getSongDuration(songName);
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
    const url = getAudioUrl(speedState.currentSong);
    
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
    getSongDuration(data.song).then(duration => {
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
        
        const url = getAudioUrl(h2hState.currentSong);
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
    const url = `${SUPABASE_BASE}/${encodeURIComponent(h2hState.currentSong)}.mp3`;
    
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
    const defaultCover = (selectedArtist === 'jcole') ? 'foresthills' : 'travis';
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
