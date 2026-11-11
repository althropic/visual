'use strict';

const { generateComponentName } = require('./react-components');

/**
 * Generates a minimal but style-accurate fallback atom component.
 * @param {Object} atom
 * @returns {string} JSX source
 */
function generateFallbackAtomComponent(atom) {
  const name    = generateComponentName(atom.role, 'atom');
  const colors  = atom.styles?.colors  || {};
  const spacing = atom.styles?.spacing  || {};
  const borders = atom.styles?.borders  || {};

  const classes = ['inline-flex items-center justify-center'];
  classes.push(spacing.padding ? `p-[${spacing.padding}]` : 'px-4 py-2');
  if (colors.color)           classes.push(`text-[${colors.color}]`);
  if (colors.backgroundColor) classes.push(`bg-[${colors.backgroundColor}]`);
  classes.push(borders.borderRadius ? `rounded-[${borders.borderRadius}]` : 'rounded');

  return `import React from 'react';

/** ${atom.role} — extracted from ${atom.count} instances */
export default function ${name}({ children, className = '', ...props }) {
  return (
    <${atom.tagName.toLowerCase()}
      className={\`${classes.join(' ')} \${className}\`}
      {...props}
    >
      {children}
    </${atom.tagName.toLowerCase()}>
  );
}`;
}

/**
 * Generates a minimal fallback molecule component.
 * @param {Object} molecule
 * @returns {string} JSX source
 */
function generateFallbackMoleculeComponent(molecule) {
  const name = generateComponentName(molecule.role, 'molecule');
  return `import React from 'react';

/** ${molecule.role} molecule */
export default function ${name}({ children, className = '', ...props }) {
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
 * Generates a minimal fallback shell component.
 * @param {Object} shell
 * @returns {string} JSX source
 */
function generateFallbackShellComponent(shell) {
  const name = generateComponentName(shell.role, 'shell');
  return `import React from 'react';

/** ${shell.role} shell */
export default function ${name}({ children, className = '', ...props }) {
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

module.exports = {
  generateFallbackAtomComponent,
  generateFallbackMoleculeComponent,
  generateFallbackShellComponent,
};
