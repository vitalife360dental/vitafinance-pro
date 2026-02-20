CREATE TABLE IF NOT EXISTS vf_transaction_metadata (
    transaction_id UUID PRIMARY KEY,
    invoice_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
