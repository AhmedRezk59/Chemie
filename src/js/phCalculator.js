/**
 * Solution & pH Calculations
 */

export function calculatePHFromH(hConcentration) {
  if (hConcentration <= 0) return { pH: 14, pOH: 0, ohConcentration: 1e-14 };
  const pH = -Math.log10(hConcentration);
  const pOH = 14 - pH;
  const ohConcentration = Math.pow(10, -pOH);
  return { pH, pOH, hConcentration, ohConcentration };
}

export function calculateHFromPH(pH) {
  const hConcentration = Math.pow(10, -pH);
  const pOH = 14 - pH;
  const ohConcentration = Math.pow(10, -pOH);
  return { pH, pOH, hConcentration, ohConcentration };
}

export function calculateDilution({ c1, v1, c2, v2 }) {
  // C1 * V1 = C2 * V2
  if (c1 && v1 && c2 && !v2) {
    return { v2: (c1 * v1) / c2, solved: 'v2' };
  }
  if (c1 && v1 && !c2 && v2) {
    return { c2: (c1 * v1) / v2, solved: 'c2' };
  }
  if (c1 && !v1 && c2 && v2) {
    return { v1: (c2 * v2) / c1, solved: 'v1' };
  }
  if (!c1 && v1 && c2 && v2) {
    return { c1: (c2 * v2) / v1, solved: 'c1' };
  }
  throw new Error('Please provide 3 out of 4 dilution parameters.');
}
