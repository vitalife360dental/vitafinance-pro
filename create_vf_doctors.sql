-- Upgrade vf_doctors table to support per-category commission rates
-- This adds a 'category' column to the existing vf_doctors table
-- Run this ONCE in Supabase SQL Editor
-- Add category column if it doesn't exist
ALTER TABLE vf_doctors
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT '_default';
-- Drop old unique constraint if it exists (name-only)
ALTER TABLE vf_doctors DROP CONSTRAINT IF EXISTS vf_doctors_name_key;
-- Add new unique constraint for name + category combo
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'vf_doctors_name_category_key'
) THEN
ALTER TABLE vf_doctors
ADD CONSTRAINT vf_doctors_name_category_key UNIQUE (name, category);
END IF;
END $$;
-- Example usage:
-- Doctor de planta (default 33% for everything)
-- INSERT INTO vf_doctors (name, category, commission_rate) VALUES ('Dr. Alirio Rodríguez', '_default', 33);
-- Specialist overrides by category
-- INSERT INTO vf_doctors (name, category, commission_rate) VALUES ('Dr. Alirio Rodríguez', 'Ortodoncia', 50);
-- INSERT INTO vf_doctors (name, category, commission_rate) VALUES ('Dr. Alirio Rodríguez', 'Rehabilitación Oral', 40);