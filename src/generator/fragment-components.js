const { getClient, makeRawAPICall } = require('../llm/client');

/**
 * Generates React components from HTML fragments using LLM.
 * @param {Array} fragments - HTML fragments with metadata.
 * @param {Object} designTokens - Design tokens.
 * @returns {Promise<Object>} - Map of component names to React code.
 */
async function generateFragmentComponents(fragments, designTokens) {
  const components = {};
  
  for (const fragment of fragments) {
    try {
      const componentName = generateFragmentComponentName(fragment);
      const code = await generateComponentFromFragment(fragment, designTokens);
      components[componentName] = code;
    } catch (error) {
      console.error(`Error generating component from fragment ${fragment.signature}:`, error.message);
    }
  }
  
  return components;
}

/**
 * Generates a component name from fragment metadata.
 * @param {Object} fragment - Fragment metadata.
 * @returns {string} - PascalCase component name.
 */
function generateFragmentComponentName(fragment) {
  // Try to infer name from className
  if (fragment.className) {
    const classes = typeof fragment.className === 'string' ? fragment.className.split(' ') : [];
    const meaningfulClass = classes.find(c => 
      c.length > 2 && 
      !c.match(/^(flex|grid|p-|m-|text-|bg-|w-|h-)/) // Skip utility classes
    );
    
    if (meaningfulClass) {
      return meaningfulClass
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
    }
  }
  
  // Fallback to tag name + frequency
  const tagName = fragment.tagName.charAt(0).toUpperCase() + fragment.tagName.slice(1).toLowerCase();
  return `${tagName}Pattern${fragment.frequency}x`;
}

/**
 * Generates React component code from HTML fragment using LLM.
 * @param {Object} fragment - Fragment metadata with HTML and styles.
 * @param {Object} designTokens - Design tokens.
 * @returns {Promise<string>} - React component code.
 */
async function generateComponentFromFragment(fragment, designTokens) {
  const prompt = buildFragmentPrompt(fragment, designTokens);
  
  try {
    const messages = [
      { 
        role: "system", 
        content: "You are an expert React developer. Convert HTML fragments into clean, functional React components using Tailwind CSS. Return ONLY the component code, no explanations or markdown." 
      },
      { role: "user", content: prompt }
    ];
    
    let code;
    
    // Use raw API call for local LLMs
    if (process.env.OPENAI_BASE_URL) {
      code = await makeRawAPICall(messages, process.env.OPENAI_MODEL || "gpt-4o");
    } else {
      const client = getClient();
      const response = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: messages,
        temperature: 0.2
      });
      code = response.choices[0].message.content;
    }
    
    // Clean up markdown code blocks if present
    code = code.replace(/```(?:jsx|javascript|tsx|typescript)?\s*\n?/g, '').replace(/```\s*$/g, '').trim();
    
    return code;
  } catch (error) {
    console.error(`LLM error for fragment ${fragment.signature}:`, error.message);
    return generateFallbackFragmentComponent(fragment);
  }
}

/**
 * Builds LLM prompt for fragment-based component generation.
 * @param {Object} fragment - Fragment metadata.
 * @param {Object} designTokens - Design tokens.
 * @returns {string} - LLM prompt.
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

/**
 * Generates fallback component when LLM fails.
 * @param {Object} fragment - Fragment metadata.
 * @returns {string} - Fallback React component code.
 */
function generateFallbackFragmentComponent(fragment) {
  const componentName = generateFragmentComponentName(fragment);
  const styles = fragment.styles || {};
  
  // Build Tailwind classes from extracted styles
  const classes = [];
  
  if (styles.display === 'flex') {
    classes.push('flex');
    if (styles.flexDirection === 'column') classes.push('flex-col');
  } else if (styles.display === 'grid') {
    classes.push('grid');
  }
  
  if (styles.gap && styles.gap !== '0px') {
    classes.push(`gap-[${styles.gap}]`);
  }
  
  if (styles.padding && styles.padding !== '0px') {
    classes.push(`p-[${styles.padding}]`);
  }
  
  if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
    classes.push(`bg-[${styles.backgroundColor}]`);
  }
  
  if (styles.borderRadius && styles.borderRadius !== '0px') {
    classes.push(`rounded-[${styles.borderRadius}]`);
  }
  
  const baseClasses = classes.join(' ');
  
  return `import React from 'react';

/**
 * ${componentName} component
 * Extracted from ${fragment.frequency} instances
 * Original tag: ${fragment.tagName}
 * @param {Object} props - Component props
 */
export default function ${componentName}({ children, className = '', ...props }) {
  return (
    <${fragment.tagName.toLowerCase()} 
      className={\`${baseClasses} \${className}\`}
      {...props}
    >
      {children}
    </${fragment.tagName.toLowerCase()}>
  );
}`;
}

module.exports = { generateFragmentComponents };
