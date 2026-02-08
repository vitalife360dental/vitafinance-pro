-- Add invoice_number column to transactions table (Ingresos)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS invoice_number text;
-- Ensure RLS allows update (if not already)
-- We assume "Enable update for all users" policy exists from create_aranceles_table.sql-like logic
-- but let's be safe for this specific table if it wasn't covered.
-- Note: 'transactions' table might be different from 'vf_transactions'.
-- If it doesn't have RLS, enabling it might break things if no policies exist.
-- Assuming standard Supabase setup where we can add columns.