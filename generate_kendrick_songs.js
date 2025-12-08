import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const KENDRICK_FOLDER = path.join(__dirname, 'Kendrick');

// Album folder mapping
const ALBUM_MAP = {
    'Section 80': 'section',
    'good kid mAAd city': 'gkmc',
    'To Pimp A Butterfly': 'tpab',
    'DAMN.': 'damn',
    'Mr Morale and the Big Steppers': 'mmtbs',
    'gnx': 'gnx',
    'other': 'kendrick'
};

function scanFolder() {
    console.log('Scanning Kendrick Lamar folder...\n');
    
    if (!fs.existsSync(KENDRICK_FOLDER)) {
        console.error(`Error: Folder not found: ${KENDRICK_FOLDER}`);
        return;
    }
    
    const songsByAlbum = {};
    Object.keys(ALBUM_MAP).forEach(album => {
        songsByAlbum[album] = [];
    });
    
    // Scan each album folder
    const folders = fs.readdirSync(KENDRICK_FOLDER, { withFileTypes: true });
    
    for (const folder of folders) {
        if (!folder.isDirectory()) continue;
        
        const folderName = folder.name;
        const folderPath = path.join(KENDRICK_FOLDER, folderName);
        
        console.log(`Scanning ${folderName}...`);
        
        const files = fs.readdirSync(folderPath);
        const mp3Files = files.filter(f => /\.mp3$/i.test(f));
        
        for (const file of mp3Files) {
            const songName = file.replace(/\.mp3$/i, '');
            if (ALBUM_MAP[folderName]) {
                songsByAlbum[folderName].push(songName);
            } else {
                songsByAlbum.other.push(songName);
            }
        }
        
        console.log(`  Found ${mp3Files.length} songs\n`);
    }
    
    // Generate code
    console.log('export const kendrickSongs = [');
    
    // Section 80
    if (songsByAlbum['Section 80']?.length > 0) {
        console.log('  // Section 80');
        songsByAlbum['Section 80'].forEach(song => console.log(`  "${song}",`));
        console.log('');
    }
    
    // good kid mAAd city
    if (songsByAlbum['good kid mAAd city']?.length > 0) {
        console.log('  // good kid mAAd city');
        songsByAlbum['good kid mAAd city'].forEach(song => console.log(`  "${song}",`));
        console.log('');
    }
    
    // To Pimp A Butterfly
    if (songsByAlbum['To Pimp A Butterfly']?.length > 0) {
        console.log('  // To Pimp A Butterfly');
        songsByAlbum['To Pimp A Butterfly'].forEach(song => console.log(`  "${song}",`));
        console.log('');
    }
    
    // DAMN.
    if (songsByAlbum['DAMN.']?.length > 0) {
        console.log('  // DAMN.');
        songsByAlbum['DAMN.'].forEach(song => console.log(`  "${song}",`));
        console.log('');
    }
    
    // Mr Morale and the Big Steppers
    if (songsByAlbum['Mr Morale and the Big Steppers']?.length > 0) {
        console.log('  // Mr Morale and the Big Steppers');
        songsByAlbum['Mr Morale and the Big Steppers'].forEach(song => console.log(`  "${song}",`));
        console.log('');
    }
    
    // gnx
    if (songsByAlbum['gnx']?.length > 0) {
        console.log('  // gnx');
        songsByAlbum['gnx'].forEach(song => console.log(`  "${song}",`));
        console.log('');
    }
    
    // Other/Singles
    if (songsByAlbum.other?.length > 0) {
        console.log('  // Other/Singles');
        songsByAlbum.other.forEach(song => console.log(`  "${song}",`));
        console.log('');
    }
    
    console.log('];\n');
    
    console.log('export const kendrickAlbumMap = {');
    
    // Generate album map
    Object.entries(ALBUM_MAP).forEach(([folderName, albumCode]) => {
        if (songsByAlbum[folderName]?.length > 0) {
            const albumName = folderName === 'Section 80' ? 'Section 80' : 
                            folderName === 'good kid mAAd city' ? 'good kid mAAd city' :
                            folderName === 'To Pimp A Butterfly' ? 'To Pimp A Butterfly' :
                            folderName === 'DAMN.' ? 'DAMN.' :
                            folderName === 'Mr Morale and the Big Steppers' ? 'Mr Morale and the Big Steppers' :
                            folderName === 'gnx' ? 'gnx' : 'other';
            console.log(`  // ${albumName} - ${albumCode}.jpg`);
            songsByAlbum[folderName].forEach(song => {
                console.log(`  "${song}": "${albumCode}",`);
            });
            console.log('');
        }
    });
    
    console.log('};');
}

scanFolder();

