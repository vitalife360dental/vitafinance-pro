
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    console.log('Checking columns in vf_transactions...');

    // We can't query information_schema easily with anon key usually, 
    // but we can try to insert a dummy row with the field and see if it fails,
    // OR just fetch one row and assume if we select it specifically it works? 
    // Actually, select('issuer_name') will error if column doesn't exist.

    const { data, error } = await supabase
        .from('vf_transactions')
        .select('issuer_name')
        .limit(1);

    if (error) {
        console.error('❌ Error selecting issuer_name:', error.message);
        if (error.message.includes('does not exist')) {
            console.log('CONCLUSION: The column "issuer_name" does not exist.');
        }
    } else {
        console.log('✅ Column issuer_name exists!');
        console.log('Sample data:', data);
    }
}

checkColumns();
