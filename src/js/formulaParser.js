import { ELEMENTS } from '../data/elements.js';

// Build atomic mass map
const ATOMIC_MASSES = {};
ELEMENTS.forEach(el => {
  ATOMIC_MASSES[el.symbol] = el.mass;
});

// Fallback common element masses if not in elements list
const COMMON_MASSES = {
  H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011,
  N: 14.007, O: 15.999, F: 18.998, Ne: 20.180, Na: 22.990, Mg: 24.305,
  Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, Ar: 39.948,
  K: 39.098, Ca: 40.078, Fe: 55.845, Cu: 63.546, Zn: 65.38, Ag: 107.87,
  Au: 196.97, Hg: 200.59, U: 238.03
};

export function getElementMass(symbol) {
  return ATOMIC_MASSES[symbol] || COMMON_MASSES[symbol] || 0;
}

/**
 * Parses a chemical formula string and returns atom breakdown and molar mass.
 * Supports parenthesis, brackets, and hydrate dots (e.g. CuSO4*5H2O or Ca(OH)2)
 */
export function parseFormula(formulaStr) {
  if (!formulaStr || typeof formulaStr !== 'string') {
    throw new Error('Invalid formula string');
  }

  const cleanFormula = formulaStr.trim();
  if (!cleanFormula) {
    throw new Error('Formula cannot be empty');
  }

  // Handle hydrate dot like CuSO4*5H2O or CuSO4.5H2O
  const parts = cleanFormula.split(/[\*\·\.]/);
  const totalCounts = {};

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part) continue;

    // Check if part starts with a coefficient number (e.g. "5H2O")
    const match = part.match(/^(\d+)?(.+)$/);
    if (!match) continue;

    const coefficient = match[1] ? parseInt(match[1], 10) : 1;
    const subFormula = match[2];

    const subCounts = parseSubFormula(subFormula);
    for (const [elem, count] of Object.entries(subCounts)) {
      totalCounts[elem] = (totalCounts[elem] || 0) + count * coefficient;
    }
  }

  // Calculate molar mass and elemental mass percentages
  let molarMass = 0;
  const breakdown = [];

  for (const [symbol, count] of Object.entries(totalCounts)) {
    const atomicMass = getElementMass(symbol);
    if (atomicMass === 0) {
      throw new Error(`Unknown element symbol: ${symbol}`);
    }
    const elementTotalMass = atomicMass * count;
    molarMass += elementTotalMass;

    breakdown.push({
      symbol,
      count,
      atomicMass,
      totalMass: elementTotalMass,
      percentage: 0 // Will be calculated after total molar mass is known
    });
  }

  if (molarMass === 0) {
    throw new Error('Could not calculate molar mass for formula');
  }

  breakdown.forEach(item => {
    item.percentage = (item.totalMass / molarMass) * 100;
  });

  return {
    formula: cleanFormula,
    molarMass,
    counts: totalCounts,
    breakdown
  };
}

function parseSubFormula(formula) {
  const counts = {};
  const stack = [{}];

  let i = 0;
  while (i < formula.length) {
    const char = formula[i];

    if (char === '(' || char === '[' || char === '{') {
      stack.push({});
      i++;
    } else if (char === ')' || char === ']' || char === '}') {
      if (stack.length <= 1) {
        throw new Error('Unmatched closing bracket in formula');
      }
      i++;
      // Parse optional multiplier number after closing bracket
      let numStr = '';
      while (i < formula.length && /\d/.test(formula[i])) {
        numStr += formula[i];
        i++;
      }
      const multiplier = numStr ? parseInt(numStr, 10) : 1;
      const top = stack.pop();
      const currentScope = stack[stack.length - 1];

      for (const [symbol, count] of Object.entries(top)) {
        currentScope[symbol] = (currentScope[symbol] || 0) + count * multiplier;
      }
    } else if (/[A-Z]/.test(char)) {
      // Element symbol starts with uppercase letter
      let symbol = char;
      i++;
      if (i < formula.length && /[a-z]/.test(formula[i])) {
        symbol += formula[i];
        i++;
      }
      // Parse element count multiplier
      let numStr = '';
      while (i < formula.length && /\d/.test(formula[i])) {
        numStr += formula[i];
        i++;
      }
      const count = numStr ? parseInt(numStr, 10) : 1;
      const currentScope = stack[stack.length - 1];
      currentScope[symbol] = (currentScope[symbol] || 0) + count;
    } else {
      i++; // Skip invalid chars or whitespace
    }
  }

  if (stack.length !== 1) {
    throw new Error('Unmatched opening bracket in formula');
  }

  return stack[0];
}
