-- Add source column to distinguish between Local (VitaFinance) and External (DentalFlow)
ALTER TABLE vf_transactions
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'VitaFinance';
-- Update existing records to have the default value
UPDATE vf_transactions
SET source = 'VitaFinance'
WHERE source IS NULL;
-- Add index for performance on source filtering
CREATE INDEX IF NOT EXISTS idx_vf_transactions_source ON vf_transactions(source);