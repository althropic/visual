/**
 * Inline file-content generators for the design package.
 * These produce static or near-static text files that don't warrant
 * their own generator module: theme.css, package.json, README.md.
 */

'use strict';

/**
 * Generates theme.css CSS custom properties from design tokens.
 * @param {Object} designData - Design tokens from LLM.
 * @returns {string}
 */
function generateThemeCSS(designData) {
  const c = designData.colorTokens || {};
  const s = designData.spatialTokens || {};
  const i = designData.interactionTokens?.hover || {};

  return `:root {
  /* Color tokens */
  --primary: ${c.primaryAction || '#3b82f6'};
  --secondary: ${c.secondaryAction || '#8b5cf6'};
  --surface: ${c.surface || '#ffffff'};
  --text-main: ${c.textMain || '#000000'};
  --text-muted: ${c.textMuted || '#6b7280'};

  /* Spacing tokens */
  --base-unit: ${s.baseUnit || 8}px;
  --container-padding: ${s.containerPadding || 16}px;
  --max-width: ${s.maxWidth || 1280}px;

  /* Interaction tokens */
  --hover-color-shift: ${i.colorShift || 'lighten'};
  --hover-background-shift: ${i.backgroundColorShift || 'darken'};
  --hover-transform: ${i.transformEffect || 'scale(1.05)'};
  --hover-shadow: ${i.shadowEffect || '0 4px 8px rgba(0,0,0,0.1)'};
}

/* Base styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  color: var(--text-main);
  background-color: var(--surface);
}
`;
}

/**
 * Generates package.json for the output design system package.
 * @returns {string}
 */
function generatePackageJson() {
  const pkg = {
    name: 'extracted-design-system',
    version: '1.0.0',
    description: 'Design system extracted and generated automatically',
    main: 'components/index.js',
    scripts: {
      build: "echo 'Build your components here'",
      dev: "echo 'Start your dev server here'",
    },
    peerDependencies: {
      react: '^18.0.0',
      'react-dom': '^18.0.0',
    },
    devDependencies: {
      tailwindcss: '^3.0.0',
      autoprefixer: '^10.0.0',
      postcss: '^8.0.0',
    },
  };
  return JSON.stringify(pkg, null, 2);
}

/**
 * Generates main README.md for the output design system package.
 * @param {Object} designData - Design tokens.
 * @param {Object} allComponents - Map of component names to code.
 * @param {Object} assets - Extracted asset data.
 * @returns {string}
 */
function generateMainReadme(designData, allComponents, assets) {
  const c = designData.colorTokens || {};
  const s = designData.spatialTokens || {};
  const componentCount = Object.keys(allComponents).length;

  return `# Extracted Design System

Automatically extracted and generated from a website.

## Contents

- **Components:** ${componentCount} React components
- **Design Tokens:** Colors, spacing, typography, and interaction patterns
- **Assets:** Logos, favicons, and brand assets
- **Configuration:** Tailwind CSS configuration

## Quick Start

\`\`\`bash
npm install
\`\`\`

\`\`\`javascript
import { Button, Card } from './components';
\`\`\`

## Design Tokens

| Token | Value |
|---|---|
| Primary | ${c.primaryAction || '#3b82f6'} |
| Secondary | ${c.secondaryAction || '#8b5cf6'} |
| Surface | ${c.surface || '#ffffff'} |
| Base Unit | ${s.baseUnit || 8}px |
| Container Padding | ${s.containerPadding || 16}px |
| Max Width | ${s.maxWidth || 1280}px |

See \`components/README.md\` for component documentation.
`;
}

module.exports = { generateThemeCSS, generatePackageJson, generateMainReadme };
