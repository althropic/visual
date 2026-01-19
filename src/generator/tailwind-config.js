/**
 * Generates a tailwind.config.js content based on design tokens.
 * @param {Object} tokens - The semantic design tokens.
 * @returns {string} - The generated configuration file content.
 */
function generateTailwindConfig(tokens) {
  const { colorTokens, spatialTokens, typographyTokens } = tokens;

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '${colorTokens.primaryAction}',
          secondary: '${colorTokens.secondaryAction}',
          surface: '${colorTokens.surface}',
        },
        text: {
          main: '${colorTokens.textMain}',
          muted: '${colorTokens.textMuted}',
        }
      },
      spacing: {
        'base-unit': '${spatialTokens.baseUnit}px',
        'gutter': '${spatialTokens.containerPadding}px',
      },
      maxWidth: {
        'container': '${spatialTokens.maxWidth || '1280'}px',
      }
    }
  }
};`;
}

module.exports = { generateTailwindConfig };