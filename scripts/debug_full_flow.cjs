
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFullFlow() {
    console.log('🔄 Starting Full CRUD Flow Test on `vf_transactions`...');

    // 1. CREATE
    const newTx = {
        amount: 50.00,
        description: 'FLOW_TEST_' + Date.now(),
        date: new Date().toISOString(),
        type: 'income',
        status: 'PAGADO',
        method: 'Efectivo',
        source: 'VitaFinance' // Explicitly set source if needed by RLS?
    };

    const { data: created, error: createError } = await supabase
        .from('vf_transactions')
        .insert(newTx)
        .select()
        .single();

    if (createError) {
        console.error('❌ CREATE failed:', createError.message);
        return;
    }
    console.log('✅ CREATE success. ID:', created.id);

    // 2. READ
    const { data: read, error: readError } = await supabase
        .from('vf_transactions')
        .select('*')
        .eq('id', created.id)
        .single();

    if (readError || !read) {
        console.error('❌ READ failed:', readError ? readError.message : 'No data found');
        return;
    }
    console.log('✅ READ success:', read.description);

    // 3. UPDATE
    const { data: updated, error: updateError } = await supabase
        .from('vf_transactions')
        .update({ amount: 75.00 })
        .eq('id', created.id)
        .select()
        .single();

    if (updateError) {
        console.error('❌ UPDATE failed:', updateError.message);
        return;
    }
    console.log('✅ UPDATE success. New Amount:', updated.amount);

    // 4. DELETE
    const { error: deleteError } = await supabase
        .from('vf_transactions')
        .delete()
        .eq('id', created.id);

    if (deleteError) {
        console.error('❌ DELETE failed:', deleteError.message);
        return;
    }
    console.log('✅ DELETE success');
}

testFullFlow();
