'use strict';

/**
 * Maps extracted CSS values to the nearest Tailwind CSS scale token.
 * Falls back to Tailwind arbitrary-value syntax `[value]` when no
 * named token is close enough.
 *
 * Rules:
 * - Spacing / sizing: nearest step in the default Tailwind spacing scale.
 * - Border radius: nearest step in the default Tailwind rounded scale.
 * - Colors: direct hex pass-through (Tailwind JIT handles arbitrary colors).
 */

/** Default Tailwind spacing scale: token name → px value */
const SPACING_SCALE = Object.freeze({
  '0':   0,
  'px':  1,
  '0.5': 2,
  '1':   4,
  '1.5': 6,
  '2':   8,
  '2.5': 10,
  '3':   12,
  '3.5': 14,
  '4':   16,
  '5':   20,
  '6':   24,
  '7':   28,
  '8':   32,
  '9':   36,
  '10':  40,
  '11':  44,
  '12':  48,
  '14':  56,
  '16':  64,
  '20':  80,
  '24':  96,
  '28':  112,
  '32':  128,
  '36':  144,
  '40':  160,
  '44':  176,
  '48':  192,
  '52':  208,
  '56':  224,
  '60':  240,
  '64':  256,
  '72':  288,
  '80':  320,
  '96':  384,
});

/** Default Tailwind border-radius scale: token name → px value */
const RADIUS_SCALE = Object.freeze({
  'none':  0,
  'sm':    2,
  '':      4,   // `rounded` with no suffix
  'md':    6,
  'lg':    8,
  'xl':    12,
  '2xl':   16,
  '3xl':   24,
  'full':  9999,
});

/** Default Tailwind max-width scale: token name → px value */
const MAX_WIDTH_SCALE = Object.freeze({
  'xs':   320,
  'sm':   384,
  'md':   448,
  'lg':   512,
  'xl':   576,
  '2xl':  672,
  '3xl':  768,
  '4xl':  896,
  '5xl':  1024,
  '6xl':  1152,
  '7xl':  1280,
});

/**
 * Parses a CSS length string and returns the value in pixels.
 * Handles px, rem (assuming 16px base), and bare numbers.
 * Returns null for unparseable strings.
 * @param {string|number} value
 * @returns {number|null}
 */
function toPx(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  const str = String(value).trim();
  if (str === '0') return 0;
  const pxMatch  = str.match(/^([\d.]+)px$/);
  if (pxMatch)  return parseFloat(pxMatch[1]);
  const remMatch = str.match(/^([\d.]+)rem$/);
  if (remMatch) return parseFloat(remMatch[1]) * 16;
  const numMatch = str.match(/^[\d.]+$/);
  if (numMatch) return parseFloat(str);
  return null;
}

/**
 * Finds the nearest token name in a scale object for a given px value.
 * Uses a tolerance of 10% of the input value (minimum 1px).
 * @param {number} px
 * @param {Object} scale - { tokenName: pxValue }
 * @returns {{ name: string, exact: boolean } | null}
 */
function nearestToken(px, scale) {
  let bestName = null;
  let bestDist = Infinity;

  for (const [name, scalePx] of Object.entries(scale)) {
    const dist = Math.abs(px - scalePx);
    if (dist < bestDist) {
      bestDist = dist;
      bestName = name;
    }
  }

  if (bestName === null) return null;
  const tolerance = Math.max(1, px * 0.10);
  return { name: bestName, exact: bestDist <= tolerance };
}

/**
 * Maps a CSS length value to a Tailwind spacing class suffix.
 * Returns the nearest named token (e.g. '4' for 16px) or falls
 * back to arbitrary syntax (e.g. '[18px]').
 * @param {string|number} value
 * @returns {string} - Token suffix, e.g. '4', '0.5', or '[18px]'
 */
function spacingToken(value) {
  const px = toPx(value);
  if (px === null) return `[${value}]`;
  if (px === 0) return '0';
  const result = nearestToken(px, SPACING_SCALE);
  if (result && result.exact) return result.name;
  return `[${typeof value === 'string' && value.includes('px') ? value : `${px}px`}]`;
}

/**
 * Maps a CSS border-radius value to a Tailwind rounded class suffix.
 * @param {string|number} value
 * @returns {string} - Suffix, e.g. 'md', 'lg', 'full', or '[10px]'
 */
function radiusToken(value) {
  const px = toPx(value);
  if (px === null) return `[${value}]`;
  if (px === 0) return 'none';
  const result = nearestToken(px, RADIUS_SCALE);
  if (result && result.exact) return result.name;
  return `[${typeof value === 'string' && value.includes('px') ? value : `${px}px`}]`;
}

/**
 * Maps a CSS max-width value to a Tailwind max-w class suffix.
 * @param {string|number} value
 * @returns {string} - Suffix, e.g. '7xl', '5xl', or '[1400px]'
 */
function maxWidthToken(value) {
  const px = toPx(value);
  if (px === null) return `[${value}]`;
  const result = nearestToken(px, MAX_WIDTH_SCALE);
  if (result && result.exact) return result.name;
  return `[${typeof value === 'string' && value.includes('px') ? value : `${px}px`}]`;
}

/**
 * Builds a Tailwind padding class from a CSS padding value.
 * Handles shorthand (single value) only; for full shorthand parsing
 * return the arbitrary-value form.
 * @param {string|number} value
 * @returns {string} - Full class, e.g. 'p-4', 'px-6', 'p-[18px]'
 */
function paddingClass(value) {
  const token = spacingToken(value);
  return `p-${token}`;
}

/**
 * Builds a Tailwind gap class from a CSS gap value.
 * @param {string|number} value
 * @returns {string}
 */
function gapClass(value) {
  const token = spacingToken(value);
  return `gap-${token}`;
}

/**
 * Builds a Tailwind rounded class from a CSS border-radius value.
 * @param {string|number} value
 * @returns {string}
 */
function roundedClass(value) {
  const suffix = radiusToken(value);
  return suffix === 'none' ? 'rounded-none' : suffix === '' ? 'rounded' : `rounded-${suffix}`;
}

module.exports = {
  toPx,
  spacingToken,
  radiusToken,
  maxWidthToken,
  paddingClass,
  gapClass,
  roundedClass,
};
