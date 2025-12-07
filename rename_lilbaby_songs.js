import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determine the correct folder path
let LILBABY_FOLDER;
if (fs.existsSync('/Users/jacegandhi/Desktop/Lil Baby')) {
    LILBABY_FOLDER = '/Users/jacegandhi/Desktop/Lil Baby';
} else if (fs.existsSync(path.join(__dirname, 'Lil Baby'))) {
    LILBABY_FOLDER = path.join(__dirname, 'Lil Baby');
} else {
    LILBABY_FOLDER = path.join(__dirname, 'Lil Baby');
}

// Album folder names (matching actual folder names)
const ALBUM_FOLDERS = {
    'lilbaby': 'lilbaby',
    'myturn': 'My Turn',
    'toohard': 'Too Hard',
    'harderthanever': 'Harder Than Ever',
    'dripharder': 'Drip Harder',
    'itsonlyme': "It's Only Me",
    'other': 'other'
};

// Function to clean filename and format as "song.mp3" or "song (ft. artists).mp3"
function cleanFilename(filename, folderName) {
    // Remove .mp3 extension
    let name = filename.replace(/\.mp3$/i, '');
    
    // Remove "Lil Baby - ", "Lil Baby, ", etc.
    name = name.replace(/^Lil\s+Baby\s*[-,]\s*/i, '');
    name = name.replace(/^Lil\s+Baby\s+/i, '');
    
    // Remove leading track numbers (e.g., "01 ", "01. ", "1. ")
    name = name.replace(/^(\d{1,2})\.?\s+/, '');
    
    // Remove album-specific suffixes like "(Harder Than Ever)", "(Too Hard)", etc.
    name = name.replace(/\s*\(Harder Than Ever\)/gi, '');
    name = name.replace(/\s*\(Too Hard\)/gi, '');
    name = name.replace(/\s*\(My Turn\)/gi, '');
    name = name.replace(/\s*\(Drip Harder\)/gi, '');
    name = name.replace(/\s*\(It's Only Me\)/gi, '');
    
    // Remove "(Official Audio)", "(Official)", "(Audio)", etc.
    name = name.replace(/\s*\(Official[^)]*\)/gi, '');
    name = name.replace(/\s*\(Audio\)/gi, '');
    name = name.replace(/\s*\(Video\)/gi, '');
    name = name.replace(/\s*\(Music Video\)/gi, '');
    name = name.replace(/\s*\(On Me Challenge\)/gi, '');
    name = name.replace(/\s*\(from[^)]*\)/gi, ''); // Remove "(from Queen & Slim...)"
    name = name.replace(/\s*\(432Hz\)/gi, ''); // Remove "(432Hz)" from It's Only Me files
    name = name.replace(/\(432Hz\)/gi, ''); // Also handle cases where it's not preceded by space
    
    // Fix malformed parentheses (e.g., "Song (ft. Artist (432Hz)" -> "Song (ft. Artist)")
    name = name.replace(/\(([^)]*)\s*\(432Hz\)/gi, '($1)');
    
    // Remove YouTube video IDs in brackets
    name = name.replace(/\s*\[.*?\]$/, '');
    
    // Remove extra whitespace
    name = name.trim().replace(/\s+/g, ' ');
    
    // Handle "Lil Baby & Drake" or "Lil Baby, Artist" patterns
    name = name.replace(/^Lil\s+Baby\s*&\s*/i, '');
    name = name.replace(/^Lil\s+Baby\s*,\s*/i, '');
    
    // Format features: convert "Ft.", "ft.", "feat.", "featuring" to " (ft. "
    // Handle "Ft." (capital F) first
    name = name.replace(/\s+Ft\.\s+/g, ' (ft. ');
    name = name.replace(/\s+ft\.\s+/gi, ' (ft. ');
    name = name.replace(/\s+feat\.\s+/gi, ' (ft. ');
    name = name.replace(/\s+featuring\s+/gi, ' (ft. ');
    
    // If there's a feature but no closing parenthesis, add it
    if (name.includes(' (ft. ') && !name.match(/\(ft\.[^)]+\)/i)) {
        name = name + ')';
    }
    
    // Clean up any double parentheses
    name = name.replace(/\(\(/g, '(').replace(/\)\)/g, ')');
    
    return name;
}

// Recursively find all MP3 files
function findMP3Files(dir) {
    const files = [];
    try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                // Recursively search subdirectories
                files.push(...findMP3Files(fullPath));
            } else if (item.isFile() && /\.mp3$/i.test(item.name)) {
                files.push(fullPath);
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error.message);
    }
    return files;
}

// Main rename function
function renameLilBabySongs() {
    console.log('Starting Lil Baby song renaming process...\n');
    console.log(`Looking for folder at: ${LILBABY_FOLDER}`);
    console.log(`Folder exists: ${fs.existsSync(LILBABY_FOLDER)}\n`);
    
    if (!fs.existsSync(LILBABY_FOLDER)) {
        console.error(`Error: Lil Baby folder not found at: ${LILBABY_FOLDER}`);
        console.log('Please create a "Lil Baby" folder in the project root and organize songs by album folders.');
        return;
    }
    
    const mp3Files = findMP3Files(LILBABY_FOLDER);
    console.log(`Found ${mp3Files.length} MP3 files\n`);
    
    if (mp3Files.length === 0) {
        console.log('No MP3 files found. Make sure files are in the Lil Baby folder.');
        return;
    }
    
    let renamedCount = 0;
    let skippedCount = 0;
    const renameLog = [];
    
    for (const filePath of mp3Files) {
        const dir = path.dirname(filePath);
        const oldName = path.basename(filePath);
        const folderName = path.basename(dir);
        
        // Determine if file is in an album folder or root
        const isInAlbumFolder = Object.values(ALBUM_FOLDERS).includes(folderName.toLowerCase()) || 
                               folderName.toLowerCase() === 'lil baby';
        
        // Clean the filename
        const cleanedName = cleanFilename(oldName, folderName);
        const newName = `${cleanedName}.mp3`;
        const newPath = path.join(dir, newName);
        
        // Skip if name hasn't changed
        if (oldName === newName) {
            console.log(`✓ Already formatted: ${oldName}`);
            skippedCount++;
            continue;
        }
        
        // Check if target file already exists
        if (fs.existsSync(newPath) && newPath !== filePath) {
            console.log(`⚠ Skipping ${oldName} - ${newName} already exists`);
            skippedCount++;
            continue;
        }
        
        try {
            fs.renameSync(filePath, newPath);
            console.log(`✓ Renamed: ${oldName} → ${newName}`);
            renameLog.push({ old: oldName, new: newName, folder: folderName });
            renamedCount++;
        } catch (error) {
            console.error(`✗ Error renaming ${oldName}:`, error.message);
        }
    }
    
    console.log(`\n═══════════════════════════════════════════════════════`);
    console.log(`Summary:`);
    console.log(`  Renamed: ${renamedCount} files`);
    console.log(`  Skipped: ${skippedCount} files`);
    console.log(`  Total: ${mp3Files.length} files`);
    console.log(`═══════════════════════════════════════════════════════\n`);
    
    // Generate song list from renamed files
    console.log('Generating song list from folder structure...\n');
    generateSongList();
}

// Generate song list organized by album
function generateSongList() {
    const songsByAlbum = {};
    
    // Initialize album objects
    Object.keys(ALBUM_FOLDERS).forEach(album => {
        songsByAlbum[album] = [];
    });
    
    // Scan each album folder
    Object.entries(ALBUM_FOLDERS).forEach(([albumKey, folderName]) => {
        const albumPath = path.join(LILBABY_FOLDER, folderName);
        
        if (fs.existsSync(albumPath)) {
            const files = fs.readdirSync(albumPath);
            const mp3Files = files.filter(f => /\.mp3$/i.test(f));
            
            mp3Files.forEach(file => {
                const songName = file.replace(/\.mp3$/i, '');
                songsByAlbum[albumKey].push(songName);
            });
            
            if (mp3Files.length > 0) {
                console.log(`${folderName}: ${mp3Files.length} songs`);
            }
        }
    });
    
    // Also check root of Lil Baby folder
    if (fs.existsSync(LILBABY_FOLDER)) {
        const rootFiles = fs.readdirSync(LILBABY_FOLDER);
        const rootMP3s = rootFiles.filter(f => /\.mp3$/i.test(f) && fs.statSync(path.join(LILBABY_FOLDER, f)).isFile());
        
        if (rootMP3s.length > 0) {
            console.log(`root: ${rootMP3s.length} songs`);
            rootMP3s.forEach(file => {
                const songName = file.replace(/\.mp3$/i, '');
                if (!songsByAlbum.other) songsByAlbum.other = [];
                songsByAlbum.other.push(songName);
            });
        }
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('GENERATED CODE FOR backend/lilbaby_songs.js:');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('export const lilbabySongs = [');
    
    // Harder Than Ever
    if (songsByAlbum.harderthanever.length > 0) {
        console.log('  // Harder Than Ever');
        songsByAlbum.harderthanever.forEach(song => {
            console.log(`  "${song}",`);
        });
        console.log('');
    }
    
    // Drip Harder
    if (songsByAlbum.dripharder.length > 0) {
        console.log('  // Drip Harder');
        songsByAlbum.dripharder.forEach(song => {
            console.log(`  "${song}",`);
        });
        console.log('');
    }
    
    // My Turn
    if (songsByAlbum.myturn.length > 0) {
        console.log('  // My Turn');
        songsByAlbum.myturn.forEach(song => {
            console.log(`  "${song}",`);
        });
        console.log('');
    }
    
    // Too Hard
    if (songsByAlbum.toohard.length > 0) {
        console.log('  // Too Hard');
        songsByAlbum.toohard.forEach(song => {
            console.log(`  "${song}",`);
        });
        console.log('');
    }
    
    // It's Only Me
    if (songsByAlbum.itsonlyme.length > 0) {
        console.log('  // It\'s Only Me');
        songsByAlbum.itsonlyme.forEach(song => {
            console.log(`  "${song}",`);
        });
        console.log('');
    }
    
    // Lil Baby
    if (songsByAlbum.lilbaby.length > 0) {
        console.log('  // Lil Baby');
        songsByAlbum.lilbaby.forEach(song => {
            console.log(`  "${song}",`);
        });
        console.log('');
    }
    
    // Other/Singles
    if (songsByAlbum.other.length > 0) {
        console.log('  // Other/Singles');
        songsByAlbum.other.forEach(song => {
            console.log(`  "${song}",`);
        });
        console.log('');
    }
    
    console.log('];\n');
    
    console.log('export const lilbabyAlbumMap = {');
    
    // Generate album map
    if (songsByAlbum.harderthanever.length > 0) {
        console.log('  // Harder Than Ever - harderthanever.jpg');
        songsByAlbum.harderthanever.forEach(song => {
            console.log(`  "${song}": "harderthanever",`);
        });
        console.log('');
    }
    
    if (songsByAlbum.dripharder.length > 0) {
        console.log('  // Drip Harder - dripharder.jpg');
        songsByAlbum.dripharder.forEach(song => {
            console.log(`  "${song}": "dripharder",`);
        });
        console.log('');
    }
    
    if (songsByAlbum.myturn.length > 0) {
        console.log('  // My Turn - myturn.jpg');
        songsByAlbum.myturn.forEach(song => {
            console.log(`  "${song}": "myturn",`);
        });
        console.log('');
    }
    
    if (songsByAlbum.toohard.length > 0) {
        console.log('  // Too Hard - toohard.jpg');
        songsByAlbum.toohard.forEach(song => {
            console.log(`  "${song}": "toohard",`);
        });
        console.log('');
    }
    
    if (songsByAlbum.itsonlyme.length > 0) {
        console.log('  // It\'s Only Me - itsonlyme.jpg');
        songsByAlbum.itsonlyme.forEach(song => {
            console.log(`  "${song}": "itsonlyme",`);
        });
        console.log('');
    }
    
    if (songsByAlbum.lilbaby.length > 0) {
        console.log('  // Lil Baby - lilbaby.jpg');
        songsByAlbum.lilbaby.forEach(song => {
            console.log(`  "${song}": "lilbaby",`);
        });
        console.log('');
    }
    
    if (songsByAlbum.other.length > 0) {
        console.log('  // Other/Singles - lilbaby.jpg');
        songsByAlbum.other.forEach(song => {
            console.log(`  "${song}": "lilbaby",`);
        });
        console.log('');
    }
    
    console.log('};');
}

// Run the rename function
const outputFile = path.join(__dirname, 'rename_output.log');
const originalLog = console.log;
const originalError = console.error;

// Also log to file
const logToFile = (message) => {
    originalLog(message);
    fs.appendFileSync(outputFile, message + '\n');
};

console.log = logToFile;
console.error = (...args) => {
    originalError(...args);
    fs.appendFileSync(outputFile, args.join(' ') + '\n');
};

try {
    fs.writeFileSync(outputFile, '=== Rename Script Started ===\n');
    logToFile('Script starting...');
    logToFile(`LILBABY_FOLDER: ${LILBABY_FOLDER}`);
    renameLilBabySongs();
    logToFile('=== Script Completed ===\n');
} catch (error) {
    logToFile(`Error running script: ${error.message}\n${error.stack}`);
    process.exit(1);
}

