import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const demiFolder = path.join(__dirname, 'demi');

// Get all songs from folders
const songsByAlbum = {};

const folders = fs.readdirSync(demiFolder, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

folders.forEach(folder => {
  const folderPath = path.join(demiFolder, folder);
  const files = fs.readdirSync(folderPath)
    .filter(file => file.endsWith('.mp3'))
    .map(file => file.replace(/\.mp3$/i, ''));
  
  songsByAlbum[folder] = files.sort();
});

// Print songs by album
console.log('Songs by Album (from folders):\n');
Object.keys(songsByAlbum).sort().forEach(album => {
  console.log(`// ${album}`);
  songsByAlbum[album].forEach(song => {
    console.log(`  "${song}",`);
  });
  console.log('');
});

// Generate total count
const totalSongs = Object.values(songsByAlbum).flat().length;
console.log(`\nTotal songs: ${totalSongs}\n`);

// Generate album mapping
console.log('Album Mapping:\n');
Object.keys(songsByAlbum).sort().forEach(album => {
  songsByAlbum[album].forEach(song => {
    console.log(`  "${song}": "${album}",`);
  });
});

