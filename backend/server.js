import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

// ---------------------------
// SONG LIST (same as your python)
// ---------------------------
const songs = [
  "16 Chapels", "Hell of a Night", "SIRENS", "3500",
  "SKELETONS", "SKITZO", "90210", "Highest in the Room",
  "STARGAZING", "A-Team", "I Can Tell", "STOP TRYING TO BE GOD",
  "ASTROTHUNDER", "I KNOW ?", "Skyfall", "Antidote", "Sloppy Toppy",
  "Apple Pie", "Impossible", "TELEKINESIS", "BUTTERFLY EFFECT", "K-POP",
  "THANK GOD",  "KICK OUT", "THE SCOTTS", "Backyard",
  "LOOOVE", "TIL FURTHER NOTICE", "Bad Mood Shit On You", "LOST FOREVER",
  "TOPIA TWINS", "Bandz", "MAFIA", "The Prayer", "Basement Freestyle",
  "MELTDOWN",  "MIA", "Trance", "Blocka La Flame",
  "MODERN JAM", "BACC", "CAN'T SAY", "MY EYES", "CAROUSEL",
  "Mamacita", "Upper Echelon", "CHAMPAIN & VACAY", "Maria I'm Drunk",
  "Uptown", "CIRCUS MAXIMUS", "Mo City Flexologist", "WAKE UP",
  "COFFEE BEAN", "NC-17", "WHO? WHAT!", "DA WIZARD", "NO BYSTANDERS",
  "Watch", "DELRESTO (ECHOES)", "Naked", "YOSEMITE", "DUMBO",
  "Never Catch Me", "Zombies", "Dance on the Moon", "Nightcrawler",
  "biebs in the trap", "Don't Play", "Only 1", "coordinate", "Drive",
  "Overdue", "first take", "Drugs You Should Try It", "PARASAIL",
  "goosebumps", "ESCAPE PLAN", "PBT", "guidance", "FE!N", "Pornography",
  "outside", "FLORIDA FLOW", "Pray 4 Love", "sdp interlude",
  "First Class", "Quintana Pt. 2", "sweet sweet", "GOD'S COUNTRY",
  "Quintana", "the ends", "Grey", "R.I.P. SCREW", "through the late night",
  "HOUSTONFORNICATION", "Raindrops (Insane)", "way back", "HYAENA",
  "SICKO MODE", "wonderful"
];

// Duration values (lower is better)
const DURATIONS = [1, 2.5, 4.5, 8, 16, 30];

// ---------------------------
// EXPRESS + SOCKET.IO SETUP
// ---------------------------
const app = express();
app.use(cors());
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// ---------------------------
// LOBBY STORAGE
// ---------------------------
const lobbies = {};

// Pick a random song
function randomSong() {
  return songs[Math.floor(Math.random() * songs.length)];
}

// Random start time (0–20 seconds)
function randomStart() {
  return parseFloat((Math.random() * 20).toFixed(2));
}

// ---------------------------
// SOCKET.IO LOGIC
// ---------------------------
io.on("connection", (socket) => {

  socket.on("createLobby", ({ username }) => {
    if (!username) {
      socket.emit("lobbyError", "Username required");
      return;
    }
    
    const lobbyId = Math.random().toString(36).substring(2, 7).toUpperCase();

    const selectedSong = randomSong();
    const start = randomStart();

    lobbies[lobbyId] = {
      song: selectedSong,
      startTime: start,
      players: {},
      started: false,
      scores: {},
      roundFinished: false
    };

    // Add creator as first player
    lobbies[lobbyId].players[username] = {
      finished: false,
      duration: null,
      timestamp: null,
      username: username,
      strikesOut: false
    };
    
    // Initialize score for creator
    lobbies[lobbyId].scores[username] = { wins: 0, losses: 0 };

    socket.join(lobbyId);
    
    // Store the socket's username if provided (or generate one)
    socket.data = { lobbyId, username, isCreator: true };

    socket.emit("lobbyCreated", {
      lobbyId,
      song: selectedSong,
      startTime: start,
      playerCount: 1,
      scores: lobbies[lobbyId].scores
    });
  });

  socket.on("joinLobby", ({ lobbyId, username }) => {
    const game = lobbies[lobbyId];
    if (!game) {
      socket.emit("lobbyError", "Lobby not found");
      return;
    }

    if (game.started && !game.players[username]) {
      socket.emit("lobbyError", "Game already started");
      return;
    }

    if (!game.players[username]) {
    game.players[username] = {
      finished: false,
        duration: null,
        timestamp: null,
        username: username,
        strikesOut: false
    };
      
      // Initialize score for new player
      game.scores[username] = { wins: 0, losses: 0 };
    }

    socket.join(lobbyId);
    socket.data = { ...socket.data, lobbyId, username };

    // Notify all players about player count
    const playerCount = Object.keys(game.players).length;
    io.to(lobbyId).emit("playerJoined", {
      playerCount,
      scores: game.scores
    });

    // Start game when 2 players are in
    if (playerCount >= 2 && !game.started) {
      game.started = true;
      game.roundFinished = false;
      // Reset player states for new round
      Object.values(game.players).forEach(p => {
        p.finished = false;
        p.duration = null;
        p.timestamp = null;
        p.strikesOut = false;
      });
      io.to(lobbyId).emit("gameStart", {
        song: game.song,
        startTime: game.startTime,
        scores: game.scores
      });
    } else if (game.started) {
    socket.emit("gameStart", {
      song: game.song,
        startTime: game.startTime,
        scores: game.scores
    });
    }
  });

  socket.on("playerGuess", ({ lobbyId, username, guess, duration, timestamp }) => {
    const game = lobbies[lobbyId];
    if (!game || !game.started || game.roundFinished) return;

    const player = game.players[username];
    if (!player || player.finished || player.strikesOut) return;

    // Check if guess is correct (case-insensitive)
    const isCorrect = guess.toLowerCase().replace(/'/g, "") === game.song.toLowerCase().replace(/'/g, "");
    
    if (isCorrect) {
      player.finished = true;
      player.duration = duration;
      player.timestamp = timestamp || Date.now();

      // Notify other players
      socket.to(lobbyId).emit("opponentGuess", { username });
      
      // Check if all players have finished
      checkRoundEnd(game, lobbyId);
    }
  });

  socket.on("playerStrikesOut", ({ lobbyId, username }) => {
    const game = lobbies[lobbyId];
    if (!game || !game.started || game.roundFinished) return;

    const player = game.players[username];
    if (!player || player.finished || player.strikesOut) return;

    player.strikesOut = true;
    player.finished = true;
    player.duration = 999; // High value so they lose
    player.timestamp = Date.now();

    // Notify other players
    socket.to(lobbyId).emit("opponentStrikesOut", { username });
    
    // Check if all players have finished
    checkRoundEnd(game, lobbyId);
  });

  socket.on("newRound", ({ lobbyId }) => {
    const game = lobbies[lobbyId];
    if (!game || !game.roundFinished) return;

    // Generate new song
    game.song = randomSong();
    game.startTime = randomStart();
    game.roundFinished = false;
    
    // Reset player states
    Object.values(game.players).forEach(p => {
      p.finished = false;
      p.duration = null;
      p.timestamp = null;
      p.strikesOut = false;
    });

    io.to(lobbyId).emit("gameStart", {
      song: game.song,
      startTime: game.startTime,
      scores: game.scores
    });
  });

  socket.on("leaveLobby", ({ lobbyId }) => {
    socket.leave(lobbyId);
    // Optionally remove player from lobby
    if (lobbies[lobbyId] && socket.data?.username) {
      delete lobbies[lobbyId].players[socket.data.username];
      const playerCount = Object.keys(lobbies[lobbyId].players).length;
      io.to(lobbyId).emit("playerJoined", {
        playerCount,
        scores: lobbies[lobbyId].scores
      });
    }
  });

  socket.on("disconnect", () => {
    // Clean up if player leaves
    for (const [lobbyId, game] of Object.entries(lobbies)) {
      // Could add logic to remove player from game here if needed
    }
  });
});

// Helper function to check if round is over
function checkRoundEnd(game, lobbyId) {
  const allPlayers = Object.values(game.players);
  const finishedPlayers = allPlayers.filter(p => p.finished || p.strikesOut);
  
  if (finishedPlayers.length === allPlayers.length && allPlayers.length >= 2 && !game.roundFinished) {
    game.roundFinished = true;
    
    // Determine winner - only consider players who didn't strike out
    const validPlayers = finishedPlayers.filter(p => !p.strikesOut);
    
    if (validPlayers.length === 0) {
      // Both players struck out - tie
      io.to(lobbyId).emit("gameOver", {
        winner: "tie",
        duration: null,
        players: allPlayers.map(p => p.username),
        scores: game.scores
      });
    } else if (validPlayers.length === 1) {
      // Only one player didn't strike out - they win
      const winner = validPlayers[0].username;
      game.scores[winner].wins++;
      const loser = allPlayers.find(p => p.username !== winner).username;
      game.scores[loser].losses++;
      
      io.to(lobbyId).emit("gameOver", {
        winner: winner,
        winnerDuration: validPlayers[0].duration,
        song: game.song,
        scores: game.scores
      });
    } else {
      // Both players finished - compare durations
      const sortedPlayers = validPlayers.sort((a, b) => {
        if (a.duration !== b.duration) {
          return a.duration - b.duration;
        }
        return a.timestamp - b.timestamp;
      });

      const winner = sortedPlayers[0].username;
      const loser = sortedPlayers[1].username;
      game.scores[winner].wins++;
      game.scores[loser].losses++;

      // Check for tie (same duration and timestamp within 100ms)
      const topDuration = sortedPlayers[0].duration;
      const topTimestamp = sortedPlayers[0].timestamp;
      const tiedPlayers = sortedPlayers.filter(p => 
        p.duration === topDuration && Math.abs(p.timestamp - topTimestamp) < 100
      );

      if (tiedPlayers.length > 1) {
        // It's a tie - no score changes
        io.to(lobbyId).emit("gameOver", {
          winner: "tie",
          duration: topDuration,
          players: tiedPlayers.map(p => p.username),
          scores: game.scores
        });
      } else {
          io.to(lobbyId).emit("gameOver", {
          winner: winner,
          winnerDuration: sortedPlayers[0].duration,
          song: game.song,
          scores: game.scores
        });
      }
    }
  }
}

// ---------------------------
// START SERVER
// ---------------------------
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
