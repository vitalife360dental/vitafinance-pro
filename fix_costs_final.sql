-- SCRIPT DE REPARACIÓN DEFINITIVA (FIX FINAL)
-- 1. Limpia la tabla por completo para borrar datos corruptos.
-- 2. Inserta la lista EXACTA que tú me diste.
-- 3. Asegura permisos de lectura.
TRUNCATE TABLE vf_treatment_costs;
INSERT INTO vf_treatment_costs (
        treatment_name,
        category_group,
        supply_cost,
        duration_override
    )
VALUES ('Profilaxis', '🟢 PREVENTIVO', 2.50, 30),
    ('Blanqueamiento', '🔶 ESTÉTICA', 25.00, 60),
    (
        'Restauración simple',
        '🟡 RESTAURATIVO',
        3.00,
        30
    ),
    (
        'Restauración compuesta',
        '🟡 RESTAURATIVO',
        4.00,
        40
    ),
    (
        'Restauración compleja',
        '🟡 RESTAURATIVO',
        5.50,
        60
    ),
    (
        'Blanqueamiento ambulatorio',
        '🔶 ESTÉTICA',
        15.00,
        20
    ),
    (
        'Restauración reconstructiva',
        '🟡 RESTAURATIVO',
        6.00,
        60
    ),
    (
        'Restauración de cuellos',
        '🟡 RESTAURATIVO',
        3.00,
        30
    ),
    ('Sellantes', '🟢 PREVENTIVO', 2.20, 30),
    ('Pulpotomía', '🟢 PREVENTIVO', 6.00, 30),
    ('Pulpectomía', '🟢 PREVENTIVO', 8.00, 30),
    ('Profilaxis niños', '🟢 PREVENTIVO', 2.00, 30),
    (
        'Instalación ortodoncia Ortometric',
        '🟣 ORTODONCIA',
        35.00,
        90
    ),
    (
        'Instalación autoligados',
        '🟣 ORTODONCIA',
        45.00,
        90
    ),
    (
        'Instalación convencionales',
        '🟣 ORTODONCIA',
        40.00,
        90
    ),
    ('Control autoligados', '🟣 ORTODONCIA', 3.00, 20),
    ('Control Ortometric', '🟣 ORTODONCIA', 3.00, 20),
    (
        'Control convencional',
        '🟣 ORTODONCIA',
        2.50,
        20
    ),
    (
        'Instalación de microtornillo',
        '🟣 ORTODONCIA',
        25.00,
        30
    ),
    ('Apicectomía', '🔵 ENDODONCIA', 18.00, 60),
    (
        'Elevación piso de seno',
        '🔴 CIRUGÍA',
        180.00,
        90
    ),
    ('Exodoncia', '🔴 CIRUGÍA', 3.00, 30),
    (
        'Instalación plano de mordida',
        '🟣 ORTODONCIA',
        18.00,
        30
    ),
    ('Mucocele', '🟢 PREVENTIVO', 6.00, 30),
    (
        'Retenedores acetato',
        '🟣 ORTODONCIA',
        20.00,
        30
    ),
    (
        'Retenedores acrílicos',
        '🟣 ORTODONCIA',
        30.00,
        30
    ),
    ('Cirugía 3ros molares', '🔴 CIRUGÍA', 10.00, 60),
    (
        'Carilla resina x pieza',
        '🔶 ESTÉTICA',
        6.00,
        60
    ),
    ('Frenilectomía', '🔶 ESTÉTICA', 5.00, 30),
    ('Carilla porcelana', '🔶 ESTÉTICA', 60.00, 90),
    ('Diseño de sonrisa', '🔶 ESTÉTICA', 120.00, 90),
    ('Bordes incisales', '🔶 ESTÉTICA', 5.00, 30),
    ('Diseño de cerámica', '🔶 ESTÉTICA', 600.00, 120),
    ('Gingivectomía', '🔶 ESTÉTICA', 6.00, 45),
    ('Cirugía compleja', '🔴 CIRUGÍA', 12.00, 90),
    ('Extracción simple', '🔴 CIRUGÍA', 3.00, 30),
    ('Extracción niños', '🔴 CIRUGÍA', 2.50, 20),
    ('Extracción dientes', '🔴 CIRUGÍA', 3.00, 30),
    (
        'Cirugía canino retenido',
        '🔴 CIRUGÍA',
        15.00,
        90
    ),
    (
        'Endodoncia incisivo',
        '🔵 ENDODONCIA',
        18.00,
        90
    ),
    (
        'Endodoncia premolares',
        '🔵 ENDODONCIA',
        20.00,
        90
    ),
    (
        'Endodoncia molares',
        '🔵 ENDODONCIA',
        22.00,
        120
    ),
    (
        'Retratamiento diente anterior',
        '🔵 ENDODONCIA',
        25.00,
        90
    ),
    (
        'Retratamiento molares',
        '🔵 ENDODONCIA',
        28.00,
        120
    ),
    (
        'Retratamiento molares complejo',
        '🔵 ENDODONCIA',
        30.00,
        120
    ),
    (
        'Pulpotomía diente permanente',
        '🟢 PREVENTIVO',
        7.00,
        30
    ),
    (
        'Implante cirugía',
        '🔴 IMPLANTOLOGÍA',
        250.00,
        120
    ),
    ('Prótesis provisional', '🟠 PRÓTESIS', 10.00, 30),
    ('Prótesis total', '🟠 PRÓTESIS', 80.00, 60),
    ('Prótesis parcial', '🟠 PRÓTESIS', 60.00, 60),
    (
        'Prótesis Acker 1 pieza',
        '🟠 PRÓTESIS',
        70.00,
        60
    ),
    (
        'Prótesis cromo cobalto',
        '🟠 PRÓTESIS',
        120.00,
        60
    ),
    (
        'Plano de relajación',
        '🟣 ORTODONCIA',
        20.00,
        30
    ),
    (
        'Puente fijo 3 piezas',
        '🟠 PRÓTESIS',
        180.00,
        120
    ),
    (
        'Corona metal porcelana',
        '🟠 PRÓTESIS',
        70.00,
        60
    ),
    ('Corona zirconia', '🟠 PRÓTESIS', 120.00, 60),
    (
        'Puente acrílico 3 piezas',
        '🟠 PRÓTESIS',
        60.00,
        60
    ),
    (
        'Puente cerómero 2 piezas',
        '🟠 PRÓTESIS',
        110.00,
        90
    ),
    (
        'Incrustación de circonio',
        '🟠 PRÓTESIS',
        90.00,
        60
    ),
    (
        'Incrustación cerómero',
        '🟠 PRÓTESIS',
        70.00,
        60
    ),
    (
        'Poste fibra de vidrio',
        '🔵 ENDODONCIA',
        15.00,
        45
    ),
    (
        'Recorte de encía 1 pieza',
        '🔶 ESTÉTICA',
        2.00,
        15
    ),
    (
        'Recorte de encía 10 piezas',
        '🔶 ESTÉTICA',
        8.00,
        45
    ),
    (
        'Mantenimiento carillas',
        '🔶 ESTÉTICA',
        4.00,
        30
    ),
    (
        'Corona sobre implante',
        '🔴 IMPLANTOLOGÍA',
        140.00,
        90
    ),
    (
        'Botox tercio superior',
        '🔶 ESTÉTICA FACIAL',
        90.00,
        30
    ),
    (
        'Botox peribucal',
        '🔶 ESTÉTICA FACIAL',
        25.00,
        30
    ),
    (
        'Botox bruxismo',
        '🔶 ESTÉTICA FACIAL',
        110.00,
        30
    ),
    (
        'Labios aumento',
        '🔶 ESTÉTICA FACIAL',
        110.00,
        40
    ),
    ('Mentón', '🔶 ESTÉTICA FACIAL', 95.00, 40),
    ('Mandíbula', '🔶 ESTÉTICA FACIAL', 95.00, 40),
    (
        'Surco nasolabial',
        '🔶 ESTÉTICA FACIAL',
        100.00,
        40
    ),
    ('Nariz', '🔶 ESTÉTICA FACIAL', 120.00, 40),
    (
        'Bioestimulador',
        '🔶 ESTÉTICA FACIAL',
        180.00,
        60
    ),
    (
        'Cementación corona',
        '🟡 RESTAURATIVO',
        2.00,
        20
    );
-- FIX PERMISSIONS (JUST IN CASE)
ALTER TABLE vf_treatment_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON vf_treatment_costs FOR
SELECT USING (true);
CREATE POLICY "Allow public insert" ON vf_treatment_costs FOR
INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON vf_treatment_costs FOR
UPDATE USING (true);