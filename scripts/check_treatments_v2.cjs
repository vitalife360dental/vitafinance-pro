
const { createClient } = require('@supabase/supabase-js');

// Helper to run
const run = async () => {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_ANON_KEY;
    const supabase = createClient(url, key);

    // Candidates based on "vf_" pattern and screenshot
    const candidates = [
        'vf_treatments',
        'vf_tratamientos',
        'vf_services',
        'vf_servicios',
        'vf_catalog',
        'vf_catalogo',
        'vf_products',
        'vf_items',
        'treatments', // Retry just in case
        'services',
        'catalog'
    ];

    console.log('🔍 Checking for tables with vf_ prefix...');

    for (const table of candidates) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });

        if (error) {
            // console.log(`   ${table}: ${error.code}`); 
        } else {
            console.log(`✅ FOUND: ${table}! Count: ${count}`);
            const { data } = await supabase.from(table).select('*').limit(1);
            if (data && data.length > 0) console.log('   Sample:', data[0]);
        }
    }
}

run();
