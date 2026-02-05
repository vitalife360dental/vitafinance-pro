-- 🚨 IMPORTANTE: Ejecuta esto en el Editor SQL de Supabase para desbloquear la tabla
-- 1. Dar permiso público de lectura a la tabla 'actas'
GRANT SELECT ON TABLE "public"."actas" TO anon;
GRANT SELECT ON TABLE "public"."actas" TO authenticated;
-- 2. Asegurar que las políticas no bloqueen todo (Policy permisiva de lectura)
create policy "Permitir lectura publica de actas" on "public"."actas" as permissive for
select to public using (true);
-- 3. Verificar que funcione (debería devolver filas)
SELECT *
FROM "public"."actas"
LIMIT 5;