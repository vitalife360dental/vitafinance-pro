-- Habilitar RLS
ALTER TABLE vf_clinic_config ENABLE ROW LEVEL SECURITY;
-- Borrar políticas viejas para limpiar y evitar errores de "Policy already exists"
DROP POLICY IF EXISTS "Enable read access for all users" ON vf_clinic_config;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON vf_clinic_config;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON vf_clinic_config;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON vf_clinic_config;
-- Crear política permisiva completa para usuarios autenticados
CREATE POLICY "Enable all access for authenticated users" ON vf_clinic_config FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- Permitir lectura pública (para prevenir errores de carga)
CREATE POLICY "Enable read access for all users" ON vf_clinic_config FOR
SELECT TO public USING (true);