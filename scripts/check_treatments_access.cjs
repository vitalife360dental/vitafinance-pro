
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) process.env[k] = envConfig[k];

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkTreatments() {
    console.log('Checking "treatments" table...');
    const { data, error } = await supabase.from('treatments').select('*').limit(3);

    if (error) {
        console.error('❌ Error reading treatments:', error.message);
        if (error.code === '42P01') console.log('Hint: Table might need permissions granted (GRANT SELECT...).');
    } else {
        console.log('✅ treatments table accessible. Count:', data.length);
        if (data.length > 0) {
            console.log('Sample keys:', Object.keys(data[0]));
            console.log('Sample row:', data[0]);
        }
    }
}

checkTreatments();
