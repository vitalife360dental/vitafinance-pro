import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
    console.log('Testing insert with issuer_ruc...');
    const payload = {
        amount: 1,
        description: 'Test Debug RUC',
        date: new Date().toISOString(),
        type: 'expense',
        issuer_name: 'Test Issuer',
        issuer_ruc: '1234567890001'
    };

    const { data, error } = await supabase
        .from('vf_transactions')
        .insert(payload)
        .select()
        .single();

    if (error) {
        console.error('Insert failed:', error.message);
    } else {
        console.log('Insert success!', data);
        // Clean up
        if (data && data.id) {
            await supabase.from('vf_transactions').delete().eq('id', data.id);
        }
    }
}

testInsert();
