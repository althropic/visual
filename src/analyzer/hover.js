/**
 * Analyzes hover state changes and maps them to CSS tokens.
 * @param {Array} styleData - Array of element style data from the scraper.
 * @returns {Object} - An object containing detected hover state tokens.
 */
function analyzeHoverStates(styleData) {
  const hoverTokens = {
    colorChanges: [],
    backgroundColorChanges: [],
    transformEffects: [],
    shadowChanges: [],
    borderChanges: [],
    opacityChanges: []
  };

  // Process elements with hover state data
  const hoverElements = styleData.filter(item => item.hoverStyles);
  
  hoverElements.forEach(item => {
    const base = item.styles;
    const hover = item.hoverStyles;
    
    // Analyze color changes
    if (hover.color && base.color !== hover.color) {
      hoverTokens.colorChanges.push({
        from: base.color,
        to: hover.color,
        element: item.tagName
      });
    }
    
    // Analyze background color changes
    if (hover.backgroundColor && base.backgroundColor !== hover.backgroundColor) {
      hoverTokens.backgroundColorChanges.push({
        from: base.backgroundColor,
        to: hover.backgroundColor,
        element: item.tagName
      });
    }
    
    // Analyze transform effects
    if (hover.transform && hover.transform !== 'none') {
      hoverTokens.transformEffects.push({
        transform: hover.transform,
        element: item.tagName
      });
    }
    
    // Analyze shadow changes
    if (hover.boxShadow && base.boxShadow !== hover.boxShadow) {
      hoverTokens.shadowChanges.push({
        from: base.boxShadow,
        to: hover.boxShadow,
        element: item.tagName
      });
    }
    
    // Analyze border changes
    if ((hover.borderColor && base.borderColor !== hover.borderColor) ||
        (hover.borderWidth && base.borderWidth !== hover.borderWidth)) {
      hoverTokens.borderChanges.push({
        from: {
          color: base.borderColor,
          width: base.borderWidth
        },
        to: {
          color: hover.borderColor,
          width: hover.borderWidth
        },
        element: item.tagName
      });
    }
    
    // Analyze opacity changes
    if (hover.opacity && base.opacity !== hover.opacity) {
      hoverTokens.opacityChanges.push({
        from: base.opacity,
        to: hover.opacity,
        element: item.tagName
      });
    }
  });

  // Extract common patterns
  const commonPatterns = {};
  
  // Most common hover effect types
  const effectTypes = Object.keys(hoverTokens);
  commonPatterns.mostCommonEffect = effectTypes
    .map(type => ({ type, count: hoverTokens[type].length }))
    .sort((a, b) => b.count - a.count)[0]?.type || null;
  
  // Elements that commonly have hover effects
  const elementCounts = {};
  effectTypes.forEach(type => {
    hoverTokens[type].forEach(effect => {
      elementCounts[effect.element] = (elementCounts[effect.element] || 0) + 1;
    });
  });
  commonPatterns.mostCommonElement = Object.entries(elementCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return {
    hoverTokens,
    patterns: commonPatterns,
    totalInteractions: hoverElements.length
  };
}

module.exports = { analyzeHoverStates };