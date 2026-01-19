const stats = require('simple-statistics');

/**
 * Extracts and analyzes spatial patterns from element style data.
 * @param {Array} styleData - Array of element style data from the scraper.
 * @returns {Object} - An object containing the detected spatial system.
 */
function analyzeSpatial(styleData) {
  const spacings = [];

  // Extract spacing values (margin, padding, gaps)
  styleData.forEach(item => {
    const values = [
      item.styles.marginTop, item.styles.marginRight, item.styles.marginBottom, item.styles.marginLeft,
      item.styles.paddingTop, item.styles.paddingRight, item.styles.paddingBottom, item.styles.paddingLeft,
      item.styles.gap
    ];

    values.forEach(val => {
      if (!val || val === 'normal' || val === '0px' || val === '0') return;
      const match = val.match(/^(-?\d+(\.\d+)?)px$/);
      if (match) {
        spacings.push(parseFloat(match[1]));
      }
    });
  });

  if (spacings.length === 0) {
    return { baseUnit: 8, commonSpacings: [], gridConsistency: 0 };
  }

  // Find common spacings
  const counts = {};
  spacings.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
  const sortedSpacings = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(entry => parseFloat(entry[0]));

  // Heuristic for base unit: find GCD of common spacings or look for multiples of 4/8
  const baseUnits = [8, 4, 10, 5];
  let bestBase = 8;
  let maxScore = 0;

  baseUnits.forEach(unit => {
    const consistentCount = spacings.filter(s => s % unit === 0).length;
    const score = consistentCount / spacings.length;
    if (score > maxScore) {
      maxScore = score;
      bestBase = unit;
    }
  });

  // Detect Gutter Symmetry and Container Max-Width
  const widths = styleData.map(item => item.rect.width).filter(w => w > 300); // Filter out small elements
  const xPositions = styleData.map(item => item.rect.x);
  
  // Find most frequent widths (potential container sizes)
  const widthCounts = {};
  widths.forEach(w => { widthCounts[w] = (widthCounts[w] || 0) + 1; });
  const commonWidths = Object.entries(widthCounts)
    .sort((a, b) => b[1] - a[1])
    .map(entry => parseFloat(entry[0]));

  // Find most frequent X positions (potential gutters)
  const xCounts = {};
  xPositions.forEach(x => { xCounts[x] = (xCounts[x] || 0) + 1; });
  const commonX = Object.entries(xCounts)
    .sort((a, b) => b[1] - a[1])
    .map(entry => parseFloat(entry[0]));

  return {
    baseUnit: bestBase,
    commonSpacings: sortedSpacings.slice(0, 5),
    gridConsistency: maxScore,
    layout: {
      maxWidth: commonWidths[0] || null,
      gutters: commonX.slice(0, 3),
      symmetry: commonX.length < styleData.length * 0.1 ? 'high' : 'low'
    }
  };
}

module.exports = { analyzeSpatial };