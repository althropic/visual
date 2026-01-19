const { getClient } = require('../llm/client');

/**
 * Generates a component replacement guide using LLM.
 * @param {string} componentCode - Original component code.
 * @param {Object} designTokens - Extracted design tokens.
 * @param {string} namespace - Token namespace (default: 'extracted').
 * @returns {Promise<Object>} - Rewritten component and explanation.
 */
async function rewriteComponent(componentCode, designTokens, namespace = 'extracted') {
  const prompt = buildRewritePrompt(componentCode, designTokens, namespace);
  
  try {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an expert React developer specializing in design system integration. Rewrite components to use extracted design tokens while maintaining functionality." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.2
    });
    
    let content = response.choices[0].message.content;
    
    // Parse response
    const codeMatch = content.match(/```(?:jsx|javascript|tsx|typescript)?\s*\n([\s\S]*?)\n```/);
    const code = codeMatch ? codeMatch[1] : content;
    
    return {
      rewrittenCode: code.trim(),
      explanation: content.replace(/```[\s\S]*?```/g, '').trim()
    };
  } catch (error) {
    console.error('Error rewriting component:', error.message);
    return generateFallbackRewrite(componentCode, designTokens, namespace);
  }
}

/**
 * Builds LLM prompt for component rewriting.
 * @param {string} componentCode - Original component code.
 * @param {Object} designTokens - Extracted design tokens.
 * @param {string} namespace - Token namespace.
 * @returns {string} - LLM prompt.
 */
function buildRewritePrompt(componentCode, designTokens, namespace) {
  return `Rewrite this React component to use extracted design tokens.

ORIGINAL COMPONENT:
\`\`\`jsx
${componentCode}
\`\`\`

AVAILABLE DESIGN TOKENS:

Colors (use as \`${namespace}-primary-500\`, \`${namespace}-secondary-600\`, etc.):
- Primary: ${designTokens.colorTokens?.primaryAction || '#3b82f6'}
- Secondary: ${designTokens.colorTokens?.secondaryAction || '#8b5cf6'}
- Surface: ${designTokens.colorTokens?.surface || '#ffffff'}
- Text Main: ${designTokens.colorTokens?.textMain || '#000000'}
- Text Muted: ${designTokens.colorTokens?.textMuted || '#6b7280'}

Spacing (use as \`${namespace}-base-unit\`, \`${namespace}-gutter\`):
- Base Unit: ${designTokens.spatialTokens?.baseUnit || 8}px
- Container Padding: ${designTokens.spatialTokens?.containerPadding || 16}px

Typography (use as \`${namespace}-scale-lg\`, \`font-${namespace}-primary\`):
- Primary Font: ${designTokens.typographyTokens?.primaryFont || 'system-ui'}
- Base Size: ${designTokens.typographyTokens?.baseSize || '16px'}
- Scale Ratio: ${designTokens.typographyTokens?.scaleRatio || 1.25}

REQUIREMENTS:
1. Replace hardcoded colors with \`${namespace}-*\` color tokens
2. Replace hardcoded spacing with \`${namespace}-*\` spacing tokens
3. Replace font families with \`font-${namespace}-*\` tokens
4. Maintain all functionality and props
5. Keep the same component structure
6. Add comments explaining token usage

Return the rewritten component code and a brief explanation of changes.`;
}

/**
 * Generates fallback rewrite when LLM fails.
 * @param {string} componentCode - Original component code.
 * @param {Object} designTokens - Extracted design tokens.
 * @param {string} namespace - Token namespace.
 * @returns {Object} - Fallback rewrite.
 */
function generateFallbackRewrite(componentCode, designTokens, namespace) {
  return {
    rewrittenCode: componentCode,
    explanation: `Automatic rewrite failed. Manual steps:
1. Replace color values (e.g., 'bg-blue-500') with '${namespace}-primary-500'
2. Replace spacing (e.g., 'p-4') with 'p-${namespace}-base-unit'
3. Replace fonts with 'font-${namespace}-primary'

Available tokens:
- Colors: ${namespace}-primary-*, ${namespace}-secondary-*, ${namespace}-text-*
- Spacing: ${namespace}-base-unit, ${namespace}-gutter
- Typography: font-${namespace}-primary, text-${namespace}-scale-*`
  };
}

/**
 * Generates a comprehensive component replacement guide.
 * @param {Object} designTokens - Extracted design tokens.
 * @param {string} namespace - Token namespace.
 * @returns {string} - Markdown guide.
 */
function generateReplacementGuide(designTokens, namespace = 'extracted') {
  return `# Component Replacement Guide

## Overview

This guide shows how to rewrite existing components to use extracted design tokens.

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

## Example Rewrites

### Example 1: Button Component

**Before:**
\`\`\`jsx
export function Button({ children, variant = 'primary' }) {
  const baseClasses = "px-4 py-2 rounded font-semibold";
  const variantClasses = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-purple-500 text-white hover:bg-purple-600"
  };
  
  return (
    <button className={\`\${baseClasses} \${variantClasses[variant]}\`}>
      {children}
    </button>
  );
}
\`\`\`

**After (using extracted tokens):**
\`\`\`jsx
export function Button({ children, variant = 'primary' }) {
  // Using extracted spacing tokens
  const baseClasses = "px-${namespace}-base-unit py-${namespace}-base-unit rounded font-semibold";
  
  // Using extracted color tokens
  const variantClasses = {
    primary: "bg-${namespace}-primary-500 text-${namespace}-text-main hover:bg-${namespace}-primary-600",
    secondary: "bg-${namespace}-secondary-500 text-${namespace}-text-main hover:bg-${namespace}-secondary-600"
  };
  
  return (
    <button className={\`\${baseClasses} \${variantClasses[variant]}\`}>
      {children}
    </button>
  );
}
\`\`\`

### Example 2: Card Component

**Before:**
\`\`\`jsx
export function Card({ title, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600">
        {description}
      </p>
    </div>
  );
}
\`\`\`

**After (using extracted tokens):**
\`\`\`jsx
export function Card({ title, description }) {
  return (
    <div className="bg-${namespace}-surface p-${namespace}-gutter rounded-lg shadow-md">
      <h3 className="text-${namespace}-scale-xl font-${namespace}-primary text-${namespace}-text-main mb-2">
        {title}
      </h3>
      <p className="text-${namespace}-text-muted">
        {description}
      </p>
    </div>
  );
}
\`\`\`

### Example 3: Layout Container

**Before:**
\`\`\`jsx
export function Container({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
\`\`\`

**After (using extracted tokens):**
\`\`\`jsx
export function Container({ children }) {
  return (
    <div className="max-w-${namespace}-container mx-auto px-${namespace}-gutter">
      {children}
    </div>
  );
}
\`\`\`

## Migration Strategy

### Phase 1: New Components
Start using extracted tokens in all new components.

### Phase 2: High-Traffic Components
Rewrite frequently-used components (buttons, cards, forms).

### Phase 3: Gradual Migration
Systematically update remaining components.

### Phase 4: Cleanup
Remove old hardcoded values and consolidate tokens.

## Automated Rewriting

Use the component rewriter tool:

\`\`\`javascript
const { rewriteComponent } = require('./integration/component-rewriter');

const result = await rewriteComponent(
  originalComponentCode,
  designTokens,
  '${namespace}'
);

console.log(result.rewrittenCode);
console.log(result.explanation);
\`\`\`

## Testing After Migration

1. **Visual regression testing**: Ensure components look the same
2. **Functionality testing**: Verify all interactions work
3. **Responsive testing**: Check all breakpoints
4. **Accessibility testing**: Maintain WCAG compliance
`;
}

module.exports = { 
  rewriteComponent, 
  generateReplacementGuide 
};
