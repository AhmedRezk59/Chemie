import { ELEMENTS, CATEGORY_COLORS } from '../data/elements.js';
import { COMPOUNDS } from '../data/compounds.js';
import { GHS_HAZARDS } from '../data/hazards.js';
import { parseFormula } from './formulaParser.js';
import { calculateStoichiometry } from './stoichiometry.js';
import { calculateHFromPH, calculateDilution } from './phCalculator.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initPeriodicTable();
  initCompoundAnalyzer();
  initStoichiometry();
  initPHCalculator();
  initGHSHazards();
});

// Navigation
function initNavigation() {
  const buttons = document.querySelectorAll('.nav-btn');
  const views = document.querySelectorAll('.view');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;

      buttons.forEach(b => b.classList.remove('active'));
      views.forEach(v => v.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });
}

// Periodic Table
function initPeriodicTable() {
  const grid = document.getElementById('periodic-table');
  const legend = document.getElementById('legend-container');

  // Legend
  const categoryNames = {
    "alkali-metal": "Alkali Metal",
    "alkaline-earth": "Alkaline Earth",
    "transition-metal": "Transition Metal",
    "post-transition": "Post-Transition",
    "metalloid": "Metalloid",
    "reactive-nonmetal": "Reactive Nonmetal",
    "noble-gas": "Noble Gas",
    "lanthanide": "Lanthanide",
    "actinide": "Actinide"
  };

  Object.entries(CATEGORY_COLORS).forEach(([cat, color]) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<span class="legend-color" style="background-color: ${color};"></span><span>${categoryNames[cat] || cat}</span>`;
    legend.appendChild(item);
  });

  // Render elements in grid (Period 1 to 7, Group 1 to 18)
  ELEMENTS.forEach(el => {
    const cell = document.createElement('div');
    cell.className = `element-cell category-${el.category}`;
    cell.style.gridColumn = el.group;
    cell.style.gridRow = el.period;

    cell.innerHTML = `
      <span class="element-number">${el.number}</span>
      <span class="element-symbol">${el.symbol}</span>
      <span class="element-name">${el.name}</span>
    `;

    cell.addEventListener('click', () => showElementModal(el));
    grid.appendChild(cell);
  });

  // Modal event listeners
  const modal = document.getElementById('element-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
}

function showElementModal(el) {
  const modal = document.getElementById('element-modal');
  const body = document.getElementById('modal-body');

  body.innerHTML = `
    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
      <div style="background-color: var(--bg-primary); padding: 1rem 1.5rem; border-radius: 0.5rem; text-align: center; border: 2px solid ${CATEGORY_COLORS[el.category] || 'var(--border-color)'};">
        <span style="font-size: 0.85rem; color: var(--text-secondary); display: block;">${el.number}</span>
        <span style="font-size: 2rem; font-weight: 700; color: var(--text-primary);">${el.symbol}</span>
        <span style="font-size: 0.85rem; color: var(--accent-color); display: block;">${el.mass} g/mol</span>
      </div>
      <div>
        <h2 style="margin: 0; color: var(--text-primary);">${el.name}</h2>
        <span class="badge" style="margin-top: 0.25rem;">${el.category.replace('-', ' ')}</span>
        <p style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">${el.summary}</p>
      </div>
    </div>

    <table class="table">
      <tbody>
        <tr><th>Atomic Number</th><td>${el.number}</td></tr>
        <tr><th>Atomic Mass</th><td>${el.mass} u</td></tr>
        <tr><th>Standard State</th><td>${el.state}</td></tr>
        <tr><th>Electron Configuration</th><td>${el.electronConfiguration}</td></tr>
        <tr><th>Electronegativity (Pauling)</th><td>${el.electronegativity !== null ? el.electronegativity : 'N/A'}</td></tr>
        <tr><th>Atomic Radius</th><td>${el.atomicRadius} pm</td></tr>
        <tr><th>Density</th><td>${el.density} g/cm³</td></tr>
        <tr><th>Melting Point</th><td>${el.meltingPoint} K</td></tr>
        <tr><th>Boiling Point</th><td>${el.boilingPoint} K</td></tr>
        <tr><th>Discovered By</th><td>${el.discoveredBy} (${el.year > 0 ? el.year : Math.abs(el.year) + ' BC'})</td></tr>
      </tbody>
    </table>
  `;

  modal.classList.add('active');
}

// Compound Analyzer
function initCompoundAnalyzer() {
  const input = document.getElementById('formula-input');
  const btn = document.getElementById('analyze-btn');
  const resultsDiv = document.getElementById('analyzer-results');
  const presetsContainer = document.getElementById('compound-preset-list');

  const runAnalysis = () => {
    try {
      const parsed = parseFormula(input.value);
      resultsDiv.innerHTML = `
        <div style="background-color: var(--bg-primary); padding: 1rem; border-radius: 0.5rem; border: 1px solid var(--border-color);">
          <h3 style="color: var(--accent-color); margin-bottom: 0.5rem;">Formula: ${parsed.formula}</h3>
          <p><strong>Molar Mass:</strong> ${parsed.molarMass.toFixed(3)} g/mol</p>

          <h4 style="margin-top: 1rem; margin-bottom: 0.5rem;">Elemental Mass Composition:</h4>
          <table class="table">
            <thead>
              <tr>
                <th>Element</th>
                <th>Atom Count</th>
                <th>Atomic Mass</th>
                <th>Total Mass (g/mol)</th>
                <th>Mass %</th>
              </tr>
            </thead>
            <tbody>
              ${parsed.breakdown.map(item => `
                <tr>
                  <td><strong>${item.symbol}</strong></td>
                  <td>${item.count}</td>
                  <td>${item.atomicMass.toFixed(3)}</td>
                  <td>${item.totalMass.toFixed(3)}</td>
                  <td>${item.percentage.toFixed(2)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      resultsDiv.innerHTML = `<p style="color: #ef4444;">Error: ${err.message}</p>`;
    }
  };

  btn.addEventListener('click', runAnalysis);
  runAnalysis(); // Initial run

  // Render presets
  COMPOUNDS.forEach(comp => {
    const card = document.createElement('div');
    card.style.cssText = 'background-color: var(--bg-primary); padding: 0.75rem 1rem; border-radius: 0.5rem; margin-bottom: 0.75rem; border: 1px solid var(--border-color); cursor: pointer; transition: border-color 0.2s;';
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <strong style="color: var(--accent-color);">${comp.name} (${comp.formula})</strong>
        <span style="font-size: 0.85rem; color: var(--text-secondary);">${comp.molarMass} g/mol</span>
      </div>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">${comp.description}</p>
    `;
    card.addEventListener('click', () => {
      input.value = comp.formula;
      runAnalysis();
    });
    presetsContainer.appendChild(card);
  });
}

// Stoichiometry
function initStoichiometry() {
  const reactantsInput = document.getElementById('reactants-input');
  const productsInput = document.getElementById('products-input');
  const givenMassInput = document.getElementById('given-mass');
  const btn = document.getElementById('calc-stoich-btn');
  const resultsDiv = document.getElementById('stoich-results');

  const calculate = () => {
    try {
      const reactants = reactantsInput.value.split(',').map(s => s.trim()).filter(Boolean);
      const products = productsInput.value.split(',').map(s => s.trim()).filter(Boolean);
      const mass = parseFloat(givenMassInput.value) || 0;

      const res = calculateStoichiometry(reactants, products, 0, mass);

      resultsDiv.innerHTML = `
        <div style="background-color: var(--bg-primary); padding: 1rem; border-radius: 0.5rem; border: 1px solid var(--border-color);">
          <h3 style="color: var(--accent-color); margin-bottom: 0.5rem;">Reaction Stoichiometry Results</h3>
          <p style="margin-bottom: 1rem;">Based on <strong>${res.givenMassGrams}g</strong> of key reactant <strong>${res.keyReactant.formula}</strong>:</p>

          <h4 style="color: var(--text-primary);">Reactants Required:</h4>
          <table class="table" style="margin-bottom: 1.5rem;">
            <thead>
              <tr><th>Coefficient</th><th>Formula</th><th>Moles Needed</th><th>Mass Required (g)</th></tr>
            </thead>
            <tbody>
              ${res.reactants.map(r => `
                <tr>
                  <td>${r.coefficient}</td>
                  <td><strong>${r.formula}</strong></td>
                  <td>${r.moles.toFixed(4)} mol</td>
                  <td>${r.massGrams.toFixed(2)} g</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h4 style="color: var(--text-primary);">Theoretical Product Yields:</h4>
          <table class="table">
            <thead>
              <tr><th>Coefficient</th><th>Formula</th><th>Moles Produced</th><th>Theoretical Yield (g)</th></tr>
            </thead>
            <tbody>
              ${res.products.map(p => `
                <tr>
                  <td>${p.coefficient}</td>
                  <td><strong>${p.formula}</strong></td>
                  <td>${p.moles.toFixed(4)} mol</td>
                  <td><strong>${p.massGrams.toFixed(2)} g</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      resultsDiv.innerHTML = `<p style="color: #ef4444;">Error: ${err.message}</p>`;
    }
  };

  btn.addEventListener('click', calculate);
  calculate();
}

// pH Calculator
function initPHCalculator() {
  const phInput = document.getElementById('ph-input');
  const phBtn = document.getElementById('calc-ph-btn');
  const phResults = document.getElementById('ph-results');

  const updatePH = () => {
    const val = parseFloat(phInput.value);
    if (isNaN(val) || val < 0 || val > 14) {
      phResults.innerHTML = `<p style="color: #ef4444;">Please enter a pH value between 0 and 14.</p>`;
      return;
    }
    const res = calculateHFromPH(val);
    const state = val < 7 ? 'Acidic 🍋' : val === 7 ? 'Neutral 💧' : 'Basic / Alkaline 🧼';

    phResults.innerHTML = `
      <div style="background-color: var(--bg-primary); padding: 1rem; border-radius: 0.5rem; border: 1px solid var(--border-color);">
        <h3 style="color: var(--accent-color); margin-bottom: 0.5rem;">Solution Character: ${state}</h3>
        <p><strong>pH:</strong> ${res.pH.toFixed(2)}</p>
        <p><strong>pOH:</strong> ${res.pOH.toFixed(2)}</p>
        <p><strong>[H⁺] Concentration:</strong> ${res.hConcentration.toExponential(4)} M</p>
        <p><strong>[OH⁻] Concentration:</strong> ${res.ohConcentration.toExponential(4)} M</p>
      </div>
    `;
  };

  phBtn.addEventListener('click', updatePH);
  updatePH();

  // Dilution calculator
  const c1Input = document.getElementById('c1');
  const v1Input = document.getElementById('v1');
  const c2Input = document.getElementById('c2');
  const v2Input = document.getElementById('v2');
  const dilutionBtn = document.getElementById('calc-dilution-btn');
  const dilutionResults = document.getElementById('dilution-results');

  dilutionBtn.addEventListener('click', () => {
    try {
      const c1 = parseFloat(c1Input.value) || null;
      const v1 = parseFloat(v1Input.value) || null;
      const c2 = parseFloat(c2Input.value) || null;
      const v2 = parseFloat(v2Input.value) || null;

      const res = calculateDilution({ c1, v1, c2, v2 });
      if (res.solved === 'v2') {
        v2Input.value = res.v2.toFixed(4);
        dilutionResults.innerHTML = `<p style="color: var(--accent-color);">Target Volume V2 = <strong>${res.v2.toFixed(4)} L</strong></p>`;
      } else if (res.solved === 'c2') {
        c2Input.value = res.c2.toFixed(4);
        dilutionResults.innerHTML = `<p style="color: var(--accent-color);">Target Concentration C2 = <strong>${res.c2.toFixed(4)} M</strong></p>`;
      } else if (res.solved === 'v1') {
        v1Input.value = res.v1.toFixed(4);
        dilutionResults.innerHTML = `<p style="color: var(--accent-color);">Initial Volume V1 = <strong>${res.v1.toFixed(4)} L</strong></p>`;
      } else if (res.solved === 'c1') {
        c1Input.value = res.c1.toFixed(4);
        dilutionResults.innerHTML = `<p style="color: var(--accent-color);">Initial Concentration C1 = <strong>${res.c1.toFixed(4)} M</strong></p>`;
      }
    } catch (err) {
      dilutionResults.innerHTML = `<p style="color: #ef4444;">Error: ${err.message}</p>`;
    }
  });
}

// GHS Hazards
function initGHSHazards() {
  const grid = document.getElementById('ghs-hazard-grid');
  GHS_HAZARDS.forEach(h => {
    const card = document.createElement('div');
    card.style.cssText = 'background-color: var(--bg-primary); padding: 1.25rem; border-radius: 0.5rem; border: 1px solid var(--border-color);';
    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
        <span style="font-size: 2rem;">${h.symbol}</span>
        <div>
          <h3 style="margin: 0; color: var(--text-primary); font-size: 1.1rem;">${h.code}: ${h.name}</h3>
          <span class="badge" style="background-color: #ef444422; color: #f87171;">Signal: ${h.signalWord}</span>
        </div>
      </div>
      <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">${h.description}</p>
      <p style="font-size: 0.85rem; color: var(--accent-color);"><strong>Examples:</strong> ${h.examples}</p>
    `;
    grid.appendChild(card);
  });
}
