-- Add invoice_number column to vf_transactions table (Expenses/Local Transactions)
ALTER TABLE vf_transactions
ADD COLUMN IF NOT EXISTS invoice_number text;