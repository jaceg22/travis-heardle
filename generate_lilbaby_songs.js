// Script to generate Lil Baby song list from R2 bucket
// Uses S3-compatible API to list files in the lil-baby bucket

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = '3230dc586d2407bab9926c0e72abbe7b';
const R2_ACCESS_KEY_ID = '6715d84d4bc596b85888bd13a7a2d593';
const R2_SECRET_ACCESS_KEY = '300d1ca7e54e7d0408468a0d532e6cc949041aa823bffe521d1920673b4715c0';
const BUCKET_NAME = 'lil-baby';

// R2 S3-compatible endpoint
const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

const s3Client = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

// Album folder mapping
const ALBUM_MAP = {
    'lilbaby': 'lilbaby',
    'myturn': 'myturn',
    'toohard': 'toohard',
    'harderthanever': 'harderthanever',
    'dripharder': 'dripharder',
    'itsonlyme': 'itsonlyme',
    'other': 'lilbaby' // Singles use lilbaby.jpg as default
};

async function listFilesInFolder(prefix = '') {
    try {
        const command = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: prefix,
            Delimiter: '/',
        });
        
        const response = await s3Client.send(command);
        return response;
    } catch (error) {
        console.error(`Error listing ${prefix}:`, error.message);
        return null;
    }
}

async function getAllFiles() {
    console.log('Scanning Lil Baby R2 bucket...\n');
    
    const songsByAlbum = {};
    Object.keys(ALBUM_MAP).forEach(album => {
        songsByAlbum[album] = [];
    });
    
    // List root files (singles/other)
    console.log('Scanning root folder...');
    const rootResponse = await listFilesInFolder('');
    
    if (rootResponse && rootResponse.Contents) {
        rootResponse.Contents.forEach(item => {
            if (item.Key.endsWith('.mp3') && !item.Key.includes('/')) {
                const songName = item.Key.replace(/\.mp3$/i, '');
                songsByAlbum.other.push(songName);
                console.log(`  Found: ${songName}`);
            }
        });
    }
    
    // List files in each album folder
    for (const [albumKey, folderName] of Object.entries(ALBUM_MAP)) {
        if (albumKey === 'other') continue; // Already handled
        
        console.log(`\nScanning ${folderName} folder...`);
        const folderResponse = await listFilesInFolder(`${folderName}/`);
        
        if (folderResponse && folderResponse.Contents) {
            folderResponse.Contents.forEach(item => {
                if (item.Key.endsWith('.mp3')) {
                    // Remove folder prefix and .mp3 extension
                    const songName = item.Key.replace(`${folderName}/`, '').replace(/\.mp3$/i, '');
                    songsByAlbum[albumKey].push(songName);
                    console.log(`  Found: ${songName}`);
                }
            });
        }
    }
    
    // Generate the song list code
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('GENERATED SONG LIST:');
    console.log('═══════════════════════════════════════════════════════\n');
    
    let allSongs = [];
    let albumMap = {};
    
    // Harder Than Ever
    if (songsByAlbum.harderthanever.length > 0) {
        console.log('// Harder Than Ever');
        songsByAlbum.harderthanever.forEach(song => {
            console.log(`  "${song}",`);
            allSongs.push(song);
            albumMap[song] = 'harderthanever';
        });
        console.log('');
    }
    
    // Drip Harder
    if (songsByAlbum.dripharder.length > 0) {
        console.log('  // Drip Harder');
        songsByAlbum.dripharder.forEach(song => {
            console.log(`  "${song}",`);
            allSongs.push(song);
            albumMap[song] = 'dripharder';
        });
        console.log('');
    }
    
    // My Turn
    if (songsByAlbum.myturn.length > 0) {
        console.log('  // My Turn');
        songsByAlbum.myturn.forEach(song => {
            console.log(`  "${song}",`);
            allSongs.push(song);
            albumMap[song] = 'myturn';
        });
        console.log('');
    }
    
    // Too Hard
    if (songsByAlbum.toohard.length > 0) {
        console.log('  // Too Hard');
        songsByAlbum.toohard.forEach(song => {
            console.log(`  "${song}",`);
            allSongs.push(song);
            albumMap[song] = 'toohard';
        });
        console.log('');
    }
    
    // It's Only Me
    if (songsByAlbum.itsonlyme.length > 0) {
        console.log('  // It\'s Only Me');
        songsByAlbum.itsonlyme.forEach(song => {
            console.log(`  "${song}",`);
            allSongs.push(song);
            albumMap[song] = 'itsonlyme';
        });
        console.log('');
    }
    
    // Lil Baby
    if (songsByAlbum.lilbaby.length > 0) {
        console.log('  // Lil Baby');
        songsByAlbum.lilbaby.forEach(song => {
            console.log(`  "${song}",`);
            allSongs.push(song);
            albumMap[song] = 'lilbaby';
        });
        console.log('');
    }
    
    // Other/Singles
    if (songsByAlbum.other.length > 0) {
        console.log('  // Other/Singles');
        songsByAlbum.other.forEach(song => {
            console.log(`  "${song}",`);
            allSongs.push(song);
            albumMap[song] = 'lilbaby'; // Default to lilbaby.jpg for singles
        });
        console.log('');
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('ALBUM MAPPING:');
    console.log('═══════════════════════════════════════════════════════\n');
    
    Object.entries(albumMap).forEach(([song, album]) => {
        console.log(`  "${song}": "${album}",`);
    });
    
    console.log(`\nTotal songs: ${allSongs.length}`);
}

getAllFiles().catch(console.error);

