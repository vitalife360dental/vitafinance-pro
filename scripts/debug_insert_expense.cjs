const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugInsert() {
    console.log('🐞 Attempting to insert a test expense into vf_transactions...');

    const testPayload = {
        amount: 10.50,
        description: 'Test Expense Debug Script',
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        category_id: null, // Assuming nullable, or we might need a valid ID
        method: 'Efectivo',
        issuer_name: 'Debug Issuer S.A.',
        issuer_ruc: '1234567890001'
    };

    console.log('📋 Payload:', testPayload);

    const { data, error } = await supabase
        .from('vf_transactions')
        .insert(testPayload)
        .select()
        .single();

    if (error) {
        console.error('❌ Insert FAILED:', error);
        console.error('   Code:', error.code);
        console.error('   Message:', error.message);
        console.error('   Details:', error.details);
        console.error('   Hint:', error.hint);
    } else {
        console.log('✅ Insert SUCCESS!');
        console.log('   New ID:', data.id);

        // Cleanup
        console.log('🧹 Cleaning up test record...');
        await supabase.from('vf_transactions').delete().eq('id', data.id);
    }
}

debugInsert();
