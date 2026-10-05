import { parseFormula } from './formulaParser.js';

/**
 * Calculates stoichiometry yield and mole ratios for chemical reactions.
 * Example input:
 * Reactants: [{ formula: "2H2" }, { formula: "O2" }]
 * Products: [{ formula: "2H2O" }]
 */
export function calculateStoichiometry(reactantsInput, productsInput, givenReactantIndex = 0, givenMassGrams = 100) {
  const parseSpec = (entry) => {
    const trimmed = entry.trim();
    const match = trimmed.match(/^(\d+)?\s*(.+)$/);
    const coefficient = match && match[1] ? parseInt(match[1], 10) : 1;
    const formula = match ? match[2] : trimmed;
    const parsed = parseFormula(formula);
    return {
      coefficient,
      formula: parsed.formula,
      molarMass: parsed.molarMass
    };
  };

  const reactants = reactantsInput.map(parseSpec);
  const products = productsInput.map(parseSpec);

  const keyReactant = reactants[givenReactantIndex];
  if (!keyReactant) {
    throw new Error('Invalid key reactant selected');
  }

  // Moles of given reactant
  const molesGiven = givenMassGrams / keyReactant.molarMass;

  // Calculate yield for all reactants and products relative to key reactant
  const reactantResults = reactants.map(r => {
    const molesNeeded = molesGiven * (r.coefficient / keyReactant.coefficient);
    const massGrams = molesNeeded * r.molarMass;
    return {
      ...r,
      moles: molesNeeded,
      massGrams
    };
  });

  const productResults = products.map(p => {
    const molesProduced = molesGiven * (p.coefficient / keyReactant.coefficient);
    const massGrams = molesProduced * p.molarMass;
    return {
      ...p,
      moles: molesProduced,
      massGrams
    };
  });

  return {
    givenMassGrams,
    keyReactant,
    reactants: reactantResults,
    products: productResults
  };
}
