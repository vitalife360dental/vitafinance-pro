
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPermissions() {
    console.log('Testing vf_transactions permissions...');

    // 1. Try to INSERT a dummy record
    const dummy = {
        amount: 1,
        description: 'DELETE_TEST_' + Date.now(),
        date: new Date().toISOString(),
        type: 'income',
        status: 'TEST'
    };

    const { data: inserted, error: insertError } = await supabase
        .from('vf_transactions')
        .insert(dummy)
        .select()
        .single();

    if (insertError) {
        console.error('❌ INSERT failed:', insertError.message);
        return;
    }

    console.log('✅ INSERT success. ID:', inserted.id);

    // 2. Try to DELETE the record
    const { error: deleteError } = await supabase
        .from('vf_transactions')
        .delete()
        .eq('id', inserted.id);

    if (deleteError) {
        console.error('❌ DELETE failed:', deleteError.message);
    } else {
        console.log('✅ DELETE success');
    }
}

testPermissions();
