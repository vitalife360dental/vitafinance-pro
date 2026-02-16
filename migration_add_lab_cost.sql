-- Add lab_cost column to vf_treatment_costs
ALTER TABLE vf_treatment_costs
ADD COLUMN IF NOT EXISTS lab_cost DECIMAL(10, 2) DEFAULT 0;
-- Migrate data: Treatments that are clearly laboratory-based
-- We move high supply_costs to lab_cost for known prosthetic/orthodontic treatments
UPDATE vf_treatment_costs
SET lab_cost = supply_cost,
    supply_cost = 0
WHERE treatment_name IN (
        'CORONA ZIRCONIA',
        'PUENTE 3 PIEZAS',
        'INCRUSTACIÓN DE CIRCONIO',
        'CARILLA PORCELANA'
    );
-- Update specific known lab categories if they exist
UPDATE vf_treatment_costs
SET lab_cost = supply_cost,
    supply_cost = 2.00 -- Keep a small estimate for clinic materials
WHERE category_group IN ('🟠 PRÓTESIS FIJA', '🟠 PRÓTESIS REMOVIBLE')
    AND supply_cost > 20;