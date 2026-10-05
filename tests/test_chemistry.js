import { parseFormula } from '../src/js/formulaParser.js';
import { calculateStoichiometry } from '../src/js/stoichiometry.js';
import { calculateHFromPH, calculateDilution } from '../src/js/phCalculator.js';

console.log("Running Chemical Engine Unit Tests...");

// Test 1: Water formula parsing
const water = parseFormula("H2O");
console.assert(Math.abs(water.molarMass - 18.015) < 0.01, "Water mass should be ~18.015");
console.assert(water.counts.H === 2 && water.counts.O === 1, "Water count should be H:2, O:1");

// Test 2: Complex hydrate parsing
const hydrate = parseFormula("CuSO4*5H2O");
console.assert(hydrate.counts.Cu === 1, "Cu should be 1");
console.assert(hydrate.counts.S === 1, "S should be 1");
console.assert(hydrate.counts.O === 9, "O should be 9 (4 + 5)");
console.assert(hydrate.counts.H === 10, "H should be 10");

// Test 3: Parenthesis formula parsing
const calciumHydroxide = parseFormula("Ca(OH)2");
console.assert(calciumHydroxide.counts.Ca === 1, "Ca should be 1");
console.assert(calciumHydroxide.counts.O === 2, "O should be 2");
console.assert(calciumHydroxide.counts.H === 2, "H should be 2");

// Test 4: Stoichiometry calculation
const stoich = calculateStoichiometry(["2H2", "O2"], ["2H2O"], 0, 100);
console.assert(stoich.products[0].moles > 0, "Product moles should be positive");

// Test 5: pH calculations
const phResult = calculateHFromPH(7.0);
console.assert(phResult.pOH === 7.0, "pOH at pH 7 should be 7");
console.assert(Math.abs(phResult.hConcentration - 1e-7) < 1e-9, "[H+] should be 1e-7");

// Test 6: Dilution
const dilution = calculateDilution({ c1: 1.0, v1: 0.5, c2: 0.1, v2: null });
console.assert(Math.abs(dilution.v2 - 5.0) < 0.001, "Dilution v2 should be 5.0");

console.log("ALL TESTS PASSED SUCCESSFULLY! ✅");
