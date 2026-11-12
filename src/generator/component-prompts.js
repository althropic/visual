'use strict';

/**
 * Builds the LLM prompt for an atom component.
 * @param {Object} atom
 * @param {Object} designTokens
 * @returns {string}
 */
function buildAtomPrompt(atom, designTokens) {
  const styles   = atom.styles || {};
  const colors   = styles.colors || {};
  const typo     = styles.typography || {};
  const spacing  = styles.spacing || {};
  const borders  = styles.borders || {};

  return `Generate a React functional component for a ${atom.role} based on ACTUAL extracted styles.

EXTRACTED STYLE DATA:
- Tag: ${atom.tagName}
- Frequency: ${atom.count} instances
- Colors: ${JSON.stringify(colors)}
- Typography: ${JSON.stringify(typo)}
- Spacing: ${JSON.stringify(spacing)}
- Borders: ${JSON.stringify(borders)}
${atom.hover ? `- Hover State: ${JSON.stringify(atom.hover.colors || {})}` : ''}

DESIGN TOKENS:
- Primary: ${designTokens.colorTokens?.primaryAction || '#3b82f6'}
- Secondary: ${designTokens.colorTokens?.secondaryAction || '#8b5cf6'}
- Base Unit: ${designTokens.spatialTokens?.baseUnit || 8}px

REQUIREMENTS:
1. Use Tailwind classes that MATCH the extracted styles
2. Include hover states if hover data exists
3. Make it reusable with props
4. Use semantic HTML
5. Add correct ARIA attributes for the element type:
   - <button>: type="button", aria-label prop
   - <input>: appropriate type, id prop, aria-label prop
   - <a>: aria-label prop
   - <img>: alt prop (required)
   - <nav>: aria-label prop
   - Interactive elements: include focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500

Return ONLY the component code, no markdown, no explanations.`;
}

/**
 * Builds the LLM prompt for a molecule component.
 * @param {Object} molecule
 * @param {Object} designTokens
 * @returns {string}
 */
function buildMoleculePrompt(molecule, designTokens) {
  return `Generate a React functional component for a ${molecule.role} molecule.

Component Specifications:
- Role: ${molecule.role}
- Tag: ${molecule.tagName}
- Frequency: Appears ${molecule.count} times on the page
- Style Categories: ${Object.keys(molecule.styles || {}).join(', ')}

Design Tokens Available:
- Primary Color: ${designTokens.colorTokens?.primaryAction || '#3b82f6'}
- Secondary Color: ${designTokens.colorTokens?.secondaryAction || '#8b5cf6'}
- Base Unit: ${designTokens.spatialTokens?.baseUnit || 8}px
- Container Padding: ${designTokens.spatialTokens?.containerPadding || 16}px

Requirements:
1. Use Tailwind CSS classes for styling
2. Compose from smaller atoms (use placeholder child components)
3. Make it flexible with props for content
4. Use semantic HTML structure
5. Include responsive design considerations
6. Add ARIA attributes appropriate to the element type (aria-label for nav, role for landmarks)

Return ONLY the component code, no explanations.`;
}

/**
 * Builds the LLM prompt for a shell component.
 * @param {Object} shell
 * @param {Object} designTokens
 * @returns {string}
 */
function buildShellPrompt(shell, designTokens) {
  return `Generate a React functional component for a ${shell.role} shell.

Component Specifications:
- Role: ${shell.role}
- Tag: ${shell.tagName}
- Frequency: Appears ${shell.count} times on the page
- Style Categories: ${Object.keys(shell.styles || {}).join(', ')}

Design Tokens Available:
- Primary Color: ${designTokens.colorTokens?.primaryAction || '#3b82f6'}
- Surface Color: ${designTokens.colorTokens?.surface || '#ffffff'}
- Max Width: ${designTokens.spatialTokens?.maxWidth || 1280}px
- Container Padding: ${designTokens.spatialTokens?.containerPadding || 16}px

Requirements:
1. Use Tailwind CSS classes for styling
2. Create a layout shell that can contain other components via children prop
3. Include responsive breakpoints
4. Use semantic HTML5 elements
5. Consider accessibility (ARIA labels if needed)

Return ONLY the component code, no explanations.`;
}

module.exports = { buildAtomPrompt, buildMoleculePrompt, buildShellPrompt };
