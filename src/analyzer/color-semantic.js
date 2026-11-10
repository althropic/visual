'use strict';

const chroma = require('chroma-js');

/**
 * Derives a semantic color palette (action, surface, text, success, warning, error, info)
 * from a raw palette array using hue/luminance heuristics.
 * @param {string|null} primary
 * @param {string|null} secondary
 * @param {string[]} palette
 * @returns {Object}
 */
function generateSemanticPalette(primary, secondary, palette) {
  const semantic = {
    action:  primary   || '#3b82f6',
    surface: '#ffffff',
    text:    '#000000',
    success: '#10b981',
    warning: '#f59e0b',
    error:   '#ef4444',
    info:    '#3b82f6',
  };

  if (!palette || palette.length === 0) return semantic;

  const colorObjects = palette.map(color => ({
    color,
    luminance: chroma(color).luminance(),
    hue: chroma(color).get('hsl.h'),
  }));

  // Lightest color → surface
  const lightest = [...colorObjects].sort((a, b) => b.luminance - a.luminance)[0];
  if (lightest && lightest.luminance > 0.8) semantic.surface = lightest.color;

  // Darkest color → text
  const darkest = [...colorObjects].sort((a, b) => a.luminance - b.luminance)[0];
  if (darkest && darkest.luminance < 0.2) semantic.text = darkest.color;

  // Green-ish → success
  const greens = colorObjects.filter(c =>
    c.hue >= 60 && c.hue <= 180 && c.luminance > 0.3 && c.luminance < 0.8
  );
  if (greens.length > 0) {
    semantic.success = greens.reduce((p, c) =>
      Math.abs(c.luminance - 0.5) < Math.abs(p.luminance - 0.5) ? c : p
    ).color;
  }

  // Yellow/orange → warning
  const yellows = colorObjects.filter(c =>
    c.hue >= 30 && c.hue <= 60 && c.luminance > 0.4
  );
  if (yellows.length > 0) {
    semantic.warning = yellows.reduce((p, c) =>
      Math.abs(c.luminance - 0.6) < Math.abs(p.luminance - 0.6) ? c : p
    ).color;
  }

  // Red-ish → error
  const reds = colorObjects.filter(c =>
    (c.hue >= 0 && c.hue <= 30 || c.hue >= 330) &&
    c.luminance > 0.3 && c.luminance < 0.7
  );
  if (reds.length > 0) {
    semantic.error = reds.reduce((p, c) =>
      Math.abs(c.luminance - 0.5) < Math.abs(p.luminance - 0.5) ? c : p
    ).color;
  }

  // Blue-ish → info, fallback to primary
  const blues = colorObjects.filter(c =>
    c.hue >= 180 && c.hue <= 240 && c.luminance > 0.3 && c.luminance < 0.7
  );
  if (blues.length > 0) {
    semantic.info = blues.reduce((p, c) =>
      Math.abs(c.luminance - 0.5) < Math.abs(p.luminance - 0.5) ? c : p
    ).color;
  } else if (primary) {
    semantic.info = primary;
  }

  return semantic;
}

module.exports = { generateSemanticPalette };
