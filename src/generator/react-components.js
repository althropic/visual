const { getClient } = require('../llm/client');

/**
 * Generates React component code from archetype specifications using LLM.
 * @param {Object} archetypes - Archetype analysis results.
 * @param {Object} designTokens - Design tokens (colors, spacing, etc.).
 * @returns {Promise<Object>} - Map of component names to React code.
 */
async function generateReactComponents(archetypes, designTokens) {
  const components = {};
  
  // Generate atoms
  for (const atom of archetypes.atoms || []) {
    const componentName = generateComponentName(atom.role, 'atom');
    const code = await generateAtomComponent(atom, designTokens);
    components[componentName] = code;
  }
  
  // Generate molecules
  for (const molecule of archetypes.molecules || []) {
    const componentName = generateComponentName(molecule.role, 'molecule');
    const code = await generateMoleculeComponent(molecule, designTokens);
    components[componentName] = code;
  }
  
  // Generate shells
  for (const shell of archetypes.shells || []) {
    const componentName = generateComponentName(shell.role, 'shell');
    const code = await generateShellComponent(shell, designTokens);
    components[componentName] = code;
  }
  
  return components;
}

/**
 * Generates a component name from role and type.
 * @param {string} role - The component role (e.g., "Button", "Card").
 * @param {string} type - The component type (atom, molecule, shell).
 * @returns {string} - PascalCase component name.
 */
function generateComponentName(role, type) {
  // Clean and convert to PascalCase
  const cleaned = role
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
  
  return cleaned || `${type.charAt(0).toUpperCase() + type.slice(1)}Component`;
}

/**
 * Generates React code for an atom component using LLM.
 * @param {Object} atom - Atom specification.
 * @param {Object} designTokens - Design tokens.
 * @returns {Promise<string>} - React component code.
 */
async function generateAtomComponent(atom, designTokens) {
  const prompt = buildAtomPrompt(atom, designTokens);
  
  try {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an expert React developer. Generate clean, functional React components using Tailwind CSS. Return ONLY the component code, no explanations or markdown." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });
    
    let code = response.choices[0].message.content;
    
    // Clean up markdown code blocks if present
    code = code.replace(/```(?:jsx|javascript|tsx|typescript)?\s*\n?/g, '').replace(/```\s*$/g, '').trim();
    
    return code;
  } catch (error) {
    console.error(`Error generating atom component for ${atom.role}:`, error.message);
    return generateFallbackAtomComponent(atom);
  }
}

/**
 * Generates React code for a molecule component using LLM.
 * @param {Object} molecule - Molecule specification.
 * @param {Object} designTokens - Design tokens.
 * @returns {Promise<string>} - React component code.
 */
async function generateMoleculeComponent(molecule, designTokens) {
  const prompt = buildMoleculePrompt(molecule, designTokens);
  
  try {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an expert React developer. Generate clean, functional React components using Tailwind CSS. Return ONLY the component code, no explanations or markdown." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });
    
    let code = response.choices[0].message.content;
    
    // Clean up markdown code blocks if present
    code = code.replace(/```(?:jsx|javascript|tsx|typescript)?\s*\n?/g, '').replace(/```\s*$/g, '').trim();
    
    return code;
  } catch (error) {
    console.error(`Error generating molecule component for ${molecule.role}:`, error.message);
    return generateFallbackMoleculeComponent(molecule);
  }
}

/**
 * Generates React code for a shell component using LLM.
 * @param {Object} shell - Shell specification.
 * @param {Object} designTokens - Design tokens.
 * @returns {Promise<string>} - React component code.
 */
async function generateShellComponent(shell, designTokens) {
  const prompt = buildShellPrompt(shell, designTokens);
  
  try {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an expert React developer. Generate clean, functional React components using Tailwind CSS. Return ONLY the component code, no explanations or markdown." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });
    
    let code = response.choices[0].message.content;
    
    // Clean up markdown code blocks if present
    code = code.replace(/```(?:jsx|javascript|tsx|typescript)?\s*\n?/g, '').replace(/```\s*$/g, '').trim();
    
    return code;
  } catch (error) {
    console.error(`Error generating shell component for ${shell.role}:`, error.message);
    return generateFallbackShellComponent(shell);
  }
}

/**
 * Builds LLM prompt for atom component generation.
 * @param {Object} atom - Atom specification.
 * @param {Object} designTokens - Design tokens.
 * @returns {string} - LLM prompt.
 */
function buildAtomPrompt(atom, designTokens) {
  // Extract actual style values from the atom
  const styles = atom.styles || {};
  const colorStyles = styles.colors || {};
  const typographyStyles = styles.typography || {};
  const spacingStyles = styles.spacing || {};
  const borderStyles = styles.borders || {};
  
  return `Generate a React functional component for a ${atom.role} based on ACTUAL extracted styles.

EXTRACTED STYLE DATA:
- Tag: ${atom.tagName}
- Frequency: ${atom.count} instances
- Colors: ${JSON.stringify(colorStyles)}
- Typography: ${JSON.stringify(typographyStyles)}
- Spacing: ${JSON.stringify(spacingStyles)}
- Borders: ${JSON.stringify(borderStyles)}
${atom.hover ? `- Hover State: ${JSON.stringify(atom.hover.colors || {})}` : ''}

DESIGN TOKENS:
- Primary: ${designTokens.colorTokens?.primaryAction || '#3b82f6'}
- Secondary: ${designTokens.colorTokens?.secondaryAction || '#8b5cf6'}
- Base Unit: ${designTokens.spatialTokens?.baseUnit || 8}px

REQUIREMENTS:
1. Use Tailwind classes that MATCH the extracted styles
2. If color is ${colorStyles.color}, use text-[${colorStyles.color}]
3. If fontSize is ${typographyStyles.fontSize}, use text-[${typographyStyles.fontSize}]
4. If padding is ${spacingStyles.padding}, use p-[${spacingStyles.padding}]
5. Include hover states if hover data exists
6. Make it reusable with props
7. Use semantic HTML

Return ONLY the component code, no markdown, no explanations.`;
}

/**
 * Builds LLM prompt for molecule component generation.
 * @param {Object} molecule - Molecule specification.
 * @param {Object} designTokens - Design tokens.
 * @returns {string} - LLM prompt.
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
2. Compose this molecule from smaller atoms (use placeholder child components)
3. Make it flexible with props for content
4. Use semantic HTML structure
5. Add TypeScript-style prop comments
6. Include responsive design considerations

Return ONLY the component code, no explanations.`;
}

/**
 * Builds LLM prompt for shell component generation.
 * @param {Object} shell - Shell specification.
 * @param {Object} designTokens - Design tokens.
 * @returns {string} - LLM prompt.
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
2. Create a layout shell that can contain other components
3. Use children prop for flexible content
4. Include responsive breakpoints
5. Use semantic HTML5 elements
6. Add TypeScript-style prop comments
7. Consider accessibility (ARIA labels if needed)

Return ONLY the component code, no explanations.`;
}

/**
 * Generates fallback atom component code when LLM fails.
 * @param {Object} atom - Atom specification.
 * @returns {string} - Fallback React component code.
 */
function generateFallbackAtomComponent(atom) {
  const componentName = generateComponentName(atom.role, 'atom');
  
  // Extract actual styles to build better fallback
  const styles = atom.styles || {};
  const colorStyles = styles.colors || {};
  const spacingStyles = styles.spacing || {};
  const borderStyles = styles.borders || {};
  
  // Build Tailwind classes from actual extracted styles
  const classes = [];
  
  // Add display and layout
  classes.push('inline-flex items-center justify-center');
  
  // Add spacing from extracted data
  if (spacingStyles.padding) {
    classes.push(`p-[${spacingStyles.padding}]`);
  } else {
    classes.push('px-4 py-2');
  }
  
  // Add colors from extracted data
  if (colorStyles.color) {
    classes.push(`text-[${colorStyles.color}]`);
  }
  if (colorStyles.backgroundColor) {
    classes.push(`bg-[${colorStyles.backgroundColor}]`);
  }
  
  // Add borders from extracted data
  if (borderStyles.borderRadius) {
    classes.push(`rounded-[${borderStyles.borderRadius}]`);
  } else {
    classes.push('rounded');
  }
  
  const baseClasses = classes.join(' ');
  
  return `import React from 'react';

/**
 * ${atom.role} component
 * Extracted from ${atom.count} instances
 * @param {Object} props - Component props
 */
export default function ${componentName}({ children, className = '', ...props }) {
  return (
    <${atom.tagName.toLowerCase()} 
      className={\`${baseClasses} \${className}\`}
      {...props}
    >
      {children}
    </${atom.tagName.toLowerCase()}>
  );
}`;
}

/**
 * ${atom.role} component
 * @param {Object} props - Component props
 */
export default function ${componentName}({ children, className = '', ...props }) {
  return (
    <${atom.tagName.toLowerCase()} 
      className={\`inline-flex items-center justify-center px-4 py-2 rounded \${className}\`}
      {...props}
    >
      {children}
    </${atom.tagName.toLowerCase()}>
  );
}`;
}

/**
 * Generates fallback molecule component code when LLM fails.
 * @param {Object} molecule - Molecule specification.
 * @returns {string} - Fallback React component code.
 */
function generateFallbackMoleculeComponent(molecule) {
  const componentName = generateComponentName(molecule.role, 'molecule');
  
  return `import React from 'react';

/**
 * ${molecule.role} component
 * @param {Object} props - Component props
 */
export default function ${componentName}({ children, className = '', ...props }) {
  return (
    <${molecule.tagName.toLowerCase()} 
      className={\`flex flex-col gap-4 p-4 \${className}\`}
      {...props}
    >
      {children}
    </${molecule.tagName.toLowerCase()}>
  );
}`;
}

/**
 * Generates fallback shell component code when LLM fails.
 * @param {Object} shell - Shell specification.
 * @returns {string} - Fallback React component code.
 */
function generateFallbackShellComponent(shell) {
  const componentName = generateComponentName(shell.role, 'shell');
  
  return `import React from 'react';

/**
 * ${shell.role} component
 * @param {Object} props - Component props
 */
export default function ${componentName}({ children, className = '', ...props }) {
  return (
    <${shell.tagName.toLowerCase()} 
      className={\`w-full max-w-7xl mx-auto px-4 \${className}\`}
      {...props}
    >
      {children}
    </${shell.tagName.toLowerCase()}>
  );
}`;
}

module.exports = { generateReactComponents };
