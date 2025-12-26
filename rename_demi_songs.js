import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const demiFolder = path.join(__dirname, 'demi');

// Function to clean song name
function cleanSongName(filename) {
    let cleaned = filename;
    
    // Remove .mp3 extension temporarily
    cleaned = cleaned.replace(/\.mp3$/i, '');
    
    // Remove codes in brackets like [DZMYHJvo5wc]
    cleaned = cleaned.replace(/\s*\[[^\]]+\]\s*/g, '');
    
    // Remove "Demi Lovato" or " - Demi Lovato" or "Demi Lovato -"
    cleaned = cleaned.replace(/\s*-\s*Demi\s+Lovato\s*/gi, '');
    cleaned = cleaned.replace(/Demi\s+Lovato\s*-\s*/gi, '');
    cleaned = cleaned.replace(/Demi\s+Lovato\s*/gi, '');
    
    // Remove "(Lyrics)"
    cleaned = cleaned.replace(/\s*\(Lyrics\)\s*/gi, '');
    
    // Remove remix info in parentheses like "(Jump Smokers Remix)", "(Suraci Remix)", "(Wizz Dumb Remix)"
    cleaned = cleaned.replace(/\s*\([^)]*[Rr]emix[^)]*\)\s*/g, '');
    
    // Remove other parenthetical info like "(Live Acoustic)", "(Madison's Lullabye)"
    // But keep important song title info - actually, let's remove all parenthetical info for simplicity
    cleaned = cleaned.replace(/\s*\([^)]+\)\s*/g, '');
    
    // Remove "feat." or "ft." and everything after it
    cleaned = cleaned.replace(/\s*(feat\.|ft\.|featuring).*$/i, '');
    
    // Clean up extra spaces and trim
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Add .mp3 back
    return cleaned + '.mp3';
}

// Function to recursively process all files in a directory
function processDirectory(dirPath, albumName) {
    const files = fs.readdirSync(dirPath);
    const renamed = [];
    
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            // Recursively process subdirectories
            const subRenamed = processDirectory(filePath, file);
            renamed.push(...subRenamed);
        } else if (file.endsWith('.mp3')) {
            const cleanedName = cleanSongName(file);
            const newPath = path.join(dirPath, cleanedName);
            
            // Only rename if the name actually changed
            if (file !== cleanedName) {
                // Check if target file already exists
                if (fs.existsSync(newPath)) {
                    console.log(`⚠️  Skipping ${file} - target ${cleanedName} already exists`);
                } else {
                    fs.renameSync(filePath, newPath);
                    console.log(`✓ Renamed: ${file} → ${cleanedName}`);
                    renamed.push({
                        old: file,
                        new: cleanedName,
                        album: albumName,
                        path: path.relative(demiFolder, dirPath)
                    });
                }
            } else {
                renamed.push({
                    old: file,
                    new: cleanedName,
                    album: albumName,
                    path: path.relative(demiFolder, dirPath)
                });
            }
        }
    }
    
    return renamed;
}

// Main execution
console.log('Starting to rename Demi Lovato songs...\n');

try {
    const allRenamed = processDirectory(demiFolder, '');
    
    console.log(`\n✅ Renaming complete! Processed ${allRenamed.length} files.`);
    
    // Generate song list by album
    const songsByAlbum = {};
    allRenamed.forEach(item => {
        const album = item.path || 'root';
        if (!songsByAlbum[album]) {
            songsByAlbum[album] = [];
        }
        // Remove .mp3 extension for song list
        const songName = item.new.replace(/\.mp3$/i, '');
        songsByAlbum[album].push(songName);
    });
    
    console.log('\n📋 Songs by Album:');
    Object.keys(songsByAlbum).sort().forEach(album => {
        console.log(`\n${album}:`);
        songsByAlbum[album].forEach(song => {
            console.log(`  - ${song}`);
        });
    });
    
} catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
}

