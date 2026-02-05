-- Vamos a buscar la tabla "perdida" usando una búsqueda flexible
-- Esto nos dirá el NOMBRE EXACTO (schema y nombre)
SELECT table_schema,
    table_name
FROM information_schema.tables
WHERE table_name ILIKE '%actas%'
    OR table_name ILIKE '%Actas%';