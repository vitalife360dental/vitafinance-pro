
import { financeService } from '../src/services/financeService';
import { supabase } from '../src/lib/supabase';

async function testNetCommission() {
    console.log("🚀 Starting Net Commission Verification...");

    const TEST_TREATMENT = "TEST_ENDODONCIA_MOLARES";
    const TEST_PRICE = 200;
    const TEST_MATERIAL = 30;
    const TEST_LAB = 10;
    const TEST_DURATION = 30; // 30 mins

    // Cleanup previous test data
    await supabase.from('vf_transactions').delete().eq('description', TEST_TREATMENT);
    await supabase.from('vf_treatment_costs').delete().eq('treatment_name', TEST_TREATMENT);

    // 1. Setup Costs
    console.log(`1️⃣ Setting up costs for ${TEST_TREATMENT}...`);
    const { error: costError } = await supabase.from('vf_treatment_costs').insert({
        treatment_name: TEST_TREATMENT,
        material_cost: TEST_MATERIAL,
        lab_cost: TEST_LAB,
        duration: TEST_DURATION
    });

    if (costError) {
        console.error("❌ Error setting costs:", costError);
        return;
    }

    // 2. Create Transaction
    console.log(`2️⃣ Creating transaction of $${TEST_PRICE}...`);
    await financeService.createTransaction({
        amount: TEST_PRICE,
        description: TEST_TREATMENT,
        date: new Date().toISOString().split('T')[0],
        type: 'income',
        doctor_name: 'Dr. Test',
        patient_name: 'Patient Test',
        treatment_name: TEST_TREATMENT
    });

    // 3. Fetch and Validte
    console.log(`3️⃣ Fetching analytics to verify calculations...`);
    const analytics = await financeService.getProductionAnalytics();

    // Find our specific transaction/operation
    const op = analytics.raw.find((o: any) => o.description === TEST_TREATMENT);

    if (!op) {
        console.error("❌ Transaction not found in analytics!");
        return;
    }

    console.log("\n📊 Verification Results:");
    console.log("------------------------------------------------");
    console.log(`Facturado (Amount):     $${op.amount}`);
    console.log(`- Material Cost:        $${op.suppliesCost} (Expected: $${TEST_MATERIAL})`);
    console.log(`- Lab Cost:             $${Number(op.netUtility) + Number(op.tariffCost) + Number(op.operationalCost) + Number(op.suppliesCost) > Number(op.amount) ? 'Error' : 'Hidden in calculation'}`); // Lab cost is not directly attached to op object in my last edit, let's check debug field if I added one or calculate diff.

    // Re-calculating expected values to compare
    // Fixed cost defaults to ~0.33/min if config missing
    const opCost = op.operationalCost;
    console.log(`- Operational Cost:     $${opCost.toFixed(2)}`);

    const expectedNetBase = Math.max(0, TEST_PRICE - TEST_MATERIAL - TEST_LAB - opCost);
    console.log(`= Net Base:             $${op.netBase?.toFixed(2)} (Expected: $${expectedNetBase.toFixed(2)})`);

    const expectedCommission = expectedNetBase * 0.33; // Default 33%
    console.log(`x Commission Rate:      ${(op.commissionRate * 100).toFixed(0)}%`);
    console.log(`= Commission Amount:    $${op.tariffCost.toFixed(2)} (Expected: $${expectedCommission.toFixed(2)})`);

    const diff = Math.abs(op.tariffCost - expectedCommission);
    if (diff < 0.05) {
        console.log("\n✅ SUCCESS: Calculation matches expectations!");
    } else {
        console.error("\n❌ FAILURE: Calculation mismatch!");
    }

    // Cleanup
    await supabase.from('vf_transactions').delete().eq('description', TEST_TREATMENT);
    await supabase.from('vf_treatment_costs').delete().eq('treatment_name', TEST_TREATMENT);
}

testNetCommission();
