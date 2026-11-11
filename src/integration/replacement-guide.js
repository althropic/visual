'use strict';

/**
 * Generates a comprehensive Markdown guide for migrating components to extracted tokens.
 * @param {Object} designTokens
 * @param {string} [namespace='extracted']
 * @returns {string}
 */
function generateReplacementGuide(designTokens, namespace = 'extracted') {
  return `# Component Replacement Guide

## Token Mapping

### Colors

| Hardcoded Value | Extracted Token | Usage |
|----------------|-----------------|-------|
| \`bg-blue-500\` | \`bg-${namespace}-primary-500\` | Primary backgrounds |
| \`text-blue-600\` | \`text-${namespace}-primary-600\` | Primary text |
| \`bg-purple-500\` | \`bg-${namespace}-secondary-500\` | Secondary backgrounds |
| \`text-gray-900\` | \`text-${namespace}-text-main\` | Main text color |
| \`text-gray-500\` | \`text-${namespace}-text-muted\` | Muted text color |

### Spacing

| Hardcoded Value | Extracted Token | Usage |
|----------------|-----------------|-------|
| \`p-4\` | \`p-${namespace}-base-unit\` | Base padding |
| \`m-4\` | \`m-${namespace}-gutter\` | Gutter margins |
| \`max-w-7xl\` | \`max-w-${namespace}-container\` | Container width |

### Typography

| Hardcoded Value | Extracted Token | Usage |
|----------------|-----------------|-------|
| \`font-sans\` | \`font-${namespace}-primary\` | Primary font |
| \`text-xl\` | \`text-${namespace}-scale-xl\` | Heading sizes |
| \`text-base\` | \`text-${namespace}-scale-base\` | Body text |

## Example: Button

**Before:**
\`\`\`jsx
<button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
  Click
</button>
\`\`\`

**After:**
\`\`\`jsx
<button className="bg-${namespace}-primary-500 text-${namespace}-text-main px-${namespace}-base-unit py-${namespace}-base-unit rounded hover:bg-${namespace}-primary-600">
  Click
</button>
\`\`\`

## Automated Rewriting

\`\`\`javascript
const { rewriteComponent } = require('./integration/component-rewriter');

const result = await rewriteComponent(originalCode, designTokens, '${namespace}');
// result.rewrittenCode — updated JSX
// result.explanation  — summary of changes made
\`\`\`

## Migration Strategy

1. **New components** — use \`${namespace}-*\` tokens from the start
2. **High-traffic components** — rewrite buttons, cards, forms first
3. **Gradual migration** — update remaining components systematically
4. **Cleanup** — remove old hardcoded values once migration is complete
`;
}

module.exports = { generateReplacementGuide };
