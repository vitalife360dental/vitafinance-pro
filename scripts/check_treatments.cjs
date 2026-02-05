
const { createClient } = require('@supabase/supabase-js');
// dotenv removed to run with shell env vars

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    console.error('URL:', supabaseUrl);
    console.error('Key:', supabaseKey ? 'Found' : 'Missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const candidates = [
    'tratamientos',
    'Tratamientos',
    'services',
    'servicios',
    'procedimientos',
    'items',
    'products',
    'dental_services',
    'dental_treatments'
];

async function checkTables() {
    console.log('🔍 Checking tables in Supabase...');

    for (const table of candidates) {
        // Check count and data
        const { count, error: countError } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (countError) {
            if (countError.code === '42P01') {
                // Table doesn't exist
            } else {
                console.log(`⚠️ ${table}: Exists but access denied or error? ${countError.message} (${countError.code})`);
            }
        } else {
            console.log(`✅ ${table}: FOUND! Row count: ${count}`);

            // Try to fetch one row
            const { data, error: dataError } = await supabase
                .from(table)
                .select('*')
                .limit(1);

            if (dataError) {
                console.log(`   Detailed read failed: ${dataError.message}`);
            } else if (data && data.length > 0) {
                console.log(`   Sample Data keys: ${Object.keys(data[0]).join(', ')}`);
                // console.log(`   Sample Row:`, JSON.stringify(data[0]));
            } else {
                console.log(`   Table is empty.`);
            }
        }
    }
}

checkTables();
