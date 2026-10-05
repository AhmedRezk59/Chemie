# Scientific Chemical Properties Explorer (Chemie Explorer)

A comprehensive, interactive web application for exploring chemical elements, compound properties, stoichiometry, solution pH, and chemical hazard references.

## Features

- **Interactive Periodic Table of Elements**: Full grid view of chemical elements with color-coded classification categories (alkali metals, transition metals, noble gases, etc.) and rich element detail view.
- **Chemical Formula & Molar Mass Analyzer**: Parses complex chemical formulas (supports brackets, hydrates like `CuSO4*5H2O`, and parentheses like `Ca(OH)2`), computing molar mass and elemental mass percentage breakdown.
- **Reaction Stoichiometry Calculator**: Calculates mole ratios, required reactant masses, and theoretical product yields for chemical reactions.
- **pH & Solution Concentration Tool**: Calculates pH, pOH, $[H^+]$, and $[OH^-]$ concentrations alongside molarity dilution ($C_1 V_1 = C_2 V_2$).
- **GHS Chemical Hazard Reference**: Reference guide for Globally Harmonized System (GHS) safety pictograms, hazard classes, and signal words.

## Project Structure

```
├── index.html                # Main application interface
├── styles.css                # Application styles (Dark scientific UI design)
├── src/
│   ├── data/
│   │   ├── elements.js       # Periodic table elements data
│   │   ├── compounds.js      # Compound database & physical data
│   │   └── hazards.js        # GHS hazard pictograms & references
│   └── js/
│       ├── app.js            # Main application controller
│       ├── formulaParser.js  # Formula parser & molar mass engine
│       ├── stoichiometry.js  # Stoichiometry calculation engine
│       └── phCalculator.js   # pH & dilution calculation engine
└── tests/
    └── test_chemistry.js     # Unit test suite for chemical calculation engines
```

## Running Tests

Execute the unit tests using Node.js:

```bash
node tests/test_chemistry.js
```
