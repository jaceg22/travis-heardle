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
let soloState = {
    currentSong: null,
    skips: 0,
    startTime: 0,
    audio: null,
    guessed: false,
    strikes: 0
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
    finished: false
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
document.getElementById("soloBtn").onclick = () => {
    currentMode = 'solo';
    home.style.display = "none";
    soloGame.style.display = "block";
    startSoloGame();
};

document.getElementById("h2hBtn").onclick = () => {
    currentMode = 'h2h';
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
function startSoloGame() {
    soloState = {
        currentSong: SONGS[Math.floor(Math.random() * SONGS.length)],
        skips: 0,
        startTime: parseFloat((Math.random() * 20).toFixed(2)),
        audio: null,
        guessed: false,
        strikes: 0
    };
    
    document.getElementById("soloDuration").textContent = "Current: 1.0s";
    document.getElementById("soloStrikes").textContent = "0/6 strikes";
    document.getElementById("soloStatus").textContent = "";
    document.getElementById("soloFeedback").textContent = "";
    document.getElementById("soloFeedback").className = "feedback";
    document.getElementById("soloGuess").value = "";
    document.getElementById("soloSkip").disabled = false;
    document.getElementById("soloSendGuess").disabled = false;
    
    // Stop any playing audio
    if (soloState.audio) {
        soloState.audio.pause();
        soloState.audio = null;
    }
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
    
    soloState.audio.play().catch(err => {
        console.error("Error playing audio:", err);
        document.getElementById("soloStatus").textContent = "Error loading audio. Try again.";
    });
    
    setTimeout(() => {
        if (soloState.audio) {
            soloState.audio.pause();
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
    const duration = DURATIONS[Math.min(soloState.skips, 5)];
    document.getElementById("soloDuration").textContent = `Current: ${duration}s`;
    document.getElementById("soloStrikes").textContent = `${soloState.strikes}/6 strikes`;
    
    if (soloState.strikes >= 6) {
        document.getElementById("soloSkip").disabled = true;
        document.getElementById("soloSendGuess").disabled = true;
        document.getElementById("soloFeedback").textContent = `Out of strikes! The correct song was: ${soloState.currentSong}`;
        document.getElementById("soloFeedback").className = "feedback incorrect";
        if (soloState.audio) {
            soloState.audio.pause();
        }
        return;
    }
    
    if (soloState.audio) {
        soloState.audio.pause();
        soloState.audio = null;
    }
};

document.getElementById("soloSendGuess").onclick = () => {
    if (soloState.guessed || soloState.strikes >= 6) return;
    
    const guess = document.getElementById("soloGuess").value.trim();
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
        document.getElementById("soloFeedback").textContent = `"${guess}": Song not found. Try Again.`;
        document.getElementById("soloFeedback").className = "feedback not-found";
        document.getElementById("soloGuess").value = "";
        
        if (soloState.strikes >= 6) {
            document.getElementById("soloSkip").disabled = true;
            document.getElementById("soloSendGuess").disabled = true;
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
        soloState.guessed = true;
        soloState.strikes++; // Count the correct guess as a try
        document.getElementById("soloStrikes").textContent = `${soloState.strikes}/6 strikes`;
        document.getElementById("soloFeedback").textContent = `You guessed "${soloState.currentSong}" in ${soloState.strikes} tries!`;
        document.getElementById("soloFeedback").className = "feedback correct";
        if (soloState.audio) {
            soloState.audio.pause();
        }
    } else {
        soloState.strikes++;
        document.getElementById("soloStrikes").textContent = `${soloState.strikes}/6 strikes`;
        document.getElementById("soloFeedback").textContent = `"${matchedSong}": Incorrect. Try Again.`;
        document.getElementById("soloFeedback").className = "feedback incorrect";
        document.getElementById("soloGuess").value = "";
        
        if (soloState.strikes >= 6) {
            document.getElementById("soloSkip").disabled = true;
            document.getElementById("soloSendGuess").disabled = true;
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
setupAutocomplete("soloGuess", "soloAutocomplete");

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
    socket.emit("createLobby", { username });
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
    document.getElementById("h2hDuration").textContent = "Current: 1.0s";
    document.getElementById("h2hStrikes").textContent = "0/6 strikes";
    document.getElementById("h2hStatus").textContent = "Waiting for opponent...";
    document.getElementById("h2hFeedback").textContent = "";
    document.getElementById("h2hFeedback").className = "feedback";
    document.getElementById("h2hGuess").value = "";
    updateScoreDisplay();
    disableGameControls();
    document.getElementById("h2hNewGame").disabled = true;
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
    h2hState.playerCount = data.playerCount;
    h2hState.scores = data.scores || {};
    updateScoreDisplay();
    
    if (data.playerCount < 2) {
        document.getElementById("h2hStatus").textContent = "Waiting for opponent...";
        disableGameControls();
    }
});

socket.on("gameStart", data => {
    h2hState.currentSong = data.song;
    h2hState.startTime = data.startTime;
    h2hState.skips = 0;
    h2hState.guessed = false;
    h2hState.strikes = 0;
    h2hState.gameStarted = true;
    h2hState.roundFinished = false;
    h2hState.finished = false;
    h2hState.scores = data.scores || {};

    h2hMenu.style.display = "none";
    h2hGame.style.display = "block";

    document.getElementById("lobbyText").innerText = "Lobby: " + h2hState.lobbyId;
    document.getElementById("h2hDuration").textContent = "Current: 1.0s";
    document.getElementById("h2hStrikes").textContent = "0/6 strikes";
    document.getElementById("h2hStatus").textContent = "Game started!";
    document.getElementById("h2hFeedback").textContent = "";
    document.getElementById("h2hFeedback").className = "feedback";
    document.getElementById("h2hGuess").value = "";
    updateScoreDisplay();
    enableGameControls();
    document.getElementById("h2hNewGame").disabled = true;
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
    document.getElementById("h2hSendGuess").disabled = false;
}

function disableGameControls() {
    document.getElementById("h2hPlay").disabled = true;
    document.getElementById("h2hSkip").disabled = true;
    document.getElementById("h2hSendGuess").disabled = true;
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
    const duration = DURATIONS[Math.min(h2hState.skips, 5)];
    document.getElementById("h2hDuration").textContent = `Current: ${duration}s`;
    document.getElementById("h2hStrikes").textContent = `${h2hState.strikes}/6 strikes`;
    
        if (h2hState.strikes >= 6) {
            h2hState.finished = true;
            document.getElementById("h2hSkip").disabled = true;
            document.getElementById("h2hSendGuess").disabled = true;
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

document.getElementById("h2hSendGuess").onclick = () => {
    if (h2hState.guessed || !h2hState.currentSong || !h2hState.username || h2hState.strikes >= 6 || !h2hState.gameStarted || h2hState.roundFinished) return;
    
    const guess = document.getElementById("h2hGuess").value.trim();
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
        document.getElementById("h2hStrikes").textContent = `${h2hState.strikes}/6 strikes`;
        document.getElementById("h2hFeedback").textContent = `"${guess}": Song not found. Try Again.`;
        document.getElementById("h2hFeedback").className = "feedback not-found";
        document.getElementById("h2hGuess").value = "";
        
        if (h2hState.strikes >= 6) {
            h2hState.finished = true;
            document.getElementById("h2hSkip").disabled = true;
            document.getElementById("h2hSendGuess").disabled = true;
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
    
    if (matchedSong.toLowerCase() === h2hState.currentSong.toLowerCase()) {
        h2hState.guessed = true;
        h2hState.finished = true;
        document.getElementById("h2hFeedback").textContent = `Correct! Waiting for opponent...`;
        document.getElementById("h2hFeedback").className = "feedback correct";
        if (h2hState.audio) {
            h2hState.audio.pause();
        }
    } else {
        h2hState.strikes++;
        document.getElementById("h2hStrikes").textContent = `${h2hState.strikes}/6 strikes`;
        document.getElementById("h2hFeedback").textContent = `"${matchedSong}": Incorrect. Try Again.`;
        document.getElementById("h2hFeedback").className = "feedback incorrect";
        document.getElementById("h2hGuess").value = "";
        
        if (h2hState.strikes >= 6) {
            h2hState.finished = true;
            document.getElementById("h2hSkip").disabled = true;
            document.getElementById("h2hSendGuess").disabled = true;
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
setupAutocomplete("h2hGuess", "h2hAutocomplete");
