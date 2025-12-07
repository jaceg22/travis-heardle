import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LILBABY_FOLDER = '/Users/jacegandhi/Desktop/Lil Baby';

// Album folder mapping
const ALBUM_MAP = {
    'My Turn': 'myturn',
    'Too Hard': 'toohard',
    'Harder Than Ever': 'harderthanever',
    'Drip Harder': 'dripharder',
    "It's Only Me": 'itsonlyme',
    'other': 'lilbaby' // Singles use lilbaby.jpg
};

function cleanSongName(filename) {
    let name = filename.replace(/\.mp3$/i, '');
    
    // Remove "Lil Baby - ", "Lil Baby, ", etc.
    name = name.replace(/^Lil\s+Baby\s*[-,]\s*/i, '');
    name = name.replace(/^Lil\s+Baby\s+/i, '');
    name = name.replace(/^Lil\s+Baby\s*Feat\.?\s*/i, '');
    name = name.replace(/^Lil\s+Baby\s*x\s*/i, '');
    
    // Remove leading track numbers
    name = name.replace(/^(\d{1,2})\.?\s+/, '');
    
    // Remove "(Official Audio)", "(Audio)", etc.
    name = name.replace(/\s*\(Official[^)]*\)/gi, '');
    name = name.replace(/\s*\(Audio\)/gi, '');
    name = name.replace(/\s*\(Video\)/gi, '');
    name = name.replace(/\s*\(Music Video\)/gi, '');
    name = name.replace(/\s*\(432Hz\)/gi, '');
    name = name.replace(/\s*\(from[^)]*\)/gi, '');
    
    // Remove YouTube video IDs in brackets
    name = name.replace(/\s*\[.*?\]$/, '');
    
    // Format features: convert "ft.", "feat.", "featuring" to " (ft. "
    name = name.replace(/\s+ft\.\s+/gi, ' (ft. ');
    name = name.replace(/\s+feat\.\s+/gi, ' (ft. ');
    name = name.replace(/\s+featuring\s+/gi, ' (ft. ');
    
    // If there's a feature but no closing parenthesis, add it
    if (name.includes(' (ft. ') && !name.includes(')')) {
        name = name + ')';
    }
    
    // Clean up any double parentheses
    name = name.replace(/\(\(/g, '(').replace(/\)\)/g, ')');
    
    // Remove extra whitespace
    name = name.trim().replace(/\s+/g, ' ');
    
    return name;
}

function scanFolder() {
    console.log('Scanning Lil Baby folder...\n');
    console.log(`Folder: ${LILBABY_FOLDER}\n`);
    
    if (!fs.existsSync(LILBABY_FOLDER)) {
        console.error(`Error: Folder not found: ${LILBABY_FOLDER}`);
        process.exit(1);
    }
    
    const songsByAlbum = {
        'harderthanever': [],
        'dripharder': [],
        'myturn': [],
        'toohard': [],
        'itsonlyme': [],
        'lilbaby': [],
        'other': []
    };
    
    // Scan each album folder
    const folders = fs.readdirSync(LILBABY_FOLDER, { withFileTypes: true });
    
    for (const folder of folders) {
        if (!folder.isDirectory()) continue;
        
        const folderName = folder.name;
        const folderPath = path.join(LILBABY_FOLDER, folderName);
        const albumKey = ALBUM_MAP[folderName] || 'other';
        
        console.log(`Scanning ${folderName}...`);
        
        const files = fs.readdirSync(folderPath);
        const mp3Files = files.filter(f => /\.mp3$/i.test(f));
        
        for (const file of mp3Files) {
            const cleanName = cleanSongName(file);
            songsByAlbum[albumKey].push(cleanName);
            console.log(`  ${file} -> "${cleanName}"`);
        }
        
        console.log(`  Found ${mp3Files.length} songs\n`);
    }
    
    // Generate code
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('GENERATED CODE FOR backend/lilbaby_songs.js:');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('export const lilbabySongs = [');
    
    if (songsByAlbum.harderthanever.length > 0) {
        console.log('  // Harder Than Ever');
        songsByAlbum.harderthanever.forEach(song => console.log(`  "${song}",`));
        console.log('');
    }
    
    if (songsByAlbum.dripharder.length > 0) {
        console.log('  // Drip Harder');
        songsByAlbum.dripharder.forEach(song => console.log(`  "${song}",`));
        console.log('');
    }
    
    if (songsByAlbum.myturn.length > 0) {
        console.log('  // My Turn');
        songsByAlbum.myturn.forEach(song => console.log(`  "${song}",`));
        console.log('');
    }
    
    if (songsByAlbum.toohard.length > 0) {
        console.log('  // Too Hard');
        songsByAlbum.toohard.forEach(song => console.log(`  "${song}",`));
        console.log('');
    }
    
    if (songsByAlbum.itsonlyme.length > 0) {
        console.log('  // It\'s Only Me');
        songsByAlbum.itsonlyme.forEach(song => console.log(`  "${song}",`));
        console.log('');
    }
    
    if (songsByAlbum.lilbaby.length > 0) {
        console.log('  // Lil Baby');
        songsByAlbum.lilbaby.forEach(song => console.log(`  "${song}",`));
        console.log('');
    }
    
    if (songsByAlbum.other.length > 0) {
        console.log('  // Other/Singles');
        songsByAlbum.other.forEach(song => console.log(`  "${song}",`));
        console.log('');
    }
    
    console.log('];\n');
    
    console.log('export const lilbabyAlbumMap = {');
    
    if (songsByAlbum.harderthanever.length > 0) {
        console.log('  // Harder Than Ever - harderthanever.jpg');
        songsByAlbum.harderthanever.forEach(song => console.log(`  "${song}": "harderthanever",`));
        console.log('');
    }
    
    if (songsByAlbum.dripharder.length > 0) {
        console.log('  // Drip Harder - dripharder.jpg');
        songsByAlbum.dripharder.forEach(song => console.log(`  "${song}": "dripharder",`));
        console.log('');
    }
    
    if (songsByAlbum.myturn.length > 0) {
        console.log('  // My Turn - myturn.jpg');
        songsByAlbum.myturn.forEach(song => console.log(`  "${song}": "myturn",`));
        console.log('');
    }
    
    if (songsByAlbum.toohard.length > 0) {
        console.log('  // Too Hard - toohard.jpg');
        songsByAlbum.toohard.forEach(song => console.log(`  "${song}": "toohard",`));
        console.log('');
    }
    
    if (songsByAlbum.itsonlyme.length > 0) {
        console.log('  // It\'s Only Me - itsonlyme.jpg');
        songsByAlbum.itsonlyme.forEach(song => console.log(`  "${song}": "itsonlyme",`));
        console.log('');
    }
    
    if (songsByAlbum.lilbaby.length > 0) {
        console.log('  // Lil Baby - lilbaby.jpg');
        songsByAlbum.lilbaby.forEach(song => console.log(`  "${song}": "lilbaby",`));
        console.log('');
    }
    
    if (songsByAlbum.other.length > 0) {
        console.log('  // Other/Singles - lilbaby.jpg');
        songsByAlbum.other.forEach(song => console.log(`  "${song}": "lilbaby",`));
        console.log('');
    }
    
    console.log('};');
    
    const totalSongs = Object.values(songsByAlbum).reduce((sum, arr) => sum + arr.length, 0);
    console.log(`\nTotal songs: ${totalSongs}`);
}

scanFolder();

