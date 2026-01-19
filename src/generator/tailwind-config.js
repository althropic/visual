/**
 * Generates a tailwind.config.js content based on design tokens.
 * @param {Object} tokens - The semantic design tokens.
 * @param {Object} colorAnalysis - Optional raw color analysis data with scales.
 * @returns {string} - The generated configuration file content.
 */
function generateTailwindConfig(tokens, colorAnalysis = null) {
  const { colorTokens, spatialTokens, typographyTokens, interactionTokens } = tokens;

  // Build comprehensive Tailwind configuration template
  const config = {
    content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    theme: {
      extend: {
        colors: buildColorTheme(colorTokens, colorAnalysis),
        spacing: buildSpacingTheme(spatialTokens),
        maxWidth: buildMaxWidthTheme(spatialTokens),
        fontSize: buildFontSizeTheme(typographyTokens),
        fontFamily: buildFontFamilyTheme(typographyTokens),
        transitionDuration: buildTransitionTheme(interactionTokens),
        boxShadow: buildShadowTheme(interactionTokens)
      }
    },
    plugins: []
  };

  // Clean up empty objects from config
  const cleanedConfig = cleanEmptyObjects(config);

  return `/** @type {import('tailwindcss').Config} */
module.exports = ${JSON.stringify(cleanedConfig, null, 2)};`;
}

/**
 * Recursively removes empty objects from configuration.
 * @param {Object} obj - The object to clean.
 * @returns {Object} - Cleaned object without empty nested objects.
 */
function cleanEmptyObjects(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(cleanEmptyObjects).filter(item => {
      if (typeof item === 'object' && item !== null) {
        return Object.keys(item).length > 0;
      }
      return true;
    });
  }
  
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    const cleanedValue = cleanEmptyObjects(value);
    
    // Only include non-empty values
    if (cleanedValue !== null && cleanedValue !== undefined) {
      if (typeof cleanedValue === 'object' && !Array.isArray(cleanedValue)) {
        if (Object.keys(cleanedValue).length > 0) {
          cleaned[key] = cleanedValue;
        }
      } else {
        cleaned[key] = cleanedValue;
      }
    }
  }
  
  return cleaned;
}

/**
 * Builds color theme extension from color tokens.
 * @param {Object} colorTokens - Color tokens from analysis.
 * @param {Object} colorAnalysis - Optional raw color analysis with scales.
 * @returns {Object} - Tailwind color configuration.
 */
function buildColorTheme(colorTokens, colorAnalysis = null) {
  if (!colorTokens) return {};
  
  const colors = {
    brand: {
      primary: colorTokens.primaryAction || '#3b82f6',
      secondary: colorTokens.secondaryAction || '#8b5cf6',
      surface: colorTokens.surface || '#ffffff',
    },
    text: {
      main: colorTokens.textMain || '#000000',
      muted: colorTokens.textMuted || '#6b7280',
    }
  };
  
  // Add semantic colors if available
  if (colorTokens.success) colors.success = colorTokens.success;
  if (colorTokens.warning) colors.warning = colorTokens.warning;
  if (colorTokens.error) colors.error = colorTokens.error;
  if (colorTokens.info) colors.info = colorTokens.info;
  
  // Inject color scales from raw analysis if available
  if (colorAnalysis) {
    if (colorAnalysis.primaryScale) {
      colors.primary = colorAnalysis.primaryScale;
    }
    if (colorAnalysis.secondaryScale) {
      colors.secondary = colorAnalysis.secondaryScale;
    }
    if (colorAnalysis.accentScale) {
      colors.accent = colorAnalysis.accentScale;
    }
    
    // Add semantic color scales if available
    if (colorAnalysis.semantic) {
      Object.entries(colorAnalysis.semantic).forEach(([key, value]) => {
        if (!colors[key]) {
          colors[key] = value;
        }
      });
    }
  }
  
  return colors;
}

/**
 * Builds spacing theme extension from spatial tokens.
 * @param {Object} spatialTokens - Spatial tokens from analysis.
 * @returns {Object} - Tailwind spacing configuration.
 */
function buildSpacingTheme(spatialTokens) {
  if (!spatialTokens) return {};
  
  return {
    'base-unit': `${spatialTokens.baseUnit || 8}px`,
    'gutter': `${spatialTokens.containerPadding || 16}px`,
  };
}

/**
 * Builds max-width theme extension from spatial tokens.
 * @param {Object} spatialTokens - Spatial tokens from analysis.
 * @returns {Object} - Tailwind max-width configuration.
 */
function buildMaxWidthTheme(spatialTokens) {
  if (!spatialTokens) return {};
  
  return {
    'container': `${spatialTokens.maxWidth || 1280}px`,
  };
}

/**
 * Builds font-size theme extension from typography tokens.
 * @param {Object} typographyTokens - Typography tokens from analysis.
 * @returns {Object} - Tailwind font-size configuration.
 */
function buildFontSizeTheme(typographyTokens) {
  if (!typographyTokens || !typographyTokens.scale) return {};
  
  const fontSizes = {};
  typographyTokens.scale.forEach((size, index) => {
    fontSizes[`scale-${index}`] = `${size}px`;
  });
  
  return fontSizes;
}

/**
 * Builds font-family theme extension from typography tokens.
 * @param {Object} typographyTokens - Typography tokens from analysis.
 * @returns {Object} - Tailwind font-family configuration.
 */
function buildFontFamilyTheme(typographyTokens) {
  if (!typographyTokens) return {};
  
  const families = {};
  if (typographyTokens.primaryFont) {
    families.primary = [typographyTokens.primaryFont, 'sans-serif'];
  }
  if (typographyTokens.secondaryFont) {
    families.secondary = [typographyTokens.secondaryFont, 'serif'];
  }
  
  return families;
}

/**
 * Builds transition duration theme from interaction tokens.
 * @param {Object} interactionTokens - Interaction tokens from analysis.
 * @returns {Object} - Tailwind transition duration configuration.
 */
function buildTransitionTheme(interactionTokens) {
  if (!interactionTokens || !interactionTokens.hover) return {};
  
  return {
    'hover': interactionTokens.hover.transitionDuration || '200ms',
  };
}

/**
 * Builds box-shadow theme from interaction tokens.
 * @param {Object} interactionTokens - Interaction tokens from analysis.
 * @returns {Object} - Tailwind box-shadow configuration.
 */
function buildShadowTheme(interactionTokens) {
  if (!interactionTokens || !interactionTokens.hover) return {};
  
  return {
    'hover': interactionTokens.hover.shadowEffect || '0 4px 8px rgba(0,0,0,0.1)',
  };
}

module.exports = { generateTailwindConfig };