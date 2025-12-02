// ---------------------------
// CONFIG
// ---------------------------
const SUPABASE_BASE = "https://ggkanqgcvvxtpdhzmoon.supabase.co/storage/v1/object/public/songs";
const SUPABASE_COVERS_BASE = "https://ggkanqgcvvxtpdhzmoon.supabase.co/storage/v1/object/public/album";
const BACKEND_URL = "https://travis-heardle.onrender.com";

// ---------------------------
// USER AUTHENTICATION STATE
// ---------------------------
let currentUser = null;

// Check if user is logged in from localStorage
function initAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showHomePage();
    } else {
        showLoginPage();
    }
}

function showLoginPage() {
    document.getElementById("loginPage").style.display = "block";
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
    document.getElementById("home").style.display = "block";
    document.getElementById("soloGame").style.display = "none";
    document.getElementById("h2hMenu").style.display = "none";
    document.getElementById("h2hGame").style.display = "none";
    document.getElementById("speedGame").style.display = "none";
    document.getElementById("speedGameOver").style.display = "none";
    document.getElementById("speedLeaderboard").style.display = "none";
    if (currentUser) {
        document.getElementById("loggedInUser").textContent = `Logged in as: ${currentUser.username}`;
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
        showHomePage();
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
        showHomePage();
    } catch (error) {
        errorDiv.textContent = "Login failed. Please try again.";
        console.error("Login error:", error);
    }
};

document.getElementById("logoutBtn").onclick = () => {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoginPage();
};

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
    "BUTTERFLY EFFECT": "astroworld",
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
    "Mo City Flexologist": "dbr",
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
    "BUTTERFLY EFFECT",
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
    "Mo City Flexologist",
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
    if (!currentUser) {
        alert("Please log in to play");
        return;
    }
    currentMode = 'solo';
    gameMode = 'regular';
    home.style.display = "none";
    soloGame.style.display = "block";
    startSoloGame();
};

document.getElementById("soloRandomBtn").onclick = () => {
    if (!currentUser) {
        alert("Please log in to play");
        return;
    }
    currentMode = 'solo';
    gameMode = 'random';
    home.style.display = "none";
    soloGame.style.display = "block";
    startSoloGame();
};

document.getElementById("h2hRegularBtn").onclick = () => {
    if (!currentUser) {
        alert("Please log in to play");
        return;
    }
    currentMode = 'h2h';
    gameMode = 'regular';
    home.style.display = "none";
    h2hMenu.style.display = "block";
};

document.getElementById("h2hRandomBtn").onclick = () => {
    if (!currentUser) {
        alert("Please log in to play");
        return;
    }
    currentMode = 'h2h';
    gameMode = 'random';
    home.style.display = "none";
    h2hMenu.style.display = "block";
};

document.getElementById("speedBtn").onclick = () => {
    if (!currentUser) {
        alert("Please log in to play");
        return;
    }
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
    const songName = SONGS[Math.floor(Math.random() * SONGS.length)];
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
    const url = `${SUPABASE_BASE}/${encodeURIComponent(songName)}.mp3`;
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
        
        const url = `${SUPABASE_BASE}/${encodeURIComponent(soloState.currentSong)}.mp3`;
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
    if (soloState.guessed || soloState.strikes >= 6) return;
    if (soloState.skips >= 5) {
        document.getElementById("soloSkip").disabled = true;
        return;
    }
    
    soloState.skips++;
    soloState.strikes++;
    const strikeIndex = soloState.strikes - 1;
    updateProgressBar('solo', strikeIndex, 'skip', 'Skipped');
    document.getElementById("soloStrikes").textContent = `${soloState.strikes}/6 strikes`;
    
    if (soloState.strikes >= 6) {
        document.getElementById("soloSkip").disabled = true;
        document.getElementById("soloGuess").disabled = true;
        document.getElementById("soloFeedback").textContent = `Out of strikes! The correct song was: ${soloState.currentSong}`;
        document.getElementById("soloFeedback").className = "feedback incorrect";
        if (soloState.audio) {
            soloState.audio.pause();
        }
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
    let matchedSong = null;
    for (const song of SONGS) {
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
        document.getElementById("soloFeedback").textContent = `You guessed "${soloState.currentSong}" in ${soloState.strikes} tries!`;
        document.getElementById("soloFeedback").className = "feedback correct";
        if (soloState.audio) {
            soloState.audio.pause();
        }
        // Show result modal
        showSongResultModal(soloState.currentSong, `You guessed "${soloState.currentSong}" in ${soloState.strikes} tries!`, true);
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
    // Select a random song that hasn't been played yet
    let availableSongs = SONGS.filter(s => !speedState.songsPlayed.includes(s));
    if (availableSongs.length === 0) {
        // Reset if all songs used
        speedState.songsPlayed = [];
        availableSongs = SONGS;
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

function endSpeedGame(won) {
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
    
    if (won && speedState.round === speedState.totalRounds) {
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
        if (currentUser && speedState.round === speedState.totalRounds) {
            saveSpeedRun(speedState.timer, speedState.round);
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
    if (!currentUser) return;
    
    try {
        await fetch(`${BACKEND_URL}/api/speed-leaderboard`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: currentUser.id,
                username: currentUser.username,
                total_time: totalTime,
                rounds_completed: roundsCompleted
            })
        });
    } catch (error) {
        console.error("Failed to save speed run:", error);
    }
}

// Speed mode button handlers
document.getElementById("speedPlay").onclick = () => {
    if (!speedState.currentSong || speedState.gameOver) return;
    
    if (speedState.audio) {
        if (!speedState.audio.paused) {
            speedState.audio.pause();
            document.getElementById("speedPlay").textContent = "Play";
            if (speedState.progressInterval) {
                clearInterval(speedState.progressInterval);
            }
            return;
        } else {
            speedState.audio.pause();
            speedState.audio = null;
        }
    }
    
    const duration = DURATIONS[Math.min(speedState.skips, 5)];
    const url = `${SUPABASE_BASE}/${encodeURIComponent(speedState.currentSong)}.mp3`;
    
    speedState.audio = new Audio(url);
    speedState.audio.currentTime = speedState.startTime;
    
    speedState.audio.play().catch(err => {
        console.error("Error playing audio:", err);
        document.getElementById("speedFeedback").textContent = "Error loading audio. Try again.";
    });
    
    document.getElementById("speedPlay").textContent = "Pause";
    
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
    
    let matchedSong = null;
    for (const song of SONGS) {
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
            speedState.round++;
            if (speedState.round > speedState.totalRounds) {
                endSpeedGame(true);
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
    socket.emit("createLobby", { username, gameMode });
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
        
        const url = `${SUPABASE_BASE}/${encodeURIComponent(h2hState.currentSong)}.mp3`;
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
    if (h2hState.guessed || !h2hState.currentSong || h2hState.strikes >= 6 || !h2hState.gameStarted || h2hState.roundFinished) return;
    if (h2hState.skips >= 5) {
        document.getElementById("h2hSkip").disabled = true;
        return;
    }
    
    h2hState.skips++;
    h2hState.strikes++;
    const strikeIndex = h2hState.strikes - 1;
    updateProgressBar('h2h', strikeIndex, 'skip', 'Skipped');
    document.getElementById("h2hStrikes").textContent = `${h2hState.strikes}/6 strikes`;
    
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
    let matchedSong = null;
    for (const song of SONGS) {
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
                message = `${data.winner} guessed "${songName}" in ${data.winnerStrikes} guesses`;
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
    const resultMessage = isWinner 
        ? `You guessed "${songName}" in ${data.winnerStrikes || '?'} tries!`
        : guessedCorrectly && data.winnerStrikes !== undefined
            ? (data.sameStrikes 
                ? `${data.winner} guessed "${songName}" in first`
                : `${data.winner} guessed "${songName}" in ${data.winnerStrikes} guesses`)
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
        
    const filtered = SONGS.filter(song => 
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
    const listId = mode === "solo" ? "soloAutocomplete" : "h2hAutocomplete";
    document.getElementById(listId).style.display = "none";
}

// ---------------------------
// SONG RESULT MODAL
// ---------------------------
function getAlbumCoverUrl(songName) {
    // Check if we have a custom cover mapped
    if (ALBUM_COVERS[songName]) {
        const albumName = ALBUM_COVERS[songName];
        // Try common image extensions
        return `${SUPABASE_COVERS_BASE}/${encodeURIComponent(albumName)}.jpg`;
    }
    // Default to "travis" album cover if song not found
    return `${SUPABASE_COVERS_BASE}/travis.jpg`;
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
