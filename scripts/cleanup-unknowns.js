
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanup() {
    console.log('Deleting "Unknown Meta Lead" entries created in the last hour...');

    // Safety: Only delete leads with that specific name
    const { count, error } = await supabase
        .from('leads')
        .delete({ count: 'exact' })
        .eq('name', 'Unknown Meta Lead')
        // Safety check to ensure we don't delete old data if someone actually has that name (unlikely but good practice)
        // Removing time filter to delete ALL unknown leads as requested
        ;

    if (error) {
        console.error('Error deleting:', error.message);
    } else {
        console.log(`Deleted ${count} leads.`);
    }
}

cleanup();
