'use strict';

const chroma = require('chroma-js');
const { config } = require('../config');
const { generateScale, generateAdvancedScale } = require('./color-scales');
const { generateSemanticPalette } = require('./color-semantic');

/**
 * Extracts and clusters colors from element style data.
 * @param {Array} styleData
 * @returns {Object} color palette with scales and semantic roles
 */
function analyzeColors(styleData) {
  const colorCounts = {};

  styleData.forEach(item => {
    const colors = [item.styles.color, item.styles.backgroundColor, item.styles.borderColor];
    colors.forEach(color => {
      if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return;
      try {
        const hex = chroma(color).hex();
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      } catch (_e) { /* skip invalid */ }
    });
  });

  const sortedColors = Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([hex]) => hex);

  // Cluster: drop colors that are too similar to an already-kept color
  const palette = [];
  for (const color of sortedColors) {
    if (!palette.some(p => chroma.distance(color, p) < config.analyzer.colorSimilarityThreshold)) {
      palette.push(color);
    }
  }

  const primary   = palette[0] || null;
  const secondary = palette[1] || null;
  const accent    = palette[2] || null;

  return {
    primary,
    primaryScale:   primary   ? generateAdvancedScale(primary)   : null,
    secondary,
    secondaryScale: secondary ? generateAdvancedScale(secondary) : null,
    accent,
    accentScale:    accent    ? generateAdvancedScale(accent)    : null,
    palette: palette.slice(0, config.analyzer.topPaletteSize),
    paletteScales: palette.map(color => ({ color, scale: generateAdvancedScale(color) })),
    semantic: generateSemanticPalette(primary, secondary, palette),
  };
}

/**
 * Exports color tokens in CSS / Tailwind / semantic formats.
 * @param {Object} colorAnalysis - result of analyzeColors
 * @returns {Object}
 */
function exportColorTokens(colorAnalysis) {
  if (!colorAnalysis) return {};

  const tokens = { css: {}, tailwind: {}, semantic: {} };

  const addColor = (name, value, scale) => {
    tokens.css[`--color-${name}`] = value;
    tokens.tailwind[name] = value;
    if (scale) {
      Object.entries(scale).forEach(([k, v]) => {
        tokens.css[`--color-${name}-${k}`] = v;
      });
    }
  };

  if (colorAnalysis.primary)   addColor('primary',   colorAnalysis.primary,   colorAnalysis.primaryScale);
  if (colorAnalysis.secondary) addColor('secondary', colorAnalysis.secondary, colorAnalysis.secondaryScale);
  if (colorAnalysis.accent)    addColor('accent',    colorAnalysis.accent,    colorAnalysis.accentScale);

  Object.entries(colorAnalysis.semantic).forEach(([role, color]) => {
    tokens.css[`--color-${role}`] = color;
    tokens.tailwind[role] = color;
    tokens.semantic[role] = color;
  });

  tokens.css['--color-palette'] = colorAnalysis.palette.join(', ');
  tokens.tailwind.palette = colorAnalysis.palette;

  return tokens;
}

module.exports = {
  analyzeColors,
  exportColorTokens,
  // Re-export so existing callers that import from colors.js still work
  generateScale,
  generateAdvancedScale,
  generateSemanticPalette,
};
