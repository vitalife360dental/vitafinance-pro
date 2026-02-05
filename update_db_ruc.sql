-- Add issuer_ruc column to vf_transactions
ALTER TABLE vf_transactions
ADD COLUMN IF NOT EXISTS issuer_ruc TEXT;