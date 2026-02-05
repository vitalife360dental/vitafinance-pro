
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

async function testConnection() {
    console.log('Testing connection to actas...');

    // 1. Try different casings
    console.log('Trying "actas"...');
    var { data, error } = await supabase.from('actas').select('*').limit(1);
    if (error) console.log('Error "actas":', error.message);
    else console.log('Success "actas":', data.length);

    console.log('Trying "Actas"...');
    var { data, error } = await supabase.from('Actas').select('*').limit(1);
    if (error) console.log('Error "Actas":', error.message);
    else console.log('Success "Actas":', data.length);

    console.log('Trying "public.actas" (RPC)...'); // Sometimes helpful check


    if (allError) {
        console.error('CRITICAL ERROR reading actas:', allError);
        return;
    }

    if (!allData || allData.length === 0) {
        console.log('WARNING: Connection successful, but table appears EMPTY to this user (RLS issue?).');
    } else {
        console.log('SUCCESS: Found rows:', allData);
        console.log('Sample Row Keys:', Object.keys(allData[0]));
        console.log('Sample Type:', allData[0].tipo);
    }

    // 2. Try the specific filter
    const { data: filteredData, error: filterError } = await supabase
        .from('actas')
        .select('*')
        .eq('tipo', 'Ingreso')
        .limit(3);

    console.log('Filtered (tipo=Ingreso) count:', filteredData?.length || 0);
}

testConnection();
