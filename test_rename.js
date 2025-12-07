import fs from 'fs';
import path from 'path';

const LILBABY_FOLDER = '/Users/jacegandhi/Desktop/Lil Baby';

console.log('Testing script...');
console.log('Folder exists:', fs.existsSync(LILBABY_FOLDER));

if (fs.existsSync(LILBABY_FOLDER)) {
    const folders = fs.readdirSync(LILBABY_FOLDER);
    console.log('Folders found:', folders);
    
    if (folders.length > 0) {
        const firstFolder = path.join(LILBABY_FOLDER, folders[0]);
        const files = fs.readdirSync(firstFolder);
        console.log(`Files in ${folders[0]}:`, files.slice(0, 3));
    }
}

console.log('Test complete');

