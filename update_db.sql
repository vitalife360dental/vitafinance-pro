-- Add missing columns to vf_transactions to match the new App logic
ALTER TABLE vf_transactions
ADD COLUMN IF NOT EXISTS patient_name TEXT;
ALTER TABLE vf_transactions
ADD COLUMN IF NOT EXISTS doctor_name TEXT;
ALTER TABLE vf_transactions
ADD COLUMN IF NOT EXISTS treatment_name TEXT;
ALTER TABLE vf_transactions
ADD COLUMN IF NOT EXISTS payment_code TEXT;
ALTER TABLE vf_transactions
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'COMPLETADO';
ALTER TABLE vf_transactions
ADD COLUMN IF NOT EXISTS method TEXT;
ALTER TABLE vf_transactions
ADD COLUMN IF NOT EXISTS balance DECIMAL(12, 2) DEFAULT 0.00;
ALTER TABLE vf_transactions
ADD COLUMN IF NOT EXISTS transaction_time TIME;
-- Optional: Create an index on payment_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_vf_transactions_payment_code ON vf_transactions(payment_code);