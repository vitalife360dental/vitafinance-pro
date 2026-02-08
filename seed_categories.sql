-- Seed vf_categories if empty or missing critical ones
INSERT INTO vf_categories (name, type, color, icon)
SELECT 'Materiales',
    'expense',
    'blue',
    'package'
WHERE NOT EXISTS (
        SELECT 1
        FROM vf_categories
        WHERE name = 'Materiales'
    );
INSERT INTO vf_categories (name, type, color, icon)
SELECT 'Laboratorio',
    'expense',
    'purple',
    'flask'
WHERE NOT EXISTS (
        SELECT 1
        FROM vf_categories
        WHERE name = 'Laboratorio'
    );
INSERT INTO vf_categories (name, type, color, icon)
SELECT 'Mantenimiento',
    'expense',
    'orange',
    'tool'
WHERE NOT EXISTS (
        SELECT 1
        FROM vf_categories
        WHERE name = 'Mantenimiento'
    );
INSERT INTO vf_categories (name, type, color, icon)
SELECT 'Nómina',
    'expense',
    'red',
    'users'
WHERE NOT EXISTS (
        SELECT 1
        FROM vf_categories
        WHERE name = 'Nómina'
    );
INSERT INTO vf_categories (name, type, color, icon)
SELECT 'Servicios Básicos',
    'expense',
    'yellow',
    'zap'
WHERE NOT EXISTS (
        SELECT 1
        FROM vf_categories
        WHERE name = 'Servicios Básicos'
    );
INSERT INTO vf_categories (name, type, color, icon)
SELECT 'Marketing',
    'expense',
    'pink',
    'megaphone'
WHERE NOT EXISTS (
        SELECT 1
        FROM vf_categories
        WHERE name = 'Marketing'
    );
INSERT INTO vf_categories (name, type, color, icon)
SELECT 'Impuestos',
    'expense',
    'gray',
    'landmark'
WHERE NOT EXISTS (
        SELECT 1
        FROM vf_categories
        WHERE name = 'Impuestos'
    );
INSERT INTO vf_categories (name, type, color, icon)
SELECT 'Otros',
    'expense',
    'slate',
    'circle'
WHERE NOT EXISTS (
        SELECT 1
        FROM vf_categories
        WHERE name = 'Otros'
    );