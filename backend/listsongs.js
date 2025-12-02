
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ggkanqgcvvxtpdhzmoon.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
const supabase = createClient(supabaseUrl, supabaseKey);

async function scan() {
    console.log("Scanning 'songs' bucket...\n");

    // 1. Scan root
    let root = await supabase.storage.from("songs").list("", { limit: 2000 });
    console.log("ROOT CONTENTS:", root.data);

    // 2. Scan subfolders (if any)
    if (root.data) {
        for (let item of root.data) {
            // Folders have item.metadata === null
            if (item.metadata === null) {
                console.log(`\n--- Found folder: ${item.name} ---`);
                const sub = await supabase.storage.from("songs").list(item.name, { limit: 2000 });
                console.log(sub.data);
            }
        }
    }
}

scan();
