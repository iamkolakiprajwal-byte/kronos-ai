import { calculateEcoImpact, sampleEcoEntries } from "../../src/lib/sustainability/eco-calculator";
import { EcoLogEntry } from "../../src/types";

function runEcoTests() {
  console.log("=================================================");
  console.log("KRONOS SUSTAINABILITY & ECO-CALCULATOR TEST SUITE");
  console.log("=================================================");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, message: string) {
    total++;
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      process.exitCode = 1;
    }
  }

  // Test 1: Baseline sample entries calculation
  const summary = calculateEcoImpact(sampleEcoEntries);
  assert(summary.totalCo2SavedKg > 2.0, "Total CO2 saved calculated correctly in kg");
  assert(summary.activeCommuteMinutes === 55, "Active commute minutes summed correctly (30m + 25m = 55m)");
  assert(summary.paperlessHours === 1.5, "Paperless hours calculated correctly (90m / 60 = 1.5h)");
  assert(summary.ecoScore >= 50, "Eco score computes non-zero positive consistency rating");

  // Test 2: Empty entries handling
  const emptySummary = calculateEcoImpact([]);
  assert(emptySummary.totalCo2SavedKg === 0, "Empty log results in 0 kg CO2 saved");
  assert(emptySummary.activeCommuteMinutes === 0, "Empty log results in 0 commute minutes");

  // Test 3: Incremental addition
  const customEntries: EcoLogEntry[] = [
    {
      id: "test-eco-1",
      date: "2026-11-02",
      activity: "cycle_commute",
      minutes: 40,
      co2SavedGrams: 1000,
    },
  ];
  const customSummary = calculateEcoImpact(customEntries);
  assert(customSummary.totalCo2SavedKg === 1.0, "1000g equals 1.0 kg CO2 saved");
  assert(customSummary.activeCommuteMinutes === 40, "40 minutes commute logged");

  console.log("=================================================");
  console.log(`TEST RESULTS: ${passed}/${total} PASSED`);
  console.log("=================================================");
}

runEcoTests();
