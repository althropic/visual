'use strict';

/**
 * Builds the LLM prompt for fragment-based component generation.
 * @param {Object} fragment - Fragment metadata with HTML and styles.
 * @param {Object} designTokens - Semantic design tokens.
 * @returns {string} - Prompt string for the LLM.
 */
function buildFragmentPrompt(fragment, designTokens) {
  return `Convert this HTML fragment into a React component with Tailwind CSS.

FRAGMENT METADATA:
- Tag: ${fragment.tagName}
- Frequency: Appears ${fragment.frequency} times on the page
- Children: ${fragment.childCount} child elements
- Position: ${Math.round(fragment.position.width)}x${Math.round(fragment.position.height)}px

EXTRACTED HTML:
${fragment.html}

COMPUTED STYLES:
${JSON.stringify(fragment.styles, null, 2)}

DESIGN TOKENS:
- Primary: ${designTokens.colorTokens?.primaryAction || '#3b82f6'}
- Secondary: ${designTokens.colorTokens?.secondaryAction || '#8b5cf6'}
- Base Unit: ${designTokens.spatialTokens?.baseUnit || 8}px

REQUIREMENTS:
1. Convert the HTML structure to React JSX
2. Replace inline styles with Tailwind classes that match the computed styles
3. Make the component reusable with props for dynamic content
4. Use semantic HTML elements
5. Add prop types as comments
6. Keep the same visual structure and layout
7. Use the design tokens where appropriate

Return ONLY the component code, no markdown, no explanations.`;
}

module.exports = { buildFragmentPrompt };
