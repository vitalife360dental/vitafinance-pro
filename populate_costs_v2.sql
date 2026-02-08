-- SCRIPT DEFINITIVO DE COSTOS (Ejecutar para rellenar insumos)
-- Este script actualiza los valores si ya existen o crea nuevos.
INSERT INTO vf_treatment_costs (
        treatment_name,
        category_group,
        supply_cost,
        duration_override
    )
VALUES -- 🟢 PREVENTIVOS
    ('PROFILAXIS', '🟢 PREVENTIVO', 2.50, 30),
    ('PROFILAXIS NIÑOS', '🟢 PREVENTIVO', 2.00, 25),
    ('SELLANTES', '🟢 PREVENTIVO', 2.20, 30),
    -- 🟡 RESTAURATIVOS
    (
        'RESTAURACIÓN SIMPLE',
        '🟡 RESTAURATIVO',
        3.00,
        30
    ),
    (
        'RESTAURACIÓN COMPUESTA',
        '🟡 RESTAURATIVO',
        4.00,
        40
    ),
    (
        'RESTAURACIÓN COMPLEJA',
        '🟡 RESTAURATIVO',
        5.50,
        60
    ),
    -- 🔶 ESTÉTICA
    (
        'CARILLA RESINA (x pieza)',
        '🔶 ESTÉTICA',
        6.00,
        60
    ),
    ('BORDES INCISALES', '🔶 ESTÉTICA', 0.00, 30),
    ('BLANQUEAMIENTO', '🔶 ESTÉTICA', 0.00, 60),
    -- 🔵 ENDODONCIA
    (
        'ENDODONCIA INCISIVO',
        '🔵 ENDODONCIA',
        18.00,
        90
    ),
    (
        'ENDODONCIA MOLARES',
        '🔵 ENDODONCIA',
        22.00,
        120
    ),
    -- 🔴 CIRUGÍA
    ('EXTRACCIÓN SIMPLE', '🔴 CIRUGÍA', 3.00, 30),
    ('CIRUGÍA 3ROS MOLARES', '🔴 CIRUGÍA', 10.00, 90),
    (
        'IMPLANTE (cirugía)',
        '🔴 IMPLANTOLOGÍA',
        250.00,
        120
    ),
    ('APICECTOMIA', '🔴 CIRUGÍA', 0.00, 60),
    -- 🟣 ORTODONCIA
    (
        'INSTALACIÓN CONVENCIONAL',
        '🟣 ORTODONCIA',
        45.00,
        90
    ),
    ('CONTROL ORTODONCIA', '🟣 ORTODONCIA', 3.00, 20),
    -- 🟠 PRÓTESIS / LABORATORIO
    (
        'CORONA ZIRCONIA',
        '🟠 PRÓTESIS FIJA',
        120.00,
        90
    ),
    (
        'PUENTE 3 PIEZAS',
        '🟠 PRÓTESIS FIJA',
        180.00,
        120
    ),
    -- 🔶 ESTÉTICA FACIAL
    (
        'BOTOX BRUXISMO',
        '🔶 ESTÉTICA FACIAL',
        90.00,
        30
    ),
    (
        'ÁCIDO HIALURÓNICO LABIOS',
        '🔶 ESTÉTICA FACIAL',
        110.00,
        40
    ),
    ('BOTOX PERIORAL', '🔶 ESTÉTICA FACIAL', 0.00, 30),
    (
        'BIOESTIMULADOR (Radiex)',
        '🔶 ESTÉTICA FACIAL',
        0.00,
        60
    ),
    (
        'BIOESTIMULADOR (Scultra)',
        '🔶 ESTÉTICA FACIAL',
        0.00,
        30
    ) ON CONFLICT (treatment_name) DO
UPDATE
SET supply_cost = EXCLUDED.supply_cost,
    category_group = EXCLUDED.category_group,
    duration_override = EXCLUDED.duration_override;