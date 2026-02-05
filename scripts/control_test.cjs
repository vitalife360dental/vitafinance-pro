
const { createClient } = require('@supabase/supabase-js');

// Helper to run
const run = async () => {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_ANON_KEY;
    const supabase = createClient(url, key);

    console.log('Testing connection to vf_transactions...');
    const { data, error } = await supabase.from('vf_transactions').select('*').limit(1);

    if (error) {
        console.error('❌ vf_transactions failed:', error.message, error.code);
    } else {
        console.log('✅ vf_transactions worked! count:', data.length);
        if (data.length > 0) console.log('Sample:', data[0]);
    }

    console.log('Testing connection to tratamientos...');
    const { data: tData, error: tError } = await supabase.from('tratamientos').select('*').limit(1);
    if (tError) {
        console.error('❌ tratamientos failed:', tError.message, tError.code);
    } else {
        console.log('✅ tratamientos worked! count:', tData.length);
    }
}

run();
