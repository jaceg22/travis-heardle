// ---------------------------
// CONFIG
// ---------------------------
const SUPABASE_BASE = "https://ggkanqgcvvxtpdhzmoon.supabase.co/storage/v1/object/public/songs";
const BACKEND_URL = "https://travis-heardle.onrender.com";

const DURATIONS = [1, 2.5, 4.5, 8, 16, 30];

// Song list (same as Python version)
const SONGS = [
    "16 Chapels", "Hell of a Night", "SIRENS", "3500", "High Fashion",
    "SKELETONS", "5% TINT", "SKITZO",
    "90210", "Highest in the Room", "STARGAZING", "A-Team", "I Can Tell",
    "STOP TRYING TO BE GOD", "ASTROTHUNDER", "I KNOW ?", "Skyfall",
    "Antidote", "Sloppy Toppy", "Apple Pie", "Impossible",
    "TELEKINESIS", "BUTTERFLY EFFECT", "K-POP", "THANK GOD",
    "Back On It", "KICK OUT", "THE SCOTTS", "Backyard", "LOOOVE",
    "TIL FURTHER NOTICE", "Bad Mood Shit On You", "LOST FOREVER", "TOPIA TWINS",
    "Bandz", "MAFIA", "The Prayer", "Basement Freestyle", "MELTDOWN",
    "The Curse", "Blame", "MIA", "Trance",
    "Blocka La Flame", "MODERN JAM", "BACC",
    "CAN'T SAY", "MY EYES", "Up Top", "CAROUSEL", "Mamacita", "Upper Echelon",
    "CHAMPAIN & VACAY", "Maria I'm Drunk", "Uptown", "CIRCUS MAXIMUS",
    "Mo City Flexologist", "WAKE UP", "COFFEE BEAN", "NC-17", "WHO? WHAT!",
    "DA WIZARD", "NO BYSTANDERS", "Watch", "DELRESTO (ECHOES)", "Naked",
    "YOSEMITE", "DUMBO", "Never Catch Me", "Zombies",
    "Dance on the Moon", "Nightcrawler", "biebs in the trap", "Don't Play",
    "Only 1", "coordinate", "Drive", "Overdue", "first take",
    "Drugs You Should Try It", "PARASAIL", "goosebumps", "ESCAPE PLAN",
    "PBT", "guidance", "FE!N", "Pornography", "outside",
    "FLORIDA FLOW", "Pray 4 Love", "sdp interlude", "First Class",
    "Quintana Pt. 2", "sweet sweet", "GOD'S COUNTRY", "Quintana", "the ends",
    "Grey", "R.I.P. SCREW", "through the late night", "HOUSTONFORNICATION",
    "Raindrops (Insane)", "way back", "HYAENA", "SICKO MODE", "wonderful"
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
    if (soloState.guessed) return;
    
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
    
    soloState.strikes++;
    const strikeIndex = soloState.strikes - 1;
    
    if (matchedSong.toLowerCase() === soloState.currentSong.toLowerCase()) {
        soloState.guessed = true;
        updateProgressBar('solo', strikeIndex, 'correct', 'Guessed Correct!');
        document.getElementById("soloStrikes").textContent = `${soloState.strikes}/6 strikes`;
        document.getElementById("soloFeedback").textContent = `You guessed "${soloState.currentSong}" in ${soloState.strikes} tries!`;
        document.getElementById("soloFeedback").className = "feedback correct";
        if (soloState.audio) {
            soloState.audio.pause();
        }
        if (soloState.progressInterval) {
            clearInterval(soloState.progressInterval);
        }
    } else {
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
    
    // Reset progress bars
    for (let i = 1; i <= 6; i++) {
        const bar = document.getElementById(`h2hBar${i}`);
        if (bar) {
            bar.className = 'progress-bar';
            bar.textContent = '';
        }
    }
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
    if (h2hState.guessed || !h2hState.currentSong || !h2hState.gameStarted || h2hState.roundFinished) return;
    
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
            document.getElementById("h2hFeedback").textContent = `Out of strikes! You lost this round.`;
            document.getElementById("h2hFeedback").className = "feedback incorrect";
            if (h2hState.audio) {
                h2hState.audio.pause();
            }
            // Notify server that player struck out
            socket.emit("playerStrikesOut", {
                lobbyId: h2hState.lobbyId,
                username: h2hState.username
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
            document.getElementById("h2hFeedback").textContent = `Out of strikes! You lost this round.`;
            document.getElementById("h2hFeedback").className = "feedback incorrect";
            if (h2hState.audio) {
                h2hState.audio.pause();
            }
            // Notify server that player struck out
            socket.emit("playerStrikesOut", {
                lobbyId: h2hState.lobbyId,
                username: h2hState.username
            });
        }
        hideAutocomplete("h2h");
        return;
    }
    
    const duration = DURATIONS[Math.min(h2hState.skips, 5)];
    const timestamp = Date.now();

    socket.emit("playerGuess", {
        lobbyId: h2hState.lobbyId,
        username: h2hState.username,
        guess: matchedSong,
        duration: duration,
        timestamp: timestamp
    });
    
    h2hState.strikes++;
    const strikeIndex = h2hState.strikes - 1;
    
    if (matchedSong.toLowerCase() === h2hState.currentSong.toLowerCase()) {
        h2hState.guessed = true;
        h2hState.finished = true;
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
        updateProgressBar('h2h', strikeIndex, 'incorrect', `Guessed "${matchedSong}" Incorrect`);
        document.getElementById("h2hStrikes").textContent = `${h2hState.strikes}/6 strikes`;
        document.getElementById("h2hFeedback").textContent = `"${matchedSong}": Incorrect. Try Again.`;
        document.getElementById("h2hFeedback").className = "feedback incorrect";
        document.getElementById("h2hGuessInput").value = "";
        
        if (h2hState.strikes >= 6) {
            h2hState.finished = true;
            document.getElementById("h2hSkip").disabled = true;
            document.getElementById("h2hGuess").disabled = true;
            document.getElementById("h2hFeedback").textContent = `Out of strikes! You lost this round.`;
            document.getElementById("h2hFeedback").className = "feedback incorrect";
            if (h2hState.audio) {
                h2hState.audio.pause();
            }
            // Notify server that player struck out
            socket.emit("playerStrikesOut", {
                lobbyId: h2hState.lobbyId,
                username: h2hState.username
            });
        }
    }
    
    hideAutocomplete("h2h");
};

socket.on("opponentStrikesOut", data => {
    document.getElementById("h2hStatus").textContent = `${data.username} ran out of strikes!`;
});

socket.on("gameOver", data => {
    h2hState.roundFinished = true;
    h2hState.scores = data.scores || h2hState.scores;
    updateScoreDisplay();
    
    let message = "";
    if (data.winner === h2hState.username) {
        message = `You won! You guessed in ${data.winnerDuration}s`;
        document.getElementById("h2hFeedback").className = "feedback correct";
    } else if (data.winner === "tie") {
        message = `Tie! Both players ${data.players && data.players.length > 1 ? "tied" : "finished"}`;
        document.getElementById("h2hFeedback").className = "feedback not-found";
    } else {
        message = `${data.winner} won! They guessed in ${data.winnerDuration}s`;
        document.getElementById("h2hFeedback").className = "feedback incorrect";
    }
    document.getElementById("h2hStatus").textContent = message;
    document.getElementById("h2hFeedback").textContent = `Correct song: ${data.song || h2hState.currentSong}`;
    h2hState.guessed = true;
    h2hState.finished = true;
    
    // Disable game controls
    disableGameControls();
    
    // Enable New Game button
    document.getElementById("h2hNewGame").disabled = false;
    
    if (h2hState.audio) {
        h2hState.audio.pause();
    }
});

document.getElementById("h2hNewGame").onclick = () => {
    if (!h2hState.roundFinished) return;
    socket.emit("newRound", { lobbyId: h2hState.lobbyId });
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
    messageDiv.innerHTML = `<span class="username">${data.username}:</span> ${data.message} <span style="color: #666; font-size: 11px; margin-left: 5px;">${time}</span>`;
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    requestAnimationFrame(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
});

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

// Setup autocomplete for H2H
setupAutocomplete("h2hGuessInput", "h2hAutocomplete");
