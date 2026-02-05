-- Add issuer_name column to vf_transactions table
ALTER TABLE public.vf_transactions
ADD COLUMN IF NOT EXISTS issuer_name text;