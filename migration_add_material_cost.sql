-- Add material_cost column to vf_treatment_costs if it doesn't exist
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'vf_treatment_costs'
        AND column_name = 'material_cost'
) THEN
ALTER TABLE vf_treatment_costs
ADD COLUMN material_cost DECIMAL(10, 2) DEFAULT 0.00;
END IF;
END $$;