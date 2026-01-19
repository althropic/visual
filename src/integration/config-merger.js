/**
 * Merges extracted design tokens into an existing Tailwind config.
 * @param {Object} extractedConfig - The extracted tailwind.config.js as an object.
 * @param {Object} existingConfig - The existing tailwind.config.js as an object.
 * @param {string} namespace - Namespace for extracted tokens (default: 'extracted').
 * @returns {Object} - Merged configuration.
 */
function mergeTailwindConfigs(extractedConfig, existingConfig, namespace = 'extracted') {
  const merged = JSON.parse(JSON.stringify(existingConfig)); // Deep clone
  
  // Ensure theme.extend exists
  if (!merged.theme) merged.theme = {};
  if (!merged.theme.extend) merged.theme.extend = {};
  if (!merged.theme.extend.colors) merged.theme.extend.colors = {};
  
  // Add extracted colors under namespace
  if (extractedConfig.theme?.extend?.colors) {
    merged.theme.extend.colors[namespace] = extractedConfig.theme.extend.colors;
  }
  
  // Add extracted spacing under namespace
  if (extractedConfig.theme?.extend?.spacing) {
    if (!merged.theme.extend.spacing) merged.theme.extend.spacing = {};
    Object.entries(extractedConfig.theme.extend.spacing).forEach(([key, value]) => {
      merged.theme.extend.spacing[`${namespace}-${key}`] = value;
    });
  }
  
  // Add extracted font sizes under namespace
  if (extractedConfig.theme?.extend?.fontSize) {
    if (!merged.theme.extend.fontSize) merged.theme.extend.fontSize = {};
    Object.entries(extractedConfig.theme.extend.fontSize).forEach(([key, value]) => {
      merged.theme.extend.fontSize[`${namespace}-${key}`] = value;
    });
  }
  
  // Add extracted font families under namespace
  if (extractedConfig.theme?.extend?.fontFamily) {
    if (!merged.theme.extend.fontFamily) merged.theme.extend.fontFamily = {};
    Object.entries(extractedConfig.theme.extend.fontFamily).forEach(([key, value]) => {
      merged.theme.extend.fontFamily[`${namespace}-${key}`] = value;
    });
  }
  
  return merged;
}

/**
 * Generates a merged Tailwind config file content.
 * @param {Object} extractedConfig - The extracted config.
 * @param {Object} existingConfig - The existing config.
 * @param {string} namespace - Namespace for extracted tokens.
 * @returns {string} - JavaScript code for the merged config.
 */
function generateMergedConfigFile(extractedConfig, existingConfig, namespace = 'extracted') {
  const merged = mergeTailwindConfigs(extractedConfig, existingConfig, namespace);
  
  return `/** @type {import('tailwindcss').Config} */
module.exports = ${JSON.stringify(merged, null, 2)};

/*
 * Extracted design tokens are namespaced under '${namespace}'
 * 
 * Usage examples:
 * - Colors: bg-${namespace}-primary-500, text-${namespace}-secondary-700
 * - Spacing: p-${namespace}-base-unit, m-${namespace}-gutter
 * - Typography: text-${namespace}-scale-lg, font-${namespace}-primary
 */
`;
}

/**
 * Generates a usage guide for the merged config.
 * @param {string} namespace - The namespace used for extracted tokens.
 * @returns {string} - Markdown usage guide.
 */
function generateUsageGuide(namespace = 'extracted') {
  return `# Design Token Integration Guide

## Overview

The extracted design tokens have been merged into your Tailwind configuration under the \`${namespace}\` namespace.

## Using Extracted Colors

\`\`\`jsx
// Primary colors
<div className="bg-${namespace}-primary-500 text-white">
  Primary background
</div>

// Secondary colors
<a className="text-${namespace}-secondary-600 hover:text-${namespace}-secondary-700">
  Link with extracted colors
</a>

// Brand colors
<button className="bg-${namespace}-brand-primary text-${namespace}-text-main">
  Button
</button>
\`\`\`

## Using Extracted Spacing

\`\`\`jsx
// Base unit spacing
<div className="p-${namespace}-base-unit m-${namespace}-gutter">
  Content with extracted spacing
</div>

// Container max-width
<div className="max-w-${namespace}-container mx-auto">
  Centered container
</div>
\`\`\`

## Using Extracted Typography

\`\`\`jsx
// Font sizes from extracted scale
<h1 className="text-${namespace}-scale-4xl font-${namespace}-primary">
  Heading with extracted typography
</h1>

// Body text
<p className="text-${namespace}-scale-base font-${namespace}-primary">
  Body text
</p>
\`\`\`

## Mixing with Existing Tokens

You can mix extracted tokens with your existing design system:

\`\`\`jsx
<div className="bg-${namespace}-primary-500 p-4 rounded-lg shadow-md">
  <h2 className="text-${namespace}-scale-2xl text-white mb-2">
    Mixed tokens
  </h2>
  <p className="text-gray-100">
    Extracted colors + existing utilities
  </p>
</div>
\`\`\`

## Gradual Migration

Start by using extracted tokens in new components, then gradually migrate existing components:

1. **New components**: Use \`${namespace}-*\` tokens exclusively
2. **Existing components**: Replace hardcoded values with \`${namespace}-*\` tokens
3. **Refactor**: Once comfortable, consider promoting extracted tokens to your main theme

## Example Component Rewrite

### Before:
\`\`\`jsx
<div className="bg-blue-500 text-white p-4 rounded">
  <h3 className="text-xl font-bold">Card Title</h3>
  <p className="text-sm">Card content</p>
</div>
\`\`\`

### After (using extracted tokens):
\`\`\`jsx
<div className="bg-${namespace}-primary-500 text-${namespace}-text-main p-${namespace}-base-unit rounded-[${namespace}-border-radius]">
  <h3 className="text-${namespace}-scale-xl font-${namespace}-primary">Card Title</h3>
  <p className="text-${namespace}-scale-sm">Card content</p>
</div>
\`\`\`
`;
}

module.exports = { 
  mergeTailwindConfigs, 
  generateMergedConfigFile, 
  generateUsageGuide 
};
