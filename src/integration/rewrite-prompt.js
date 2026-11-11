'use strict';

/**
 * Builds the LLM prompt for rewriting a component to use extracted design tokens.
 * @param {string} componentCode
 * @param {Object} designTokens
 * @param {string} namespace
 * @returns {string}
 */
function buildRewritePrompt(componentCode, designTokens, namespace) {
  const c = designTokens.colorTokens    || {};
  const s = designTokens.spatialTokens  || {};
  const t = designTokens.typographyTokens || {};

  return `Rewrite this React component to use extracted design tokens.

ORIGINAL COMPONENT:
\`\`\`jsx
${componentCode}
\`\`\`

AVAILABLE DESIGN TOKENS:

Colors (use as \`${namespace}-primary-500\`, \`${namespace}-secondary-600\`, etc.):
- Primary: ${c.primaryAction || '#3b82f6'}
- Secondary: ${c.secondaryAction || '#8b5cf6'}
- Surface: ${c.surface || '#ffffff'}
- Text Main: ${c.textMain || '#000000'}
- Text Muted: ${c.textMuted || '#6b7280'}

Spacing (use as \`${namespace}-base-unit\`, \`${namespace}-gutter\`):
- Base Unit: ${s.baseUnit || 8}px
- Container Padding: ${s.containerPadding || 16}px

Typography (use as \`${namespace}-scale-lg\`, \`font-${namespace}-primary\`):
- Primary Font: ${t.primaryFont || 'system-ui'}
- Base Size: ${t.baseSize || '16px'}
- Scale Ratio: ${t.scaleRatio || 1.25}

REQUIREMENTS:
1. Replace hardcoded colors with \`${namespace}-*\` color tokens
2. Replace hardcoded spacing with \`${namespace}-*\` spacing tokens
3. Replace font families with \`font-${namespace}-*\` tokens
4. Maintain all functionality and props
5. Add comments explaining token usage

Return the rewritten component code and a brief explanation of changes.`;
}

module.exports = { buildRewritePrompt };
