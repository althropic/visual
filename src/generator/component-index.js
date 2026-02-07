/**
 * Generates an index.js file for the component library.
 * @param {Object} components - Map of component names to code.
 * @returns {string} - Index file content.
 */
function generateComponentIndex(components) {
  const componentNames = Object.keys(components);
  
  if (componentNames.length === 0) {
    return `// No components generated\nexport {};\n`;
  }
  
  // Generate import statements
  const imports = componentNames
    .map(name => `export { default as ${name} } from './${name}';`)
    .join('\n');
  
  // Generate component list comment
  const componentList = componentNames
    .map(name => ` * - ${name}`)
    .join('\n');
  
  return `/**
 * Component Library Index
 * 
 * This file exports all generated components from the design extraction.
 * 
 * Available components:
${componentList}
 */

${imports}
`;
}

/**
 * Generates a README.md file for the component library.
 * @param {Object} components - Map of component names to code.
 * @param {Object} archetypes - Archetype analysis results.
 * @returns {string} - README content.
 */
function generateComponentReadme(components, archetypes) {
  const componentNames = Object.keys(components);
  
  const atomCount = archetypes.atoms?.length || 0;
  const moleculeCount = archetypes.molecules?.length || 0;
  const shellCount = archetypes.shells?.length || 0;
  
  return `# Component Library

This component library was automatically generated from design extraction.

## Overview

- **Total Components:** ${componentNames.length}
- **Atoms:** ${atomCount}
- **Molecules:** ${moleculeCount}
- **Shells:** ${shellCount}

## Components

${componentNames.map(name => `### ${name}\n\nImport:\n\`\`\`javascript\nimport { ${name} } from './components';\n\`\`\`\n`).join('\n')}

## Usage

All components are built with React and styled using Tailwind CSS. Make sure you have Tailwind CSS configured in your project.

\`\`\`javascript
import { ${componentNames.slice(0, 3).join(', ')} } from './components';

function App() {
  return (
    <div>
      {/* Use your components here */}
    </div>
  );
}
\`\`\`

## Customization

Each component accepts a \`className\` prop for additional styling and spreads remaining props to the underlying element.

## Design Tokens

Refer to \`tailwind.config.js\` for the design tokens extracted from the source design.
`;
}

module.exports = { generateComponentIndex, generateComponentReadme };
