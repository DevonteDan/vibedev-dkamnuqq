/**
 * Pet Age Translator — script.js
 * Client-side only, stateless (no localStorage/cookie/network)
 * All formulas and life-stage data stored as config objects (NFR-6)
 */

'use strict';

/* ── CONFIG DATA (separated from rendering logic per NFR-6) ── */

/** @type {Record<string, {maxAge: number, toHuman: function(number): number}>} */
const SPECIES_CONFIG = {
  dog: {
    maxAge: 25,
    /**
     * Dog formula (FR-3):
     *   Year 1 = 15 human years
     *   Year 2 = +9 (total 24)
     *   Year 3+ = +5 per year
     * Supports fractional interpolation.
     */
    toHuman(age) {
      if (age <= 0) return 0;
      if (age <= 1) return age * 15;
      if (age <= 2) return 15 + (age - 1) * 9;
      return 24 + (age - 2) * 5;
    },
  },
  cat: {
    maxAge: 25,
    /**
     * Cat formula (FR-3):
     *   Year 1 = 15, Year 2 = +9 (total 24), Year 3+ = +4 per year
     */
    toHuman(age) {
      if (age <= 0) return 0;
      if (age <= 1) return age * 15;
      if (age <= 2) return 15 + (age - 1) * 9;
      return 24 + (age - 2) * 4;
    },
  },
  rabbit: {
    maxAge: 12,
    /**
     * Rabbit formula (FR-3):
     *   Year 1 = 10, Year 2+ = +8 per year
     */
    toHuman(age) {
      if (age <= 0) return 0;
      if (age <= 1) return age * 10;
      return 10 + (age - 1) * 8;
    },
  },
  hamster: {
    maxAge: 4,
    /**
     * Hamster formula (FR-3):
     *   Year 1 = 20, Year 2+ = +18 per year
     */
    toHuman(age) {
      if (age <= 0) return 0;
      if (age <= 1) return age * 20;
      return 20 + (age - 1) * 18;
    },
  },
  parrot: {
    maxAge: 80,
    /**
     * Parrot formula (FR-3):
     *   Year 1 = 5, Year 2+ = +2.5 per year
     */
    toHuman(age) {
      if (age <= 0) return 0;
      if (age <= 1) return age * 5;
      return 5 + (age - 1) * 2.5;
    },
  },
};

/** @type {Array<{min: number, max: number, stage: string, group: 'young'|'mid'|'senior', phrase: string}>} */
const LIFE_STAGES = [
  { min: 0,  max: 2,  stage: 'Newborn',      group: 'young',  phrase: 'still figuring out the world!'    },
  { min: 3,  max: 12, stage: 'Toddler',       group: 'young',  phrase: 'curious and full of energy!'      },
  { min: 13, max: 19, stage: 'Teenager',      group: 'mid',    phrase: 'testing all the boundaries!'      },
  { min: 20, max: 34, stage: 'Young Adult',   group: 'mid',    phrase: 'peak adulting!'                   },
  { min: 35, max: 54, stage: 'Middle-Aged',   group: 'mid',    phrase: 'wise and settled!'                },
  { min: 55, max: 74, stage: 'Senior',        group: 'senior', phrase: 'earned every gray hair!'          },
  { min: 75, max: Infinity, stage: 'Elder',   group: 'senior', phrase: 'a true legend!'                   },
];

/** Color map for life-stage groups */
const STAGE_COLORS = {
  young:  'var(--stage-young)',
  mid:    'var(--stage-mid)',
  senior: 'var(--stage-senior)',
};

/**
 * Inline SVG icons for life stages (per Design.md §6)
 * Returns SVG string — displayed via innerHTML on trusted data (not user input)
 */
const STAGE_ICONS = {
  'Newborn': `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="2" fill="currentColor"/>
    <line x1="10" y1="3" x2="10" y2="6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="10" y1="14" x2="10" y2="17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="3" y1="10" x2="6" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  'Toddler': `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="7" y="11" width="6" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/>
    <rect x="8" y="5" width="5" height="4.5" rx="1" stroke="currentColor" stroke-width="1.5"/>
  </svg>`,
  'Teenager': `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12 L7 7 L11 12 L15 7 L18 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  'Young Adult': `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 15 L13 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M8 6 L14 6 L14 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  'Middle-Aged': `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="4" y1="10" x2="16" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5"/>
  </svg>`,
  'Senior': `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 13 Q10 6 17 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M6 13 Q10 9 14 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  'Elder': `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 4 C7 6 4 9 5 12 C6 15 10 16 10 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M10 4 C13 6 16 9 15 12 C14 15 10 16 10 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
};

/* ── STATE ── */
const state = {
  species: 'dog',
  age: null,  // null = empty, number = valid age
};

/* ── DOM ELEMENTS ── */
const ageInput     = /** @type {HTMLInputElement} */ (document.getElementById('age-input'));
const resultEmpty  = document.getElementById('result-empty');
const resultContent = document.getElementById('result-content');
const resultNumber = document.getElementById('result-number');
const resultUnderline = document.getElementById('result-underline');
const stageBadge   = document.getElementById('stage-badge');
const badgeIcon    = document.getElementById('badge-icon');
const badgeText    = document.getElementById('badge-text');
const flavourText  = document.getElementById('flavour-text');
const btnDecrease  = document.getElementById('btn-decrease');
const btnIncrease  = document.getElementById('btn-increase');

/* ── COUNT-UP ANIMATION STATE ── */
let countUpRaf = null;
let currentDisplayedValue = 0;

/**
 * Eased count-up animation for the hero number.
 * Calculation is instant; only the visual display is animated.
 * @param {number} targetValue - The final integer value to display
 */
function animateCountUp(targetValue) {
  if (countUpRaf) {
    cancelAnimationFrame(countUpRaf);
    countUpRaf = null;
  }

  const startValue = currentDisplayedValue;
  const diff = targetValue - startValue;
  const duration = Math.min(600, Math.max(200, Math.abs(diff) * 15)); // 200–600ms
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startValue + diff * eased);
    resultNumber.textContent = current;
    currentDisplayedValue = current;

    if (progress < 1) {
      countUpRaf = requestAnimationFrame(step);
    } else {
      resultNumber.textContent = targetValue;
      currentDisplayedValue = targetValue;
      countUpRaf = null;
      // Micro-underline sweep
      triggerSweepUnderline();
    }
  }

  countUpRaf = requestAnimationFrame(step);
}

/** Trigger the accent micro-underline sweep below the hero number */
function triggerSweepUnderline() {
  resultUnderline.classList.remove('is-sweeping');
  // Force reflow to restart animation
  void resultUnderline.offsetWidth;
  resultUnderline.classList.add('is-sweeping');
}

/**
 * Get life-stage config for a given human age.
 * @param {number} humanAge
 */
function getLifeStage(humanAge) {
  for (const stage of LIFE_STAGES) {
    if (humanAge >= stage.min && humanAge <= stage.max) return stage;
  }
  return LIFE_STAGES[LIFE_STAGES.length - 1]; // fallback: Elder
}

/**
 * Build grammatically correct flavour sentence (FR-6).
 * Avoids "1-years-old" etc.
 * @param {number} petAge
 * @param {string} species
 * @param {number} humanAge
 * @param {string} stagePhrase
 */
function buildFlavourText(petAge, species, humanAge, stagePhrase) {
  // Sanitize: use only numeric values, textContent-safe strings
  const ageStr = Number.isInteger(petAge) ? String(petAge) : petAge.toFixed(1);
  const yearWord = petAge === 1 ? 'year' : 'years';
  const humanAgeStr = String(humanAge);
  const speciesName = String(species); // already constrained to known keys
  const speciesCapitalized = speciesName.charAt(0).toUpperCase() + speciesName.slice(1);

  return `Your ${ageStr}-${yearWord}-old ${speciesCapitalized} is basically a ${humanAgeStr}-year-old human\u00A0\u2014\u00A0${stagePhrase}`;
}

/* ── RENDER ── */
let isFirstReveal = true;
let previousStage = null;

/**
 * Main render function — called whenever state changes.
 * Calculation is synchronous/instant; only animations take time.
 */
function render() {
  const { species, age } = state;

  // ── Empty state ──
  if (age === null || age === '') {
    resultEmpty.style.display = '';
    resultContent.setAttribute('aria-hidden', 'true');
    resultContent.style.display = 'none';
    isFirstReveal = true;
    currentDisplayedValue = 0;
    return;
  }

  // ── Calculate (instant) ──
  const config = SPECIES_CONFIG[species];
  const humanAgeFloat = config.toHuman(Number(age));
  const humanAge = Math.round(humanAgeFloat);
  const lifeStage = getLifeStage(humanAge);

  // ── Show result area ──
  resultEmpty.style.display = 'none';
  resultContent.style.display = 'flex';
  resultContent.removeAttribute('aria-hidden');

  // Staggered reveal on first show
  if (isFirstReveal) {
    isFirstReveal = false;
    resultContent.classList.remove('is-revealing');
    void resultContent.offsetWidth;
    resultContent.classList.add('is-revealing');
    // Remove class after animations complete
    setTimeout(() => resultContent.classList.remove('is-revealing'), 600);
  }

  // ── Animate hero number ──
  animateCountUp(humanAge);

  // ── Update badge ──
  const stageChanged = lifeStage.stage !== previousStage;
  previousStage = lifeStage.stage;

  stageBadge.style.background = STAGE_COLORS[lifeStage.group];

  // Set badge text (textContent only — no injection risk)
  badgeText.textContent = lifeStage.stage;

  // Set badge icon (trusted SVG from static config, not user input)
  badgeIcon.innerHTML = STAGE_ICONS[lifeStage.stage] || '';

  if (stageChanged) {
    badgeIcon.classList.remove('is-rotating');
    void badgeIcon.offsetWidth;
    badgeIcon.classList.add('is-rotating');
  }

  // ── Update flavour text ──
  const petAge = Number(age);
  // textContent prevents XSS — safe for sanitized input
  flavourText.textContent = buildFlavourText(petAge, species, humanAge, lifeStage.phrase);
}

/* ── SPECIES SELECTION ── */

/**
 * Select a species — updates state, aria-pressed, and visual indicator.
 * @param {string} newSpecies
 */
function selectSpecies(newSpecies) {
  if (newSpecies === state.species) return; // no-op if same (FR edge case)

  // Update previous selection
  const prevBtn = document.getElementById(`btn-${state.species}`);
  if (prevBtn) {
    prevBtn.setAttribute('aria-pressed', 'false');
    prevBtn.closest('.species-item').classList.remove('is-selected');
  }

  state.species = newSpecies;

  // Update new selection
  const newBtn = document.getElementById(`btn-${newSpecies}`);
  if (newBtn) {
    newBtn.setAttribute('aria-pressed', 'true');
    newBtn.closest('.species-item').classList.add('is-selected');
  }

  // Clamp age to new species max (FR edge case: switch species when age > new max)
  const config = SPECIES_CONFIG[newSpecies];
  if (state.age !== null && state.age > config.maxAge) {
    state.age = config.maxAge;
    ageInput.value = String(config.maxAge);
  }

  // Update max attribute
  ageInput.setAttribute('max', String(config.maxAge));

  render();
}

/** Animate button tap (scale bounce) */
function animateButtonTap(btn) {
  btn.classList.remove('is-pressing', 'is-bouncing');
  void btn.offsetWidth;
  btn.classList.add('is-pressing');
  requestAnimationFrame(() => {
    setTimeout(() => {
      btn.classList.remove('is-pressing');
      btn.classList.add('is-bouncing');
      setTimeout(() => {
        btn.classList.remove('is-bouncing');
      }, 150);
    }, 80);
  });
}

// Attach species button listeners
document.querySelectorAll('.species-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const newSpecies = btn.getAttribute('data-species');
    animateButtonTap(btn);
    selectSpecies(newSpecies);
  });

  // Keyboard: Enter/Space already handled natively by button role
});

// Set initial selected state visually
document.getElementById('btn-dog').closest('.species-item').classList.add('is-selected');

/* ── AGE INPUT HANDLING ── */

/**
 * Parse and validate age input.
 * Returns clamped number or null for empty.
 * @param {string} raw
 * @param {string} species
 * @returns {number|null}
 */
function parseAge(raw, species) {
  if (raw === '' || raw === null) return null;

  let val = parseFloat(raw);

  // Non-numeric or NaN
  if (isNaN(val)) return null;

  // Clamp negative to 0
  if (val < 0) val = 0;

  // Clamp to species max
  const max = SPECIES_CONFIG[species].maxAge;
  if (val > max) val = max;

  return val;
}

ageInput.addEventListener('input', () => {
  const parsed = parseAge(ageInput.value, state.species);
  state.age = parsed;

  // If we clamped, update input visually
  if (parsed !== null && parsed !== parseFloat(ageInput.value)) {
    ageInput.value = String(parsed);
  }

  render();
});

// Handle blur: if negative typed and not caught by input event (some browsers)
ageInput.addEventListener('blur', () => {
  if (ageInput.value !== '' && parseFloat(ageInput.value) < 0) {
    ageInput.value = '0';
    state.age = 0;
    render();
  }
});

/* ── STEPPERS ── */

function stepAge(direction) {
  const current = state.age === null ? 0 : Number(state.age);
  const config = SPECIES_CONFIG[state.species];
  let next = current + direction;

  // Clamp
  if (next < 0) next = 0;
  if (next > config.maxAge) next = config.maxAge;

  // Round to 1 decimal for display
  next = Math.round(next * 10) / 10;

  state.age = next;
  ageInput.value = Number.isInteger(next) ? String(next) : next.toFixed(1);
  render();
}

btnDecrease.addEventListener('click', () => stepAge(-1));
btnIncrease.addEventListener('click', () => stepAge(1));

// Keyboard support for steppers
btnDecrease.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stepAge(-1); }
});
btnIncrease.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stepAge(1); }
});

/* ── KEYBOARD: Arrow keys on age input ── */
ageInput.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp')   { e.preventDefault(); stepAge(1);  }
  if (e.key === 'ArrowDown') { e.preventDefault(); stepAge(-1); }
});

/* ── INIT ── */
(function init() {
  // Set Dog as selected by default (FR-1)
  const dogConfig = SPECIES_CONFIG['dog'];
  ageInput.setAttribute('max', String(dogConfig.maxAge));
  ageInput.setAttribute('min', '0');
  ageInput.setAttribute('step', '1');

  // Empty state on load (FR-5: no default value shown, show friendly prompt)
  state.age = null;
  render();
})();
