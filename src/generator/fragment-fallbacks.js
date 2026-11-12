'use strict';

/**
 * Derives a PascalCase component name from fragment metadata.
 * @param {Object} fragment - Fragment metadata.
 * @returns {string} - PascalCase component name.
 */
function generateFragmentComponentName(fragment) {
  if (fragment.className) {
    const classes = typeof fragment.className === 'string' ? fragment.className.split(' ') : [];
    const meaningfulClass = classes.find(c =>
      c.length > 2 &&
      !c.match(/^(flex|grid|p-|m-|text-|bg-|w-|h-)/)
    );

    if (meaningfulClass) {
      return meaningfulClass
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
    }
  }

  const tagName = fragment.tagName.charAt(0).toUpperCase() + fragment.tagName.slice(1).toLowerCase();
  return `${tagName}Pattern${fragment.frequency}x`;
}

/**
 * Generates a deterministic fallback component when the LLM call fails.
 * Maps extracted computed styles to Tailwind arbitrary-value classes.
 * @param {Object} fragment - Fragment metadata.
 * @returns {string} - React component source code.
 */
function generateFallbackFragmentComponent(fragment) {
  const componentName = generateFragmentComponentName(fragment);
  const styles = fragment.styles || {};

  const classes = [];

  if (styles.display === 'flex') {
    classes.push('flex');
    if (styles.flexDirection === 'column') classes.push('flex-col');
  } else if (styles.display === 'grid') {
    classes.push('grid');
  }

  if (styles.gap && styles.gap !== '0px') classes.push(`gap-[${styles.gap}]`);
  if (styles.padding && styles.padding !== '0px') classes.push(`p-[${styles.padding}]`);
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

module.exports = { generateFragmentComponentName, generateFallbackFragmentComponent };
