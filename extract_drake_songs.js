import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DRAKE_FOLDER = path.join(__dirname, 'Drake');

// Album folder name to simple name mapping
const albumMap = {
    'So Far Gone': 'sfg',
    'Thank Me Later': 'tml',
    'Take Care': 'takecare',
    'Nothing Was The Same': 'nwts',
    'If Youre Reading This Its Too Late': 'iyrtitl',
    'Views': 'views',
    'More Life': 'morelife',
    'Scorpion': 'scorpion',
    'Dark Lane Demo Tapes': 'darklane',
    'Certified Lover Boy': 'clb',
    'Honestly Nevermind': 'hnm',
    'Her Loss': 'herloss', // if exists
    'For All The Dogs': 'fad',
    'Care Package': 'carepackage',
    'Other': 'drake'
};

// Function to clean song name
function cleanSongName(filename) {
    // Remove .mp3
    let name = filename.replace(/\.mp3$/i, '');
    
    // Remove YouTube video IDs in brackets FIRST (before removing track numbers)
    name = name.replace(/\s*\[.*?\]$/, '');
    
    // Remove "Drake - ", "Drake, ", etc.
    name = name.replace(/^Drake\s*[-,]\s*/, '');
    name = name.replace(/^Drake\s+/, '');
    
    // Remove "The Weeknd - ", etc.
    name = name.replace(/^The Weeknd\s*[-,]\s*/, '');
    
    // Remove "Future, Drake", "Drake, Giveon", etc.
    name = name.replace(/^(Future|Young Thug|Giveon),?\s*(Drake,?|&)?\s*/i, '');
    name = name.replace(/^Drake,?\s*(Giveon|Future|Young Thug),?\s*/i, '');
    
    // Remove "(Official Audio)", "(Official)", "(Audio)", etc.
    name = name.replace(/\s*\(Official[^)]*\)/gi, '');
    name = name.replace(/\s*\(Audio\)/gi, '');
    
    // Remove leading track numbers (e.g., "01 ", "01. ", "1. ") but be careful
    // Only remove if it's followed by a space and looks like a track number
    // Don't remove if the number is part of the song name (like "7969 Santa", "5 Am", "8am")
    // Track numbers are usually 1-2 digits followed by space/dot
    name = name.replace(/^(\d{1,2})\.?\s+([A-Z])/, (match, num, letter) => {
        // If number is > 30 or the next word is capitalized (likely a song name), keep it
        // Otherwise it's probably a track number
        const numInt = parseInt(num);
        if (numInt > 30 || letter) {
            return match; // Keep it
        }
        return letter; // Remove track number
    });
    
    // Clean up feat/ft formatting
    name = name.replace(/\s*\(ft\./gi, ' (feat.');
    name = name.replace(/\s*\(Feat\./gi, ' (feat.');
    
    // Remove leading dashes or spaces
    name = name.replace(/^[-\s]+/, '');
    
    // Remove extra spaces
    name = name.trim().replace(/\s+/g, ' ');
    
    // Remove trailing parentheses that might be empty or just metadata
    name = name.replace(/\s*\(\)$/, '');
    
    return name;
}

// Function to recursively find all MP3 files in a directory
function findMP3Files(dir) {
    const files = fs.readdirSync(dir);
    const mp3Files = [];
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            mp3Files.push(...findMP3Files(filePath));
        } else if (file.toLowerCase().endsWith('.mp3')) {
            mp3Files.push({
                fullPath: filePath,
                dir: path.dirname(filePath),
                filename: file,
                album: path.basename(path.dirname(filePath))
            });
        }
    });
    
    return mp3Files;
}

// Main extraction
const mp3Files = findMP3Files(DRAKE_FOLDER);
const songsByAlbum = {};

mp3Files.forEach(({ filename, album }) => {
    const cleanedName = cleanSongName(filename);
    
    if (!songsByAlbum[album]) {
        songsByAlbum[album] = [];
    }
    
    if (!songsByAlbum[album].includes(cleanedName)) {
        songsByAlbum[album].push(cleanedName);
    }
});

// Sort songs within each album
Object.keys(songsByAlbum).forEach(album => {
    songsByAlbum[album].sort();
});

// Generate output
console.log('// Drake song list and album mappings\n');
console.log('export const drakeSongs = [\n');

Object.keys(songsByAlbum).sort().forEach(album => {
    console.log(`  // ${album}`);
    songsByAlbum[album].forEach(song => {
        console.log(`  "${song}",`);
    });
    console.log('');
});

console.log('];\n');
console.log('// Album mapping for Drake songs');
console.log('// Image files in Supabase: sfg.jpg, tml.jpg, takecare.jpg, nwts.jpg, iyrtitl.jpg, views.jpg, morelife.jpg, scorpion.jpg, darklane.jpg, clb.jpg, hnm.jpg, herloss.jpg, fad.jpg, carepackage.jpg, drake.jpg\n');
console.log('export const drakeAlbumMap = {\n');

Object.keys(songsByAlbum).sort().forEach(album => {
    const albumKey = albumMap[album] || album.toLowerCase().replace(/\s+/g, '');
    songsByAlbum[album].forEach(song => {
        console.log(`  "${song}": "${albumKey}",`);
    });
});

console.log('};');

// Also save to file
const output = [];
output.push('// Drake song list and album mappings\n');
output.push('export const drakeSongs = [\n');

Object.keys(songsByAlbum).sort().forEach(album => {
    output.push(`  // ${album}`);
    songsByAlbum[album].forEach(song => {
        output.push(`  "${song}",`);
    });
    output.push('');
});

output.push('];\n');
output.push('// Album mapping for Drake songs');
output.push('// Image files in Supabase: sfg.jpg, tml.jpg, takecare.jpg, nwts.jpg, iyrtitl.jpg, views.jpg, morelife.jpg, scorpion.jpg, darklane.jpg, clb.jpg, hnm.jpg, herloss.jpg, fad.jpg, carepackage.jpg, drake.jpg\n');
output.push('export const drakeAlbumMap = {\n');

Object.keys(songsByAlbum).sort().forEach(album => {
    const albumKey = albumMap[album] || album.toLowerCase().replace(/\s+/g, '');
    songsByAlbum[album].forEach(song => {
        output.push(`  "${song}": "${albumKey}",`);
    });
});

output.push('};');

fs.writeFileSync(path.join(__dirname, 'backend', 'drake_songs.js'), output.join('\n'));
console.log('\n\n✅ Saved to backend/drake_songs.js');

