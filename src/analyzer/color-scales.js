'use strict';

const chroma = require('chroma-js');

/**
 * Generates a simple color scale (50–950) from a base color.
 * @param {string} baseColor - The base hex color.
 * @returns {Object|null}
 */
function generateScale(baseColor) {
  if (!baseColor) return null;
  const color = chroma(baseColor);
  return {
    50:  color.brighten(2.5).hex(),
    100: color.brighten(2).hex(),
    200: color.brighten(1.5).hex(),
    300: color.brighten(1).hex(),
    400: color.brighten(0.5).hex(),
    500: baseColor,
    600: color.darken(0.5).hex(),
    700: color.darken(1).hex(),
    800: color.darken(1.5).hex(),
    900: color.darken(2).hex(),
    950: color.darken(2.5).hex(),
  };
}

/**
 * Generates a perceptually-uniform color scale (50–950) using chroma-js.
 * Falls back to generateScale on error.
 * @param {string} baseColor - The base hex color.
 * @param {number} [steps=11]
 * @returns {Object|null}
 */
function generateAdvancedScale(baseColor, steps = 11) {
  if (!baseColor) return null;
  try {
    const scale = chroma.scale([
      chroma(baseColor).brighten(2.5),
      baseColor,
      chroma(baseColor).darken(2.5),
    ]).correctLightness(true).colors(steps);

    const scaleKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    const stepSize = Math.floor(scale.length / scaleKeys.length);
    const scaleMap = {};
    scaleKeys.forEach((key, index) => {
      scaleMap[key] = scale[Math.min(index * stepSize, scale.length - 1)];
    });
    return scaleMap;
  } catch (_) {
    return generateScale(baseColor);
  }
}

module.exports = { generateScale, generateAdvancedScale };
