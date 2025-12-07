import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || "https://ggkanqgcvvxtpdhzmoon.supabase.co";
// Try to get key from environment or use a placeholder
// You can also edit this file directly and replace YOUR_KEY_HERE with your actual key
const SUPABASE_KEY = process.env.SUPABASE_KEY || "YOUR_KEY_HERE";

if (SUPABASE_KEY === "YOUR_KEY_HERE" || SUPABASE_KEY === "YOUR_SUPABASE_ANON_KEY_HERE") {
    console.error("❌ Please set SUPABASE_KEY environment variable or edit this file");
    console.log("\nUsage:");
    console.log("  SUPABASE_KEY=your_anon_key node check_bucket_sizes.js");
    console.log("\nOr edit this file and replace YOUR_KEY_HERE with your Supabase anon key");
    console.log("\nTo get your key:");
    console.log("  1. Go to Supabase Dashboard");
    console.log("  2. Settings → API");
    console.log("  3. Copy the 'anon public' key");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Buckets to check
const buckets = [
    'songs',      // Travis Scott
    'Drake',
    'Lil Tecca',
    'BBBM',
    'album'       // Album covers
];

// Helper function to recursively get all files in a bucket
async function getAllFiles(bucketName, path = '') {
    try {
        const { data, error } = await supabase.storage.from(bucketName).list(path, {
            limit: 1000,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' }
        });

        if (error) {
            console.error(`Error listing ${bucketName}${path ? '/' + path : ''}:`, error.message);
            return [];
        }

        if (!data) return [];

        const files = [];
        
        for (const item of data) {
            const fullPath = path ? `${path}/${item.name}` : item.name;
            
            if (item.metadata) {
                // It's a file
                files.push({
                    name: item.name,
                    path: fullPath,
                    size: item.metadata.size || 0,
                    updated: item.updated_at
                });
            } else {
                // It's a folder, recurse
                const subFiles = await getAllFiles(bucketName, fullPath);
                files.push(...subFiles);
            }
        }

        return files;
    } catch (err) {
        console.error(`Error processing ${bucketName}${path ? '/' + path : ''}:`, err.message);
        return [];
    }
}

// Helper function to format bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Main function
async function checkBucketSizes() {
    console.log('🔍 Checking Supabase Storage Bucket Sizes...\n');
    console.log(`URL: ${SUPABASE_URL}\n`);

    const results = [];

    for (const bucketName of buckets) {
        console.log(`📦 Checking bucket: ${bucketName}...`);
        
        try {
            // Check if bucket exists
            const { data: buckets, error: listError } = await supabase.storage.listBuckets();
            
            if (listError) {
                console.error(`  ❌ Error accessing buckets: ${listError.message}`);
                results.push({
                    bucket: bucketName,
                    exists: false,
                    error: listError.message
                });
                continue;
            }

            const bucketExists = buckets.some(b => b.name === bucketName);
            
            if (!bucketExists) {
                console.log(`  ⚠️  Bucket "${bucketName}" does not exist`);
                results.push({
                    bucket: bucketName,
                    exists: false,
                    fileCount: 0,
                    totalSize: 0
                });
                continue;
            }

            // Get all files
            const files = await getAllFiles(bucketName);
            
            const totalSize = files.reduce((sum, file) => sum + file.size, 0);
            const fileCount = files.length;

            console.log(`  ✅ Found ${fileCount} files`);
            console.log(`  📊 Total size: ${formatBytes(totalSize)}`);
            
            results.push({
                bucket: bucketName,
                exists: true,
                fileCount: fileCount,
                totalSize: totalSize,
                formattedSize: formatBytes(totalSize)
            });

        } catch (error) {
            console.error(`  ❌ Error checking ${bucketName}:`, error.message);
            results.push({
                bucket: bucketName,
                exists: false,
                error: error.message
            });
        }
        
        console.log('');
    }

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 SUMMARY');
    console.log('═══════════════════════════════════════════════════════\n');
    
    let grandTotal = 0;
    let totalFiles = 0;

    results.forEach(result => {
        if (result.exists) {
            console.log(`${result.bucket.padEnd(15)} | ${String(result.fileCount).padStart(6)} files | ${result.formattedSize.padStart(12)}`);
            grandTotal += result.totalSize;
            totalFiles += result.fileCount;
        } else {
            console.log(`${result.bucket.padEnd(15)} | ${'N/A'.padStart(6)} | ${'Not found'.padStart(12)}`);
        }
    });

    console.log('───────────────────────────────────────────────────────');
    console.log(`${'TOTAL'.padEnd(15)} | ${String(totalFiles).padStart(6)} files | ${formatBytes(grandTotal).padStart(12)}`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Detailed breakdown
    console.log('📋 DETAILED BREAKDOWN:\n');
    results.forEach(result => {
        if (result.exists && result.fileCount > 0) {
            const avgSize = result.totalSize / result.fileCount;
            console.log(`${result.bucket}:`);
            console.log(`  - Files: ${result.fileCount}`);
            console.log(`  - Total: ${result.formattedSize}`);
            console.log(`  - Average: ${formatBytes(avgSize)} per file`);
            console.log('');
        }
    });
}

// Run the check
checkBucketSizes().catch(console.error);

