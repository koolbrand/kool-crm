
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupTestLeads() {
    console.log('Cleaning up Meta Test Leads...');

    // Pattern used by Meta Test Tool
    const pattern = '<test lead: dummy data';

    const { data, count, error } = await supabase
        .from('leads')
        .delete({ count: 'exact' })
        .ilike('name', `%${pattern}%`);

    if (error) {
        console.error('Error deleting:', error.message);
    } else {
        console.log(`Deleted ${count} test leads.`);
    }

    // Also delete "Agent Probe" if it's junk
    const { count: count2 } = await supabase
        .from('leads')
        .delete({ count: 'exact' })
        .eq('name', 'Agent Probe');

    console.log(`Deleted ${count2} Agent Probe leads.`);
}

cleanupTestLeads();
