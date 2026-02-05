
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Manually load .env because dotenv default path might be tricky in scripts
const envPath = path.resolve(__dirname, '../.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

for (const k in envConfig) {
    process.env[k] = envConfig[k]
}

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function inspect() {
    console.log('Inspecting "transactions" table...');

    // Get one row to see structure
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Sample Row Keys:', Object.keys(data[0]));
        console.log('Sample Row:', data[0]);
    } else {
        console.log('Table found but empty.');
    }
}

inspect();
