'use strict';

const chroma = require('chroma-js');
const { config } = require('../config');

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
 * Generates a more advanced color scale with better perceptual uniformity.
 * @param {string} baseColor - The base hex color.
 * @param {number} steps - Number of steps in the scale (default 11 for 50-950).
 * @returns {Object} - Object containing color scale.
 */
function generateAdvancedScale(baseColor, steps = 11) {
  if (!baseColor) return null;
  
  try {
    // Use chroma-js scale for better perceptual uniformity
    const scale = chroma.scale([
      chroma(baseColor).brighten(2.5),
      baseColor,
      chroma(baseColor).darken(2.5)
    ]).correctLightness(true).colors(steps);
    
    // Map to 50-950 scale
    const scaleMap = {};
    const scaleKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    const stepSize = Math.floor(scale.length / scaleKeys.length);
    
    scaleKeys.forEach((key, index) => {
      const scaleIndex = Math.min(index * stepSize, scale.length - 1);
      scaleMap[key] = scale[scaleIndex];
    });
    
    return scaleMap;
  } catch (e) {
    // Fallback to simple scale if advanced scale fails
    return generateScale(baseColor);
  }
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
    const colors = [item.styles.color, item.styles.backgroundColor, item.styles.borderColor];
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
    const isSimilar = palette.some(
      p => chroma.distance(color, p) < config.analyzer.colorSimilarityThreshold
    );
    if (!isSimilar) {
      palette.push(color);
    }
  });

  // Heuristic: top colors are primary/secondary
  const primary = palette[0] || null;
  const secondary = palette[1] || null;
  const accent = palette[2] || null;

  // Generate scales for all main colors
  const primaryScale = primary ? generateAdvancedScale(primary) : null;
  const secondaryScale = secondary ? generateAdvancedScale(secondary) : null;
  const accentScale = accent ? generateAdvancedScale(accent) : null;

  // Generate scales for the entire palette
  const paletteScales = palette.map(color => ({
    color,
    scale: generateAdvancedScale(color)
  }));

  // Generate semantic color palette
  const semanticPalette = generateSemanticPalette(primary, secondary, palette);

  return {
    primary,
    primaryScale,
    secondary,
    secondaryScale,
    accent,
    accentScale,
    palette: palette.slice(0, 10), // Top 10 unique colors
    paletteScales, // Scales for all palette colors
    semantic: semanticPalette
  };
}

/**
 * Exports color tokens in various formats for CSS and Tailwind.
 * @param {Object} colorAnalysis - Color analysis results from analyzeColors.
 * @returns {Object} - Object containing color tokens for different systems.
 */
function exportColorTokens(colorAnalysis) {
  if (!colorAnalysis) return {};
  
  const tokens = {
    css: {},
    tailwind: {},
    semantic: {}
  };
  
  // Export primary, secondary, and accent colors
  if (colorAnalysis.primary) {
    tokens.css['--color-primary'] = colorAnalysis.primary;
    tokens.tailwind.primary = colorAnalysis.primary;
    
    // Export primary scale
    if (colorAnalysis.primaryScale) {
      Object.entries(colorAnalysis.primaryScale).forEach(([key, value]) => {
        tokens.css[`--color-primary-${key}`] = value;
      });
    }
  }
  
  if (colorAnalysis.secondary) {
    tokens.css['--color-secondary'] = colorAnalysis.secondary;
    tokens.tailwind.secondary = colorAnalysis.secondary;
    
    // Export secondary scale
    if (colorAnalysis.secondaryScale) {
      Object.entries(colorAnalysis.secondaryScale).forEach(([key, value]) => {
        tokens.css[`--color-secondary-${key}`] = value;
      });
    }
  }
  
  if (colorAnalysis.accent) {
    tokens.css['--color-accent'] = colorAnalysis.accent;
    tokens.tailwind.accent = colorAnalysis.accent;
    
    // Export accent scale
    if (colorAnalysis.accentScale) {
      Object.entries(colorAnalysis.accentScale).forEach(([key, value]) => {
        tokens.css[`--color-accent-${key}`] = value;
      });
    }
  }
  
  // Export semantic colors
  Object.entries(colorAnalysis.semantic).forEach(([role, color]) => {
    tokens.css[`--color-${role}`] = color;
    tokens.tailwind[role] = color;
    tokens.semantic[role] = color;
  });
  
  // Export full palette
  tokens.css['--color-palette'] = colorAnalysis.palette.join(', ');
  tokens.tailwind.palette = colorAnalysis.palette;
  
  return tokens;
}

/**
 * Generates a semantic color palette based on primary colors and overall palette.
 * @param {string} primary - Primary color.
 * @param {string} secondary - Secondary color.
 * @param {Array} palette - Full color palette.
 * @returns {Object} - Semantic color palette.
 */
function generateSemanticPalette(primary, secondary, palette) {
  // Default semantic colors
  const semantic = {
    action: primary || '#3b82f6', // Blue as default action color
    surface: '#ffffff',           // White background
    text: '#000000',              // Black text
    success: '#10b981',           // Green
    warning: '#f59e0b',           // Amber
    error: '#ef4444',             // Red
    info: '#3b82f6'               // Blue
  };
  
  // Try to derive better semantic colors from the palette
  if (palette && palette.length > 0) {
    // Find a suitable surface color (lightest color)
    const lightestColor = palette
      .map(color => ({ color, luminance: chroma(color).luminance() }))
      .sort((a, b) => b.luminance - a.luminance)[0];
    
    if (lightestColor && lightestColor.luminance > 0.8) {
      semantic.surface = lightestColor.color;
    }
    
    // Find a suitable text color (darkest color with good contrast)
    const darkestColor = palette
      .map(color => ({ color, luminance: chroma(color).luminance() }))
      .sort((a, b) => a.luminance - b.luminance)[0];
    
    if (darkestColor && darkestColor.luminance < 0.2) {
      semantic.text = darkestColor.color;
    }
    
    // Try to find better semantic colors in the palette
    const colorObjects = palette.map(color => ({
      color,
      luminance: chroma(color).luminance(),
      hue: chroma(color).get('hsl.h')
    }));
    
    // Look for green-ish colors for success
    const greens = colorObjects.filter(c => 
      (c.hue >= 60 && c.hue <= 180) && 
      c.luminance > 0.3 && 
      c.luminance < 0.8
    );
    
    if (greens.length > 0) {
      semantic.success = greens.reduce((prev, curr) => 
        Math.abs(curr.luminance - 0.5) < Math.abs(prev.luminance - 0.5) ? curr : prev
      ).color;
    }
    
    // Look for yellow-orange-ish colors for warning
    const yellows = colorObjects.filter(c => 
      (c.hue >= 30 && c.hue <= 60) && 
      c.luminance > 0.4
    );
    
    if (yellows.length > 0) {
      semantic.warning = yellows.reduce((prev, curr) => 
        Math.abs(curr.luminance - 0.6) < Math.abs(prev.luminance - 0.6) ? curr : prev
      ).color;
    }
    
    // Look for red-ish colors for error
    const reds = colorObjects.filter(c => 
      (c.hue >= 0 && c.hue <= 30 || c.hue >= 330) && 
      c.luminance > 0.3 && 
      c.luminance < 0.7
    );
    
    if (reds.length > 0) {
      semantic.error = reds.reduce((prev, curr) => 
        Math.abs(curr.luminance - 0.5) < Math.abs(prev.luminance - 0.5) ? curr : prev
      ).color;
    }
    
    // Look for blue-ish colors for info
    const blues = colorObjects.filter(c => 
      (c.hue >= 180 && c.hue <= 240) && 
      c.luminance > 0.3 && 
      c.luminance < 0.7
    );
    
    if (blues.length > 0) {
      semantic.info = blues.reduce((prev, curr) => 
        Math.abs(curr.luminance - 0.5) < Math.abs(prev.luminance - 0.5) ? curr : prev
      ).color;
    } else if (primary) {
      // Fallback to primary color for info if no blue found
      semantic.info = primary;
    }
  }
  
  return semantic;
}

module.exports = { analyzeColors, exportColorTokens, generateScale, generateAdvancedScale, generateSemanticPalette };