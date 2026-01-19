const fs = require('fs').promises;
const path = require('path');

/**
 * Generates CSS variable injection code for React/TypeScript projects.
 * @param {string} themeCssPath - Path to the extracted theme.css file.
 * @returns {string} - Import statement for main.tsx/main.jsx.
 */
function generateCSSImport(themeCssPath) {
  return `// Import extracted design tokens
import '${themeCssPath}';
`;
}

/**
 * Injects CSS import into a main entry file.
 * @param {string} mainFilePath - Path to main.tsx or main.jsx.
 * @param {string} themeCssPath - Path to theme.css relative to main file.
 * @returns {Promise<string>} - Updated file content.
 */
async function injectCSSImport(mainFilePath, themeCssPath) {
  try {
    const content = await fs.readFile(mainFilePath, 'utf-8');
    const importStatement = `import '${themeCssPath}';\n`;
    
    // Check if already imported
    if (content.includes(themeCssPath)) {
      return content; // Already injected
    }
    
    // Find the best place to inject (after other imports)
    const lines = content.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }
    
    // Insert after last import or at the beginning
    if (lastImportIndex >= 0) {
      lines.splice(lastImportIndex + 1, 0, importStatement);
    } else {
      lines.unshift(importStatement);
    }
    
    return lines.join('\n');
  } catch (error) {
    throw new Error(`Failed to inject CSS import: ${error.message}`);
  }
}

/**
 * Generates a CSS variables reference guide.
 * @param {Object} designTokens - Design tokens from extraction.
 * @returns {string} - Markdown reference guide.
 */
function generateVariableReference(designTokens) {
  const { colorTokens, spatialTokens, typographyTokens, interactionTokens } = designTokens;
  
  return `# CSS Variables Reference

## Color Variables

\`\`\`css
--primary: ${colorTokens?.primaryAction || '#3b82f6'}
--secondary: ${colorTokens?.secondaryAction || '#8b5cf6'}
--surface: ${colorTokens?.surface || '#ffffff'}
--text-main: ${colorTokens?.textMain || '#000000'}
--text-muted: ${colorTokens?.textMuted || '#6b7280'}
\`\`\`

### Usage in CSS/SCSS:
\`\`\`css
.my-component {
  background-color: var(--primary);
  color: var(--text-main);
}
\`\`\`

### Usage in Tailwind (arbitrary values):
\`\`\`jsx
<div className="bg-[var(--primary)] text-[var(--text-main)]">
  Content
</div>
\`\`\`

## Spacing Variables

\`\`\`css
--base-unit: ${spatialTokens?.baseUnit || 8}px
--container-padding: ${spatialTokens?.containerPadding || 16}px
--max-width: ${spatialTokens?.maxWidth || 1280}px
\`\`\`

### Usage:
\`\`\`css
.container {
  max-width: var(--max-width);
  padding: var(--container-padding);
}
\`\`\`

## Typography Variables

\`\`\`css
--font-primary: ${typographyTokens?.primaryFont || 'system-ui'}
--font-size-base: ${typographyTokens?.baseSize || '16px'}
--scale-ratio: ${typographyTokens?.scaleRatio || 1.25}
\`\`\`

### Usage:
\`\`\`css
body {
  font-family: var(--font-primary);
  font-size: var(--font-size-base);
}
\`\`\`

## Interaction Variables

\`\`\`css
--hover-transform: ${interactionTokens?.hover?.transformEffect || 'scale(1.05)'}
--hover-shadow: ${interactionTokens?.hover?.shadowEffect || '0 4px 8px rgba(0,0,0,0.1)'}
\`\`\`

### Usage:
\`\`\`css
.button:hover {
  transform: var(--hover-transform);
  box-shadow: var(--hover-shadow);
}
\`\`\`

## Combining with Tailwind

You can use CSS variables in Tailwind's arbitrary value syntax:

\`\`\`jsx
<div className="bg-[var(--primary)] p-[var(--base-unit)]">
  <h1 className="text-[var(--text-main)] font-[var(--font-primary)]">
    Title
  </h1>
</div>
\`\`\`

## Dynamic Theming

CSS variables enable runtime theme switching:

\`\`\`javascript
// Switch to dark mode
document.documentElement.style.setProperty('--primary', '#1e40af');
document.documentElement.style.setProperty('--surface', '#1f2937');
document.documentElement.style.setProperty('--text-main', '#f9fafb');
\`\`\`
`;
}

/**
 * Generates an integration script for automated setup.
 * @param {string} distPath - Path to the dist folder with extracted design.
 * @param {string} projectPath - Path to the target project.
 * @returns {string} - Shell script content.
 */
function generateIntegrationScript(distPath, projectPath) {
  return `#!/bin/bash
# Design System Integration Script

echo "🎨 Integrating extracted design system..."

# Copy theme.css to project
echo "📋 Copying theme.css..."
cp "${distPath}/styles/theme.css" "${projectPath}/src/styles/extracted-theme.css"

# Copy components
echo "📦 Copying components..."
mkdir -p "${projectPath}/src/components/extracted"
cp -r "${distPath}/components/"* "${projectPath}/src/components/extracted/"

# Copy Tailwind config for reference
echo "⚙️  Copying Tailwind config..."
cp "${distPath}/tailwind.config.js" "${projectPath}/tailwind.config.extracted.js"

echo "✅ Integration complete!"
echo ""
echo "Next steps:"
echo "1. Import theme.css in your main.tsx:"
echo "   import './styles/extracted-theme.css';"
echo ""
echo "2. Merge tailwind.config.extracted.js into your tailwind.config.js"
echo ""
echo "3. Start using extracted components:"
echo "   import { Button } from './components/extracted';"
`;
}

module.exports = { 
  generateCSSImport, 
  injectCSSImport, 
  generateVariableReference,
  generateIntegrationScript
};
