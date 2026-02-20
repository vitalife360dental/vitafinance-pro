-- Creación de la tabla puente para datos meta de transacciones externas 
-- Esto mantiene la base de datos de DentalFlow completamente limpia
CREATE TABLE IF NOT EXISTS public.vf_transaction_metadata (
    transaction_id UUID PRIMARY KEY,
    invoice_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- Habilitar RLS (Seguridad a Nivel de Filas) para la tabla de metadata
ALTER TABLE public.vf_transaction_metadata ENABLE ROW LEVEL SECURITY;
-- Política para permitir acceso global (para coincidir con el permiso general de transacciones locales)
DROP POLICY IF EXISTS "Enable all access for all users" ON public.vf_transaction_metadata;
CREATE POLICY "Enable all access for all users" ON public.vf_transaction_metadata FOR ALL USING (true) WITH CHECK (true);