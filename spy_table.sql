-- 🕵️ Búsqueda Avanzada de la Tabla Fantasma
-- 1. Buscar por COLUMNAS (¿Hay alguna tabla con columna 'creado_en' o 'tipo'?)
SELECT 'Por Columna' as metodo,
    table_schema,
    table_name,
    column_name
FROM information_schema.columns
WHERE column_name IN (
        'creado_en',
        'tipo',
        'descripción',
        'metodo',
        'método'
    )
    OR column_name = 'created_at' -- Por si es una traducción visual
ORDER BY table_name;
-- 2. Buscar por COMENTARIO (¿Se llama diferente pero tiene la etiqueta "actas"?)
SELECT 'Por Etiqueta' as metodo,
    n.nspname as esquema,
    c.relname as nombre_real,
    d.description as etiqueta
FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_description d ON c.oid = d.objoid
WHERE d.description ILIKE '%actas%';
-- 3. Listar TODAS las tablas públicas (por si acaso)
SELECT 'Listado Total' as metodo,
    table_schema,
    table_name,
    '' as extra
FROM information_schema.tables
WHERE table_schema = 'public';