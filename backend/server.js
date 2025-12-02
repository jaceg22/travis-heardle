import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || "https://ggkanqgcvvxtpdhzmoon.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "YOUR_SUPABASE_ANON_KEY_HERE";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------------------------
// SONG LIST (same as your python)
// ---------------------------
const songs = [
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

// Duration values (lower is better)
const DURATIONS = [1, 2.5, 4.5, 8, 16, 30];

// ---------------------------
// EXPRESS + SOCKET.IO SETUP
// ---------------------------
const app = express();
app.use(cors());
app.use(express.json());
const httpServer = createServer(app);

// ---------------------------
// AUTHENTICATION ENDPOINTS
// ---------------------------
app.post("/api/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password required" });
        }
        
        if (username.length < 3 || username.length > 50) {
            return res.status(400).json({ error: "Username must be 3-50 characters" });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }
        
        // Check if username already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('username')
            .eq('username', username)
            .single();
        
        if (existingUser) {
            return res.status(400).json({ error: "Username already taken" });
        }
        
        // Hash password
        const password_hash = await bcrypt.hash(password, 10);
        
        // Create user
        const { data: user, error } = await supabase
            .from('users')
            .insert([{ username, password_hash }])
            .select('id, username')
            .single();
        
        if (error) {
            console.error("Registration error:", error);
            return res.status(500).json({ error: "Registration failed" });
        }
        
        res.json({ success: true, user: { id: user.id, username: user.username } });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Registration failed" });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password required" });
        }
        
        // Get user
        const { data: user, error } = await supabase
            .from('users')
            .select('id, username, password_hash')
            .eq('username', username)
            .single();
        
        if (error || !user) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        
        // Verify password
        const valid = await bcrypt.compare(password, user.password_hash);
        
        if (!valid) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        
        res.json({ 
            success: true, 
            user: { id: user.id, username: user.username } 
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
});

// ---------------------------
// STATS ENDPOINTS
// ---------------------------
app.post("/api/stats", async (req, res) => {
    try {
        const { user_id, mode, won } = req.body;
        
        if (!user_id || !mode || typeof won !== 'boolean') {
            return res.status(400).json({ error: "Invalid request" });
        }
        
        // Get current stats
        const { data: existing } = await supabase
            .from('stats')
            .select('*')
            .eq('user_id', user_id)
            .eq('mode', mode)
            .single();
        
        if (existing) {
            // Update existing stats
            const updates = won 
                ? { wins: existing.wins + 1, updated_at: new Date().toISOString() }
                : { losses: existing.losses + 1, updated_at: new Date().toISOString() };
            
            const { error } = await supabase
                .from('stats')
                .update(updates)
                .eq('id', existing.id);
            
            if (error) throw error;
        } else {
            // Create new stats entry
            const newStats = {
                user_id,
                mode,
                wins: won ? 1 : 0,
                losses: won ? 0 : 1
            };
            
            const { error } = await supabase
                .from('stats')
                .insert([newStats]);
            
            if (error) throw error;
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error("Stats error:", error);
        res.status(500).json({ error: "Failed to update stats" });
    }
});

app.post("/api/game-history", async (req, res) => {
    try {
        const { user_id, mode, song_name, strikes, won, duration } = req.body;
        
        if (!user_id || !mode || !song_name || typeof strikes !== 'number') {
            return res.status(400).json({ error: "Invalid request" });
        }
        
        const { error } = await supabase
            .from('game_history')
            .insert([{
                user_id,
                mode,
                song_name,
                strikes,
                won: won || false,
                duration: duration || null
            }]);
        
        if (error) throw error;
        
        res.json({ success: true });
    } catch (error) {
        console.error("Game history error:", error);
        res.status(500).json({ error: "Failed to save game history" });
    }
});

app.get("/api/stats/:user_id", async (req, res) => {
    try {
        const { user_id } = req.params;
        
        const { data, error } = await supabase
            .from('stats')
            .select('*')
            .eq('user_id', user_id);
        
        if (error) throw error;
        
        res.json({ stats: data || [] });
    } catch (error) {
        console.error("Get stats error:", error);
        res.status(500).json({ error: "Failed to get stats" });
    }
});

// ---------------------------
// SPEED LEADERBOARD ENDPOINTS
// ---------------------------
app.get("/api/speed-leaderboard", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('speed_leaderboard')
            .select('username, total_time, rounds_completed, created_at')
            .eq('rounds_completed', 15)
            .order('total_time', { ascending: true })
            .limit(10);
        
        if (error) throw error;
        
        res.json({ leaderboard: data || [] });
    } catch (error) {
        console.error("Leaderboard error:", error);
        res.status(500).json({ error: "Failed to get leaderboard" });
    }
});

app.post("/api/speed-leaderboard", async (req, res) => {
    try {
        const { user_id, username, total_time, rounds_completed } = req.body;
        
        console.log("Speed leaderboard save request:", {
            user_id,
            username,
            total_time,
            rounds_completed
        });
        
        if (!user_id || !username || !total_time || rounds_completed === undefined) {
            console.error("Invalid request - missing required fields");
            return res.status(400).json({ error: "Invalid request" });
        }
        
        // Only save if completed all 15 rounds
        if (rounds_completed === 15) {
            console.log("Saving to speed_leaderboard table...");
            const { data, error } = await supabase
                .from('speed_leaderboard')
                .insert([{
                    user_id,
                    username,
                    total_time,
                    rounds_completed
                }])
                .select();
            
            if (error) {
                console.error("Supabase insert error:", error);
                throw error;
            }
            
            console.log("Successfully saved to leaderboard:", data);
            res.json({ success: true, saved: true });
        } else {
            console.log(`Not saving - only completed ${rounds_completed} rounds (need 15)`);
            res.json({ success: true, saved: false, reason: `Only completed ${rounds_completed} rounds` });
        }
    } catch (error) {
        console.error("Leaderboard save error:", error);
        res.status(500).json({ error: "Failed to save leaderboard entry", details: error.message });
    }
});

// Get leaderboard for a specific mode (wins/losses based)
app.get("/api/leaderboard/:mode", async (req, res) => {
    try {
        const { mode } = req.params;
        
        // Get stats for this mode with user info
        const { data: stats, error: statsError } = await supabase
            .from('stats')
            .select('user_id, wins, losses')
            .eq('mode', mode)
            .order('wins', { ascending: false })
            .limit(10);
        
        if (statsError) throw statsError;
        
        if (!stats || stats.length === 0) {
            return res.json({ leaderboard: [] });
        }
        
        // Get usernames for each user_id
        const userIds = stats.map(s => s.user_id);
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, username')
            .in('id', userIds);
        
        if (usersError) throw usersError;
        
        // Create a map of user_id to username
        const userMap = {};
        (users || []).forEach(user => {
            userMap[user.id] = user.username;
        });
        
        // Format the leaderboard
        const leaderboard = stats.map(item => {
            const total = item.wins + item.losses;
            const winRate = total > 0 ? ((item.wins / total) * 100).toFixed(1) : '0.0';
            return {
                username: userMap[item.user_id] || 'Unknown',
                wins: item.wins,
                losses: item.losses,
                winRate: winRate
            };
        });
        
        res.json({ leaderboard });
    } catch (error) {
        console.error("Leaderboard error:", error);
        res.status(500).json({ error: "Failed to get leaderboard" });
    }
});

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

  socket.on("createLobby", ({ username, gameMode }) => {
    if (!username) {
      socket.emit("lobbyError", "Username required");
      return;
    }
    
    const lobbyId = Math.random().toString(36).substring(2, 7).toUpperCase();

    const selectedSong = randomSong();
    const start = gameMode === 'random' ? randomStart() : 0;

    lobbies[lobbyId] = {
      song: selectedSong,
      startTime: start,
      players: {},
      started: false,
      scores: {},
      roundFinished: false,
      gameMode: gameMode || 'regular',
      newSongRequests: {}
    };

    // Add creator as first player
    lobbies[lobbyId].players[username] = {
      finished: false,
      duration: null,
      timestamp: null,
      username: username,
      strikesOut: false,
      strikes: 0
    };
    
    // Initialize score for creator
    lobbies[lobbyId].scores[username] = { wins: 0, losses: 0 };

    socket.join(lobbyId);
    
    // Store the socket's username if provided (or generate one)
    socket.data = { lobbyId, username, isCreator: true };
    
    console.log(`Lobby ${lobbyId} created by ${username}, socket joined room`);

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
        strikesOut: false,
        strikes: 0
      };
      
      // Initialize score for new player
      game.scores[username] = { wins: 0, losses: 0 };
    }

    socket.join(lobbyId);
    socket.data = { ...socket.data, lobbyId, username };
    
    console.log(`${username} joined lobby ${lobbyId}`);

    // Notify all players about player count
    const playerCount = Object.keys(game.players).length;
    console.log(`Lobby ${lobbyId} now has ${playerCount} players`);
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
        p.strikes = 0;
      });
      // Send gameStart to ALL players in the lobby (including host)
      console.log(`Starting game for lobby ${lobbyId} with ${playerCount} players`);
      io.to(lobbyId).emit("gameStart", {
        song: game.song,
        startTime: game.startTime,
        scores: game.scores,
        gameMode: game.gameMode,
        lobbyId: lobbyId
      });
    } else if (game.started) {
      // If game already started, just send to the joining player
    socket.emit("gameStart", {
        song: game.song,
        startTime: game.startTime,
        scores: game.scores,
        gameMode: game.gameMode,
        lobbyId: lobbyId
      });
    }
  });

  socket.on("playerGuess", ({ lobbyId, username, guess, duration, timestamp, strikes }) => {
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
      player.strikes = strikes || 0;

      // Notify other players
      socket.to(lobbyId).emit("opponentGuess", { username });
      
      // Check if all players have finished
      checkRoundEnd(game, lobbyId);
    }
  });

  socket.on("playerStrikesOut", ({ lobbyId, username, strikes }) => {
    const game = lobbies[lobbyId];
    if (!game || !game.started || game.roundFinished) return;

    const player = game.players[username];
    if (!player || player.finished || player.strikesOut) return;

    player.strikesOut = true;
    player.finished = true;
    player.duration = 999; // High value so they lose
    player.timestamp = Date.now();
    player.strikes = strikes || 6;

    // Notify other players and send song name
    socket.to(lobbyId).emit("opponentStrikesOut", { username });
    socket.emit("playerStrikesOutResponse", { song: game.song });
    
    // Check if all players have finished
    checkRoundEnd(game, lobbyId);
  });

  socket.on("newRound", ({ lobbyId }) => {
    const game = lobbies[lobbyId];
    if (!game || !game.roundFinished) return;

    // Generate new song
    game.song = randomSong();
    game.startTime = game.gameMode === 'random' ? randomStart() : 0;
    game.roundFinished = false;
    
    // Reset player states
    Object.values(game.players).forEach(p => {
      p.finished = false;
      p.duration = null;
      p.timestamp = null;
      p.strikesOut = false;
      p.strikes = 0;
    });
    
    // Reset new song requests
    game.newSongRequests = {};

    io.to(lobbyId).emit("gameStart", {
      song: game.song,
      startTime: game.startTime,
      scores: game.scores,
      gameMode: game.gameMode
    });
  });

  socket.on("requestNewSong", ({ lobbyId, username }) => {
    const game = lobbies[lobbyId];
    if (!game || !game.started || game.roundFinished) return;
    
    // Mark this player as requesting new song
    if (!game.newSongRequests) {
      game.newSongRequests = {};
    }
    game.newSongRequests[username] = true;
    
    // Check if all players have requested
    const allPlayers = Object.keys(game.players);
    const allRequested = allPlayers.every(p => game.newSongRequests[p]);
    
    if (allRequested && allPlayers.length >= 2) {
      // All players requested - skip round and start new one
      game.roundFinished = true;
      
      // Reset requests
      game.newSongRequests = {};
      
      // Generate new song
      game.song = randomSong();
      game.startTime = game.gameMode === 'random' ? randomStart() : 0;
      game.roundFinished = false;
      
      // Reset player states
      Object.values(game.players).forEach(p => {
        p.finished = false;
        p.duration = null;
        p.timestamp = null;
        p.strikesOut = false;
        p.strikes = 0;
      });
      
      io.to(lobbyId).emit("gameStart", {
        song: game.song,
        startTime: game.startTime,
        scores: game.scores,
        gameMode: game.gameMode
      });
    } else {
      // Broadcast request status
      io.to(lobbyId).emit("newSongRequestStatus", {
        requests: Object.keys(game.newSongRequests),
        total: allPlayers.length
      });
    }
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

  socket.on("chatMessage", ({ lobbyId, username, message }) => {
    const game = lobbies[lobbyId];
    if (!game) {
      console.log(`Chat: Lobby ${lobbyId} not found`);
      return;
    }
    
    console.log(`Chat: Broadcasting message from ${username} in lobby ${lobbyId}`);
    
    io.to(lobbyId).emit("chatMessage", {
      username,
      message,
      timestamp: Date.now()
    });
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
      // Both players finished - compare strikes first
      // If same strikes, it's a tie. If different strikes, fewer strikes wins.
      const sortedPlayers = validPlayers.sort((a, b) => {
        // First compare strikes (fewer is better)
        if (a.strikes !== b.strikes) {
          return a.strikes - b.strikes;
        }
        // If same strikes, compare timestamp (earlier is better for tie-breaker display)
        return a.timestamp - b.timestamp;
      });

      // Check if all players have the same number of strikes
      const strikes = sortedPlayers.map(p => p.strikes);
      const allSameStrikes = strikes.every(s => s === strikes[0]);

      if (allSameStrikes) {
        // Same number of strikes - use timestamp (who guessed first)
        const winner = sortedPlayers[0].username;
        const loser = sortedPlayers[1].username;
        game.scores[winner].wins++;
        game.scores[loser].losses++;
        
        io.to(lobbyId).emit("gameOver", {
          winner: winner,
          winnerDuration: sortedPlayers[0].duration,
          winnerStrikes: sortedPlayers[0].strikes,
          loserStrikes: sortedPlayers[1].strikes,
          sameStrikes: true,
          song: game.song,
          scores: game.scores
        });
      } else {
        // Different strikes - winner is the one with fewer strikes
        const winner = sortedPlayers[0].username;
        const loser = sortedPlayers[1].username;
        game.scores[winner].wins++;
        game.scores[loser].losses++;
        
        io.to(lobbyId).emit("gameOver", {
          winner: winner,
          winnerDuration: sortedPlayers[0].duration,
          winnerStrikes: sortedPlayers[0].strikes,
          loserStrikes: sortedPlayers[1].strikes,
          sameStrikes: false,
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
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
