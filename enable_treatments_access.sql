-- Enable access to DentalFlow 'treatments' table
-- Run this in your Supabase SQL Editor to allow VitaFinance to read the master price list
-- 1. Grant usage on public schema
GRANT USAGE ON SCHEMA public TO anon,
    authenticated;
-- 2. Grant SELECT on the specific table 'treatments'
GRANT SELECT ON TABLE public.treatments TO anon,
    authenticated;
-- 3. Create RLS Policy to explicitly allow reading
-- This is crucial if RLS is enabled on the table
DO $$ BEGIN IF EXISTS (
    SELECT
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'treatments'
) THEN EXECUTE 'CREATE POLICY "Allow read access for all" ON public.treatments FOR SELECT USING (true)';
END IF;
EXCEPTION
WHEN duplicate_object THEN NULL;
-- Policy likely already exists
END $$;