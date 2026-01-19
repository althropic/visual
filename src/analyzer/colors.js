const chroma = require('chroma-js');

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
  return {
    primary: palette[0] || null,
    secondary: palette[1] || null,
    accent: palette[2] || null,
    palette: palette.slice(0, 10) // Top 10 unique colors
  };
}

module.exports = { analyzeColors };