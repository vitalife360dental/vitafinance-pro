-- Add missing mirror columns if they don't exist
ALTER TABLE vf_transactions
ADD COLUMN IF NOT EXISTS doctor_name text,
    ADD COLUMN IF NOT EXISTS patient_name text,
    ADD COLUMN IF NOT EXISTS treatment_name text;