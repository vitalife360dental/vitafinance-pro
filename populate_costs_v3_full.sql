-- SCRIPT MAESTRO DE COSTOS (V3 FINAL)
-- Ejecutar este script actualizará los 75 tratamientos con sus costos exactos.
INSERT INTO vf_treatment_costs (
        treatment_name,
        category_group,
        supply_cost,
        duration_override
    )
VALUES -- 🟢 PREVENTIVOS / BÁSICOS
    ('PROFILAXIS', '🟢 PREVENTIVO', 2.50, 30),
    ('PROFILAXIS NIÑOS', '🟢 PREVENTIVO', 2.00, 30),
    ('SELLANTES', '🟢 PREVENTIVO', 2.20, 30),
    (
        'PULPOTOMÍA DIENTE PERMANENTE',
        '🟢 PREVENTIVO',
        7.00,
        30
    ),
    -- Categorizado aquí o en Endo
    ('PULPOTOMÍA', '🟢 PREVENTIVO', 6.00, 30),
    ('PULPECTOMÍA', '🟢 PREVENTIVO', 8.00, 30),
    ('MUCOCELE', '🟢 PREVENTIVO', 6.00, 30),
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
    (
        'RESTAURACIÓN RECONSTRUCTIVA',
        '🟡 RESTAURATIVO',
        6.00,
        60
    ),
    (
        'RESTAURACIÓN DE CUELLOS',
        '🟡 RESTAURATIVO',
        3.00,
        30
    ),
    (
        'CEMENTACIÓN CORONA',
        '🟡 RESTAURATIVO',
        2.00,
        20
    ),
    -- 🔶 ESTÉTICA DENTAL
    ('BLANQUEAMIENTO', '🔶 ESTÉTICA', 25.00, 60),
    (
        'BLANQUEAMIENTO AMBULATORIO',
        '🔶 ESTÉTICA',
        15.00,
        20
    ),
    (
        'CARILLA RESINA (X PIEZA)',
        '🔶 ESTÉTICA',
        6.00,
        60
    ),
    ('CARILLA PORCELANA', '🔶 ESTÉTICA', 60.00, 90),
    ('DISEÑO DE SONRISA', '🔶 ESTÉTICA', 120.00, 90),
    ('BORDES INCISALES', '🔶 ESTÉTICA', 5.00, 30),
    ('DISEÑO DE CERÁMICA', '🔶 ESTÉTICA', 600.00, 120),
    (
        'MANTENIMIENTO CARILLAS',
        '🔶 ESTÉTICA',
        4.00,
        30
    ),
    (
        'RECORTE DE ENCÍA 1 PIEZA',
        '🔶 ESTÉTICA',
        2.00,
        15
    ),
    (
        'RECORTE DE ENCÍA 10 PIEZAS',
        '🔶 ESTÉTICA',
        8.00,
        45
    ),
    ('GINGIVECTOMÍA', '🔶 ESTÉTICA', 6.00, 45),
    ('FRENILECTOMÍA', '🔶 ESTÉTICA', 5.00, 30),
    -- 🔵 ENDODONCIA
    (
        'ENDODONCIA INCISIVO',
        '🔵 ENDODONCIA',
        18.00,
        90
    ),
    (
        'ENDODONCIA PREMOLARES',
        '🔵 ENDODONCIA',
        20.00,
        90
    ),
    (
        'ENDODONCIA MOLARES',
        '🔵 ENDODONCIA',
        22.00,
        120
    ),
    (
        'RETRATAMIENTO DIENTE ANTERIOR',
        '🔵 ENDODONCIA',
        25.00,
        90
    ),
    (
        'RETRATAMIENTO MOLARES',
        '🔵 ENDODONCIA',
        28.00,
        120
    ),
    (
        'RETRATAMIENTO MOLARES COMPLEJO',
        '🔵 ENDODONCIA',
        30.00,
        120
    ),
    ('APICECTOMÍA', '🔵 ENDODONCIA', 18.00, 60),
    (
        'POSTE FIBRA DE VIDRIO',
        '🔵 ENDODONCIA',
        15.00,
        45
    ),
    -- 🔴 CIRUGÍA / IMPLANTOLOGÍA
    ('EXTRACCIÓN SIMPLE', '🔴 CIRUGÍA', 3.00, 30),
    ('EXTRACCIÓN NIÑOS', '🔴 CIRUGÍA', 2.50, 20),
    ('EXTRACCIÓN DIENTES', '🔴 CIRUGÍA', 3.00, 30),
    ('EXODONCIA', '🔴 CIRUGÍA', 3.00, 30),
    ('CIRUGÍA 3ROS MOLARES', '🔴 CIRUGÍA', 10.00, 60),
    ('CIRUGÍA COMPLEJA', '🔴 CIRUGÍA', 12.00, 90),
    (
        'CIRUGÍA CANINO RETENIDO',
        '🔴 CIRUGÍA',
        15.00,
        90
    ),
    (
        'ELEVACIÓN PISO DE SENO',
        '🔴 CIRUGÍA',
        180.00,
        90
    ),
    (
        'IMPLANTE CIRUGÍA',
        '🔴 IMPLANTOLOGÍA',
        250.00,
        120
    ),
    (
        'CORONA SOBRE IMPLANTE',
        '🔴 IMPLANTOLOGÍA',
        140.00,
        90
    ),
    -- 🟣 ORTODONCIA
    (
        'INSTALACIÓN ORTODONCIA ORTOMETRIC',
        '🟣 ORTODONCIA',
        35.00,
        90
    ),
    (
        'INSTALACIÓN AUTOLIGADOS',
        '🟣 ORTODONCIA',
        45.00,
        90
    ),
    (
        'INSTALACIÓN CONVENCIONALES',
        '🟣 ORTODONCIA',
        40.00,
        90
    ),
    ('CONTROL AUTOLIGADOS', '🟣 ORTODONCIA', 3.00, 20),
    ('CONTROL ORTOMETRIC', '🟣 ORTODONCIA', 3.00, 20),
    (
        'CONTROL CONVENCIONAL',
        '🟣 ORTODONCIA',
        2.50,
        20
    ),
    (
        'INSTALACIÓN DE MICROTORNILLO',
        '🟣 ORTODONCIA',
        25.00,
        30
    ),
    (
        'INSTALACIÓN PLANO DE MORDIDA',
        '🟣 ORTODONCIA',
        18.00,
        30
    ),
    (
        'PLANO DE RELAJACIÓN',
        '🟣 ORTODONCIA',
        20.00,
        30
    ),
    (
        'RETENEDORES ACETATO',
        '🟣 ORTODONCIA',
        20.00,
        30
    ),
    (
        'RETENEDORES ACRÍLICOS',
        '🟣 ORTODONCIA',
        30.00,
        30
    ),
    -- 🟠 PRÓTESIS / LABORATORIO
    ('PRÓTESIS PROVISIONAL', '🟠 PRÓTESIS', 10.00, 30),
    ('PRÓTESIS TOTAL', '🟠 PRÓTESIS', 80.00, 60),
    ('PRÓTESIS PARCIAL', '🟠 PRÓTESIS', 60.00, 60),
    (
        'PRÓTESIS ACKER 1 PIEZA',
        '🟠 PRÓTESIS',
        70.00,
        60
    ),
    (
        'PRÓTESIS CROMO COBALTO',
        '🟠 PRÓTESIS',
        120.00,
        60
    ),
    (
        'PUENTE FIJO 3 PIEZAS',
        '🟠 PRÓTESIS',
        180.00,
        120
    ),
    (
        'PUENTE ACRÍLICO 3 PIEZAS',
        '🟠 PRÓTESIS',
        60.00,
        60
    ),
    (
        'PUENTE CERÓMERO 2 PIEZAS',
        '🟠 PRÓTESIS',
        110.00,
        90
    ),
    (
        'CORONA METAL PORCELANA',
        '🟠 PRÓTESIS',
        70.00,
        60
    ),
    ('CORONA ZIRCONIA', '🟠 PRÓTESIS', 120.00, 60),
    (
        'INCRUSTACIÓN DE CIRCONIO',
        '🟠 PRÓTESIS',
        90.00,
        60
    ),
    (
        'INCRUSTACIÓN CERÓMERO',
        '🟠 PRÓTESIS',
        70.00,
        60
    ),
    -- 🔶 ESTÉTICA FACIAL
    (
        'BOTOX TERCIO SUPERIOR',
        '🔶 ESTÉTICA FACIAL',
        90.00,
        30
    ),
    (
        'BOTOX PERIBUCAL',
        '🔶 ESTÉTICA FACIAL',
        25.00,
        30
    ),
    (
        'BOTOX BRUXISMO',
        '🔶 ESTÉTICA FACIAL',
        110.00,
        30
    ),
    (
        'LABIOS AUMENTO',
        '🔶 ESTÉTICA FACIAL',
        110.00,
        40
    ),
    ('MENTÓN', '🔶 ESTÉTICA FACIAL', 95.00, 40),
    ('MANDÍBULA', '🔶 ESTÉTICA FACIAL', 95.00, 40),
    (
        'SURCO NASOLABIAL',
        '🔶 ESTÉTICA FACIAL',
        100.00,
        40
    ),
    ('NARIZ', '🔶 ESTÉTICA FACIAL', 120.00, 40),
    (
        'BIOESTIMULADOR',
        '🔶 ESTÉTICA FACIAL',
        180.00,
        60
    ) ON CONFLICT (treatment_name) DO
UPDATE
SET supply_cost = EXCLUDED.supply_cost,
    category_group = EXCLUDED.category_group;