-- Enable access to DentalFlow 'transactions' table (Income)
-- Run this in your Supabase SQL Editor to allow VitaFinance to read the income history
-- 1. Grant usage on public schema (typically standard, but good to ensure)
GRANT USAGE ON SCHEMA public TO anon,
    authenticated;
-- 2. Grant SELECT on the specific table 'transactions'
GRANT SELECT ON TABLE public.transactions TO anon,
    authenticated;
-- 3. Create RLS Policy to explicitly allow reading
DO $$ BEGIN IF EXISTS (
    SELECT
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'transactions'
) THEN EXECUTE 'CREATE POLICY "Allow read access for all" ON public.transactions FOR SELECT USING (true)';
END IF;
EXCEPTION
WHEN duplicate_object THEN NULL;
-- Policy likely already exists
END $$;