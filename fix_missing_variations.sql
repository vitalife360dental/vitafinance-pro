-- SCRIPT DE CORRECCIÓN DE NOMBRES (VARIACIONES)
-- Este script agrega las variantes exactas que aparecen en tu App (según las capturas)
-- asignándoles los costos de tu lista oficial.
INSERT INTO vf_treatment_costs (
        treatment_name,
        category_group,
        supply_cost,
        duration_override
    )
VALUES -- Variaciones detectadas en capturas
    (
        'PUENTE DE CEROMERO 2 PIEZAS',
        '🟠 PRÓTESIS',
        110.00,
        90
    ),
    (
        'PUENTE FIJO 3 PIEZAS HIBRIDA',
        '🟠 PRÓTESIS',
        180.00,
        120
    ),
    (
        'RETRATAMIENTO PREMOLARES',
        '🔵 ENDODONCIA',
        25.00,
        90
    ),
    -- Estimado (Promedio)
    (
        'BIOESTIMULADOR (Radiex)',
        '🔶 ESTÉTICA FACIAL',
        180.00,
        60
    ),
    (
        'BIOESTIMULADOR (Scultra)',
        '🔶 ESTÉTICA FACIAL',
        180.00,
        60
    ),
    (
        'BOTOX PERIORAL',
        '🔶 ESTÉTICA FACIAL',
        25.00,
        30
    ),
    -- = Botox Peribucal
    (
        'BOTOX TERCIO SUPERIOR (3 zonas)',
        '🔶 ESTÉTICA FACIAL',
        90.00,
        30
    ),
    (
        'BOTOX TERCIO SUPERIOR (4 zonas)',
        '🔶 ESTÉTICA FACIAL',
        90.00,
        30
    ),
    ('CIRUGIA 3ER MOLARES', '🔴 CIRUGÍA', 10.00, 60),
    -- = 3ros molares
    ('CORONA CIRCONIA', '🟠 PRÓTESIS', 120.00, 60),
    -- = Zirconia
    (
        'DISEÑO DE CERAMICA (8 Piezas)',
        '🔶 ESTÉTICA',
        600.00,
        240
    ),
    (
        'DISEÑO DE SONRISA (8 Piezas)',
        '🔶 ESTÉTICA',
        120.00,
        180
    ),
    ('ELEVACION PISO SENO', '🔴 CIRUGÍA', 180.00, 90),
    (
        'ENDODONCIA EN DIENTE INCISIVO',
        '🔵 ENDODONCIA',
        18.00,
        90
    ),
    (
        'INSTALACION DE PLANO DE MORDIDA',
        '🟣 ORTODONCIA',
        18.00,
        60
    ),
    ('PLANO RELAJACION', '🟣 ORTODONCIA', 20.00, 90) ON CONFLICT (treatment_name) DO
UPDATE
SET supply_cost = EXCLUDED.supply_cost;