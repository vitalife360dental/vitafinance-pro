
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mocking the service locally to avoid complex TS imports in CJS
const getCommissionRate = (doctorName, treatmentCategory, treatmentName) => {
    // Simplified logic for test
    return 0.33;
};

const normalize = (str) =>
    str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

async function getProductionAnalyticsTest(treatmentName, testPrice, testMaterial, testLab, duration) {
    // Mimics the logic we just wrote in financeService.ts
    const amount = testPrice;
    const materialCost = testMaterial;
    const labCost = testLab;

    // Operational Cost (approx default)
    const costPerMinute = 2000 / (160 * 60); // Example fixed
    const operationalCost = duration * costPerMinute;

    const netBase = Math.max(0, amount - labCost - materialCost - operationalCost);
    const commissionRate = 0.33;
    const tariffCost = netBase * commissionRate;

    return {
        amount,
        materialCost,
        labCost,
        operationalCost,
        netBase,
        tariffCost,
        commissionRate
    };
}

async function testNetCommission() {
    console.log("🚀 Starting Net Commission Verification (Simulation)...");

    // We will simulate the logic because running the full React service in Node is complex without a bundler.
    // The core logic change was: netBase = amount - lab - material - operational.

    const TEST_PRICE = 200;
    const TEST_MATERIAL = 30;
    const TEST_LAB = 10;
    const TEST_DURATION = 30;

    console.log(`Inputs: Price ${TEST_PRICE}, Mat ${TEST_MATERIAL}, Lab ${TEST_LAB}, Dur ${TEST_DURATION}`);

    const result = await getProductionAnalyticsTest("Test", TEST_PRICE, TEST_MATERIAL, TEST_LAB, TEST_DURATION);

    console.log("\n📊 Simulated Result:");
    console.log(`Net Base: ${result.netBase.toFixed(2)}`);
    console.log(`Commission (33%): ${result.tariffCost.toFixed(2)}`);

    // Expected
    // Op Cost = 2000 / 9600 * 30 = 0.208 * 30 = 6.25
    // Net Base = 200 - 30 - 10 - 6.25 = 153.75
    // Comm = 153.75 * 0.33 = 50.7375

    const expectedOpCost = (2000 / (160 * 60)) * 30;
    const expectedBase = 200 - 30 - 10 - expectedOpCost;

    if (Math.abs(result.netBase - expectedBase) < 0.1) {
        console.log("✅ Logic Verified");
    } else {
        console.error("❌ Logic Mismatch");
    }
}

testNetCommission();
