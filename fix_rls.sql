-- Enable RLS (it might be on by default, but good to be explicit or check)
ALTER TABLE vf_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vf_categories ENABLE ROW LEVEL SECURITY;
-- Allow anonymous access (public) for now since we haven't implemented full Auth UI yet
-- CHANGE THIS later if you add login!
CREATE POLICY "Allow public access for transactions" ON vf_transactions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for categories" ON vf_categories FOR ALL TO anon USING (true) WITH CHECK (true);
-- Also allow authenticated access just in case
CREATE POLICY "Allow authenticated access for transactions" ON vf_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access for categories" ON vf_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);