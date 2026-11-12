'use strict';

/**
 * Analyzes typography patterns and calculates actual scale ratios.
 * @param {Array} styleData - Array of element style data from the scraper.
 * @returns {Object} - Typography analysis including computed scale ratio.
 */
function analyzeTypography(styleData) {
  const fontSizes = {};
  const fontFamilies = {};
  const fontWeights = {};
  
  // Collect all font sizes and their frequencies
  styleData.forEach(item => {
    const fontSize = item.styles?.fontSize;
    const fontFamily = item.styles?.fontFamily;
    const fontWeight = item.styles?.fontWeight;
    
    if (fontSize) {
      fontSizes[fontSize] = (fontSizes[fontSize] || 0) + 1;
    }
    
    if (fontFamily) {
      fontFamilies[fontFamily] = (fontFamilies[fontFamily] || 0) + 1;
    }
    
    if (fontWeight) {
      fontWeights[fontWeight] = (fontWeights[fontWeight] || 0) + 1;
    }
  });
  
  // Sort font sizes by frequency
  const sortedSizes = Object.entries(fontSizes)
    .sort((a, b) => b[1] - a[1])
    .map(([size]) => parseFloat(size));
  
  // Identify base body size (most common)
  const bodySize = sortedSizes[0] || 16;
  
  // Identify heading sizes (larger than body)
  const headingSizes = sortedSizes.filter(size => size > bodySize).sort((a, b) => b - a);
  
  // Calculate actual scale ratio
  const scaleRatio = headingSizes.length > 0 ? headingSizes[0] / bodySize : 1.25;
  
  // Identify scale name based on ratio
  const scaleName = identifyScaleName(scaleRatio);
  
  // Get primary font family
  const primaryFont = Object.entries(fontFamilies)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'system-ui';
  
  // Get common font weights
  const commonWeights = Object.entries(fontWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([weight]) => weight);
  
  return {
    bodySize,
    headingSizes,
    scaleRatio,
    scaleName,
    primaryFont,
    commonWeights,
    allSizes: sortedSizes,
    sizeFrequencies: fontSizes
  };
}

/**
 * Identifies the scale name based on the computed ratio.
 * @param {number} ratio - The computed scale ratio.
 * @returns {string} - The scale name.
 */
function identifyScaleName(ratio) {
  const scales = {
    1.067: 'Minor Second',
    1.125: 'Major Second',
    1.200: 'Minor Third',
    1.250: 'Major Third',
    1.333: 'Perfect Fourth',
    1.414: 'Augmented Fourth',
    1.500: 'Perfect Fifth',
    1.618: 'Golden Ratio'
  };
  
  // Find closest match
  let closestScale = 'Custom';
  let closestDiff = Infinity;
  
  for (const [scaleRatio, name] of Object.entries(scales)) {
    const diff = Math.abs(parseFloat(scaleRatio) - ratio);
    if (diff < closestDiff && diff < 0.05) { // Within 5% tolerance
      closestDiff = diff;
      closestScale = name;
    }
  }
  
  return closestScale;
}

/**
 * Generates a typography scale based on the analyzed data.
 * @param {Object} typographyAnalysis - Typography analysis results.
 * @returns {Object} - Typography scale for design tokens.
 */
function generateTypographyScale(typographyAnalysis) {
  const { bodySize, scaleRatio } = typographyAnalysis;
  
  // Generate scale: xs, sm, base, lg, xl, 2xl, 3xl, 4xl
  return {
    xs: `${(bodySize * Math.pow(scaleRatio, -2)).toFixed(2)}px`,
    sm: `${(bodySize * Math.pow(scaleRatio, -1)).toFixed(2)}px`,
    base: `${bodySize}px`,
    lg: `${(bodySize * Math.pow(scaleRatio, 1)).toFixed(2)}px`,
    xl: `${(bodySize * Math.pow(scaleRatio, 2)).toFixed(2)}px`,
    '2xl': `${(bodySize * Math.pow(scaleRatio, 3)).toFixed(2)}px`,
    '3xl': `${(bodySize * Math.pow(scaleRatio, 4)).toFixed(2)}px`,
    '4xl': `${(bodySize * Math.pow(scaleRatio, 5)).toFixed(2)}px`
  };
}

module.exports = { analyzeTypography, generateTypographyScale };
