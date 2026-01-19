/**
 * Generates a DESIGN.md manifesto based on design tokens.
 * @param {Object} tokens - The semantic design tokens from the LLM.
 * @returns {string} - The generated markdown content.
 */
function generateDesignDoc(tokens) {
  const { colorTokens, spatialTokens, typographyTokens } = tokens;

  return `
# DESIGN.md - Design System Manifesto

## Groundwork Principles
This design system is built on Hierarchy, Symmetry, and Semantic Logic.

## 1. Color Palette
Assigning functional roles to raw color values ensures consistency and semantic meaning.

| Role | Hex Value |
| :--- | :--- |
| Primary Action | ${colorTokens.primaryAction} |
| Secondary Action | ${colorTokens.secondaryAction} |
| Surface | ${colorTokens.surface} |
| Main Text | ${colorTokens.textMain} |
| Muted Text | ${colorTokens.textMuted} |

## 2. Spatial System
Our spatial system is rooted in a base unit that ensures geometric rhythm and symmetry.

- **Base Unit:** ${spatialTokens.baseUnit}px
- **Container Padding:** ${spatialTokens.containerPadding}px
- **Stack Gap:** ${spatialTokens.stackGap}px
- **Max Width:** ${spatialTokens.maxWidth || 'N/A'}px

## 3. Typography Hierarchy
Typography is mapped to a geometric scale to ensure a clear visual hierarchy.

- **Scale Type:** ${typographyTokens.scaleType}
- **Base Font Size:** ${typographyTokens.baseSize}
`;
}

module.exports = { generateDesignDoc };