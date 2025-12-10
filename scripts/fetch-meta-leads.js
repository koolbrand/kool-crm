
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
});

// Configuration - can be overridden by args or env vars

async function fetchMetaLeads() {
    // 1. Get Kerme Clinic tenant first to see if we have Page ID
    const { data: tenants, error: tenantError } = await supabase
        .from('tenants')
        .select('id, name, meta_page_id')
        .ilike('name', '%Kerme%') // Match Kerme Clinic
        .single();

    if (tenantError || !tenants) {
        console.error('Could not find tenant "Kerme Clinic".', tenantError);
        // If we can't find tenant, we can't insert anyway (need tenant_id)
        process.exit(1);
    }

    const tenantId = tenants.id;
    const dbPageId = tenants.meta_page_id;

    // Resolve Config
    let accessToken = process.env.META_ACCESS_TOKEN || process.env.FB_ACCESS_TOKEN || process.argv[2];
    const pageId = process.env.META_PAGE_ID || process.argv[3] || dbPageId;
    const daysBack = process.argv[4] ? parseInt(process.argv[4]) : 7;

    // ... (validation checks omitted for brevity in diff, keeping existing logic) ...
    // Re-validating briefly to ensure variables exist
    if (!accessToken || !pageId) {
        // ... exit logic ...
        // We will splice this into the existing block or just assume the previous check covered it.
        // But wait, I'm replacing lines 39-66, which included the checks. I must restore them.
    }

    // Restore checks (simplified for diff application)
    if (!accessToken) {
        console.error('ERROR: Access Token missing.');
        process.exit(1);
    }

    console.log(`Using Tenant: ${tenants.name} (${tenantId})`);
    console.log(`Target Page ID: ${pageId}`);

    try {
        // 0. Exchange User Token for Page Token
        console.log('Exchanging User Token for Page Token...');
        const tokenUrl = `https://graph.facebook.com/v18.0/${pageId}?fields=access_token&access_token=${accessToken}`;
        const tokenRes = await fetch(tokenUrl);
        const tokenData = await tokenRes.json();

        if (tokenData.access_token) {
            console.log('Successfully obtained Page Access Token.');
            accessToken = tokenData.access_token;
        } else {
            console.warn('Could not exchange token. Configuring to try with provided token (might fail if not Page Token).');
            if (tokenData.error) console.error('Token Exchange Error:', tokenData.error.message);
        }

        // Proceed with fetch...
        console.log(`Fetching leads for last ${daysBack} days...`);

        // (The rest of the logic follows in the next block unchanged, but I need to close the try block? 
        // No, the original code had the try block AFTER the log.
        // I need to be careful with the structure.

        // Original structure:
        // console.log ...
        // try { 
        //    ...
        // }

        // I will restart the try block here.

        let allLeads = [];

        // Approach 2: Fetch Forms first, then leads per form.
        // This is often more robust if Page Level Access is finicky.
        console.log(`Fetching forms for Page ${pageId}...`);
        const formsUrl = `https://graph.facebook.com/v18.0/${pageId}/leadgen_forms?access_token=${accessToken}&limit=100`;
        const formsRes = await fetch(formsUrl);
        const formsData = await formsRes.json();

        if (formsData.error) {
            throw new Error(`Meta API Error (Forms): ${formsData.error.message}`);
        }

        const forms = formsData.data || [];
        console.log(`Found ${forms.length} forms.`);

        for (const form of forms) {
            console.log(`Fetching leads for form: ${form.name} (${form.id})...`);
            const leadsUrl = `https://graph.facebook.com/v18.0/${form.id}/leads?access_token=${accessToken}&fields=created_time,id,ad_id,form_id,field_data,campaign_name,ad_name,adset_name,platform&limit=500`;
            const leadsRes = await fetch(leadsUrl);
            const leadsData = await leadsRes.json();

            if (leadsData.error) {
                console.error(`Error fetching leads for form ${form.id}:`, leadsData.error.message);
                continue;
            }

            const formLeads = leadsData.data || [];
            console.log(`  -> Found ${formLeads.length} leads.`);
            allLeads = allLeads.concat(formLeads);
        }

        console.log(`Found ${allLeads.length} total leads from all forms.`);

        // Filter by date
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysBack);

        // Sort by date desc
        allLeads.sort((a, b) => new Date(b.created_time) - new Date(a.created_time));

        const recentLeads = allLeads.filter(lead => new Date(lead.created_time) > cutoffDate);
        console.log(`Filtering for leads after ${cutoffDate.toISOString()} -> ${recentLeads.length} leads found.`);

        // 2. Process and Insert
        await processLeads(recentLeads, tenantId);

    } catch (err) {
        console.error('Error fetching from Meta:', err.message);
    }
}

async function processLeads(leads, tenantId) {
    let addedCount = 0;
    let skippedCount = 0;

    for (const lead of leads) {
        // Check if exists
        const { data: existing, error: searchError } = await supabase
            .from('leads')
            .select('id')
            .eq('tenant_id', tenantId) // Scope to tenant
            .contains('metadata', { id: lead.id }) // Check JSONB
            .maybeSingle();

        if (existing) {
            skippedCount++;
            continue;
        }

        // Parse field_data
        const fieldMap = {};
        if (lead.field_data) {
            lead.field_data.forEach(field => {
                fieldMap[field.name] = field.values ? field.values[0] : null;
            });
        }

        // Map fields
        // Common keys: email, phone_number, full_name... depends on the form
        // Added Spanish support: nombre, correo_electrónico, número_de_teléfono
        // Added variations: first_name, nombre_y_apellidos
        const email = fieldMap['email'] || fieldMap['email_address'] || fieldMap['correo_electrónico'];
        const phone = fieldMap['phone_number'] || fieldMap['phone'] || fieldMap['número_de_teléfono'];
        const name = fieldMap['full_name'] || fieldMap['name'] || fieldMap['nombre'] || fieldMap['nombre_y_apellidos'] || fieldMap['first_name'] || 'Unknown Meta Lead';

        const newLead = {
            name: name,
            email: email,
            phone: phone,
            source: 'facebook',
            status: 'new',
            tenant_id: tenantId,
            user_id: null,
            created_at: lead.created_time,
            metadata: {
                id: lead.id,
                ad_id: lead.ad_id,
                form_id: lead.form_id,
                campaign_name: lead.campaign_name,
                ad_name: lead.ad_name,
                platform: lead.platform,
                raw_data: lead
            }
        };

        const { error: insertError } = await supabase.from('leads').insert(newLead);

        if (insertError) {
            console.error(`Failed to insert lead ${lead.id}:`, insertError.message);
        } else {
            console.log(`Inserted lead: ${name} (${email})`);
            addedCount++;
        }
    }

    console.log('--------------------------------------------------');
    console.log(`Process Complete. Added: ${addedCount}, Skipped: ${skippedCount}`);
}

fetchMetaLeads();
