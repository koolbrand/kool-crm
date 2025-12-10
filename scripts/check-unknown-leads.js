
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data: leads } = await supabase
        .from('leads')
        .select('id, metadata')
        .eq('name', 'Unknown Meta Lead')
        .order('created_at', { ascending: false })
        .limit(5);

    if (!leads || leads.length === 0) {
        console.log('No unknown leads found.');
        return;
    }

    console.log('Inspecting ' + leads.length + ' unknown leads:');
    leads.forEach(lead => {
        console.log(`Lead ID: ${lead.id}`);
        // Log field names found in metadata
        if (lead.metadata && lead.metadata.raw_data && lead.metadata.raw_data.field_data) {
            console.log('Fields:', lead.metadata.raw_data.field_data.map(f => f.name));
        } else {
            console.log('No field_data in metadata');
        }
        console.log('---');
    });
}

check();
