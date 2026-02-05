-- Add missing columns for Invoice and Payment Method
ALTER TABLE vf_transactions
ADD COLUMN IF NOT EXISTS invoice TEXT;
ALTER TABLE vf_transactions
ADD COLUMN IF NOT EXISTS method TEXT;