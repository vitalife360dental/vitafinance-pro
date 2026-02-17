-- Migration to fix RLS policy for vf_clinic_config
-- The error 42501 indicates that the current user cannot insert/update rows.
-- 1. Enable RLS on the table (just in case)
ALTER TABLE vf_clinic_config ENABLE ROW LEVEL SECURITY;
-- 2. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON vf_clinic_config;
DROP POLICY IF EXISTS "Allow select for authenticated users" ON vf_clinic_config;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON vf_clinic_config;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON vf_clinic_config;
-- 3. Create a permissive policy for authenticated users
-- Since this is a simple app configuration, we allow authenticated users to do everything.
CREATE POLICY "Enable all access for authenticated users" ON vf_clinic_config FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- 4. Verify table permissions (grant access to authenticated role)
GRANT ALL ON vf_clinic_config TO authenticated;