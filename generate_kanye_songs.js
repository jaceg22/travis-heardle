import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const KANYE_FOLDER = '/Users/jacegandhi/Desktop/Kanye';

// Album folder mapping
const ALBUM_MAP = {
    'The College Dropout': 'tcd',
    'Late Registration': 'late',
    'Graduation': 'graduation',
    "808's & Heartbreak": '808',
    'My Beautiful Dark Twisted Fantasy': 'mbdtf',
    'Yeezus': 'yeezus',
    'The Life Of Pablo': 'tlop',
    'Ye': 'ye',
    'Donda': 'donda',
    'other': 'kanye'
};

function scanFolder() {
    console.log('Scanning Kanye West folder...\n');
    
    if (!fs.existsSync(KANYE_FOLDER)) {
        console.error(`Error: Folder not found: ${KANYE_FOLDER}`);
        return;
    }
    
    const songsByAlbum = {};
    Object.keys(ALBUM_MAP).forEach(album => {
        songsByAlbum[album] = [];
    });
    
    // Scan each album folder
    const folders = fs.readdirSync(KANYE_FOLDER, { withFileTypes: true });
    
    for (const folder of folders) {
        if (!folder.isDirectory()) continue;
        
        const folderName = folder.name;
        const folderPath = path.join(KANYE_FOLDER, folderName);
        
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
    console.log('export const kanyeSongs = [');
    
    // The College Dropout
    if (songsByAlbum['The College Dropout']?.length > 0) {
        console.log('  // The College Dropout');
        songsByAlbum['The College Dropout'].forEach(song => console.log(`  "${song}",`));
        console.log('');
    }
    
    // Late Registration
    if (songsByAlbum['Late Registration']?.length > 0) {
        console.log('  // Late Registration');
        songsByAlbum['Late Registration'].forEach(song => console.log(`  "${song}",`));
        console.log('');
    }
    
    // Graduation
    if (songsByAlbum['Graduation']?.length > 0) {
        console.log('  // Graduation');
        songsByAlbum['Graduation'].forEach(song => console.log(`  "${song}",`));
        console.log('');
    }
    
    // 808's & Heartbreak
    if (songsByAlbum["808's & Heartbreak"]?.length > 0) {
        console.log("  // 808's & Heartbreak");
        songsByAlbum["808's & Heartbreak"].forEach(song => console.log(`  "${song}",`));
        console.log('');
    }
    
    // My Beautiful Dark Twisted Fantasy
    if (songsByAlbum['My Beautiful Dark Twisted Fantasy']?.length > 0) {
        console.log('  // My Beautiful Dark Twisted Fantasy');
        songsByAlbum['My Beautiful Dark Twisted Fantasy'].forEach(song => console.log(`  "${song}",`));
        console.log('');
    }
    
    // Yeezus
    if (songsByAlbum['Yeezus']?.length > 0) {
        console.log('  // Yeezus');
        songsByAlbum['Yeezus'].forEach(song => console.log(`  "${song}",`));
        console.log('');
    }
    
    // The Life Of Pablo
    if (songsByAlbum['The Life Of Pablo']?.length > 0) {
        console.log('  // The Life Of Pablo');
        songsByAlbum['The Life Of Pablo'].forEach(song => console.log(`  "${song}",`));
        console.log('');
    }
    
    // Ye
    if (songsByAlbum['Ye']?.length > 0) {
        console.log('  // Ye');
        songsByAlbum['Ye'].forEach(song => console.log(`  "${song}",`));
        console.log('');
    }
    
    // Donda
    if (songsByAlbum['Donda']?.length > 0) {
        console.log('  // Donda');
        songsByAlbum['Donda'].forEach(song => console.log(`  "${song}",`));
        console.log('');
    }
    
    // Other/Singles
    if (songsByAlbum.other?.length > 0) {
        console.log('  // Other/Singles');
        songsByAlbum.other.forEach(song => console.log(`  "${song}",`));
        console.log('');
    }
    
    console.log('];\n');
    
    console.log('export const kanyeAlbumMap = {');
    
    // Generate album map
    Object.entries(ALBUM_MAP).forEach(([folderName, albumCode]) => {
        if (songsByAlbum[folderName]?.length > 0) {
            console.log(`  // ${folderName} - ${albumCode}.jpg`);
            songsByAlbum[folderName].forEach(song => {
                console.log(`  "${song}": "${albumCode}",`);
            });
            console.log('');
        }
    });
    
    console.log('};');
}

scanFolder();

