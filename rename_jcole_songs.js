import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import J. Cole songs list
import { jcoleSongs } from './backend/jcole_songs.js';

const JCOLE_FOLDER = path.join(__dirname, 'J. Cole');

// Function to normalize a string for comparison (remove special chars, lowercase)
function normalizeString(str) {
    return str.toLowerCase()
        .normalize('NFD') // Normalize unicode characters (é -> e')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/'/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, ' ');
}

// Function to remove track numbers and normalize filename
function removeTrackNumber(filename) {
    // Remove .mp3 extension
    let name = filename.replace(/\.mp3$/i, '');
    
    // Remove leading track number (e.g., "01 ", "02 ", etc.)
    name = name.replace(/^\d+\s+/, '');
    
    return name.trim();
}

// Function to find matching song from the list
function findMatchingSong(filename) {
    const cleanedFilename = removeTrackNumber(filename);
    const normalizedFilename = normalizeString(cleanedFilename);
    
    // Try exact match first
    for (const song of jcoleSongs) {
        if (normalizeString(song) === normalizedFilename) {
            return song;
        }
    }
    
    // Try partial match (for songs with variations)
    for (const song of jcoleSongs) {
        const normalizedSong = normalizeString(song);
        if (normalizedFilename.includes(normalizedSong) || normalizedSong.includes(normalizedFilename)) {
            // Only return if it's a close match (not too different in length)
            const lengthDiff = Math.abs(normalizedFilename.length - normalizedSong.length);
            if (lengthDiff <= 5) {
                return song;
            }
        }
    }
    
    return null;
}

// Function to recursively find all MP3 files
function findMP3Files(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            findMP3Files(filePath, fileList);
        } else if (file.toLowerCase().endsWith('.mp3')) {
            fileList.push({
                fullPath: filePath,
                dir: dir,
                filename: file
            });
        }
    });
    
    return fileList;
}

// Main function
function renameJColeSongs() {
    console.log('Starting J. Cole song renaming process...\n');
    console.log(`Found ${jcoleSongs.length} songs in the list\n`);
    
    if (!fs.existsSync(JCOLE_FOLDER)) {
        console.error(`Error: J. Cole folder not found at: ${JCOLE_FOLDER}`);
        process.exit(1);
    }
    
    // Find all MP3 files
    const mp3Files = findMP3Files(JCOLE_FOLDER);
    console.log(`Found ${mp3Files.length} MP3 files to process\n`);
    
    const renameOperations = [];
    const unmatchedFiles = [];
    
    // Process each file
    mp3Files.forEach(({ fullPath, dir, filename }) => {
        const matchingSong = findMatchingSong(filename);
        
        if (matchingSong) {
            const newFilename = `${matchingSong}.mp3`;
            const newPath = path.join(dir, newFilename);
            
            // Only rename if the filename is different
            if (filename !== newFilename) {
                renameOperations.push({
                    oldPath: fullPath,
                    newPath: newPath,
                    oldName: filename,
                    newName: newFilename,
                    song: matchingSong
                });
            } else {
                console.log(`✓ "${filename}" already correctly named`);
            }
        } else {
            unmatchedFiles.push({
                path: fullPath,
                filename: filename,
                cleaned: removeTrackNumber(filename)
            });
        }
    });
    
    // Show what will be renamed
    if (renameOperations.length > 0) {
        console.log(`\n📝 Files to be renamed (${renameOperations.length}):\n`);
        renameOperations.forEach(({ oldName, newName }) => {
            console.log(`  "${oldName}" → "${newName}"`);
        });
    }
    
    // Show unmatched files
    if (unmatchedFiles.length > 0) {
        console.log(`\n⚠️  Unmatched files (${unmatchedFiles.length}):\n`);
        unmatchedFiles.forEach(({ filename, cleaned }) => {
            console.log(`  "${filename}" (cleaned: "${cleaned}")`);
        });
        console.log('\nThese files could not be matched to the songs list.');
        console.log('You may need to check these manually.\n');
    }
    
    // Ask for confirmation
    if (renameOperations.length === 0) {
        console.log('\n✅ No files need to be renamed!');
        return;
    }
    
    // Perform the renames automatically
    console.log(`\n🔄 Starting rename process for ${renameOperations.length} files...\n`);
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    renameOperations.forEach(({ oldPath, newPath, oldName, newName }) => {
        try {
            // Check if target file already exists
            if (fs.existsSync(newPath)) {
                // Check if it's the same file (same inode)
                const oldStat = fs.statSync(oldPath);
                const newStat = fs.statSync(newPath);
                if (oldStat.ino === newStat.ino) {
                    console.log(`✓ "${oldName}" already correctly named (skipping)`);
                    skippedCount++;
                    return;
                } else {
                    console.log(`⚠️  Skipping "${oldName}" - target "${newName}" already exists (different file)`);
                    errorCount++;
                    return;
                }
            }
            
            fs.renameSync(oldPath, newPath);
            console.log(`✓ Renamed: "${oldName}" → "${newName}"`);
            successCount++;
        } catch (error) {
            console.error(`✗ Error renaming "${oldName}":`, error.message);
            errorCount++;
        }
    });
    
    console.log(`\n✅ Renaming complete!`);
    console.log(`   ✓ Successfully renamed: ${successCount}`);
    console.log(`   ⏭️  Already correct (skipped): ${skippedCount}`);
    console.log(`   ✗ Errors: ${errorCount}`);
    if (unmatchedFiles.length > 0) {
        console.log(`   ⚠️  Unmatched files: ${unmatchedFiles.length}`);
    }
}

// Run the script
renameJColeSongs();

