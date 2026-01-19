const chroma = require('chroma-js');

/**
 * Generates a color scale (50-950) from a base color.
 * @param {string} baseColor - The base hex color.
 * @returns {Object} - Object containing color scale.
 */
function generateScale(baseColor) {
  if (!baseColor) return null;
  const color = chroma(baseColor);
  return {
    50: color.brighten(2.5).hex(),
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
 * Extracts and clusters colors from element style data.
 * @param {Array} styleData - Array of element style data from the scraper.
 * @returns {Object} - An object containing the detected color palette.
 */
function analyzeColors(styleData) {
  const colorCounts = {};

  // Extract all unique colors and count their occurrences
  styleData.forEach(item => {
    const colors = [item.styles.color, item.styles.backgroundColor];
    colors.forEach(color => {
      if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return;
      
      // Normalize to hex
      try {
        const hex = chroma(color).hex();
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      } catch (e) {
        // Skip invalid colors
      }
    });
  });

  // Sort colors by frequency
  const sortedColors = Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);

  // Basic clustering: group very similar colors
  const palette = [];
  sortedColors.forEach(color => {
    const isSimilar = palette.some(p => chroma.distance(color, p) < 5);
    if (!isSimilar) {
      palette.push(color);
    }
  });

  // Heuristic: top colors are primary/secondary
  const primary = palette[0] || null;
  const secondary = palette[1] || null;

  return {
    primary,
    primaryScale: generateScale(primary),
    secondary,
    secondaryScale: generateScale(secondary),
    accent: palette[2] || null,
    palette: palette.slice(0, 10) // Top 10 unique colors
  };
}

module.exports = { analyzeColors };