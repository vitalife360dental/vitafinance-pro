
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) process.env[k] = envConfig[k];

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    console.log('Checking "vf_transactions"...');
    const { data, error } = await supabase.from('vf_transactions').select('*').limit(1);

    if (error) {
        console.error('❌ Error reading vf_transactions:', error.message);
        console.log('This confirms why the app shows nothing: The local table is missing/broken, stopping the External fetch.');
    } else {
        console.log('✅ vf_transactions exists. Rows:', data.length);
    }
}

check();
