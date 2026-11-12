'use strict';

const { generateComponentName } = require('./react-components');
const { paddingClass, roundedClass, spacingToken } = require('./tailwind-tokens');

// ─── ARIA helpers ────────────────────────────────────────────────────────────

/**
 * Returns the extra JSX attribute lines needed for a given HTML tag + role.
 * All interactive elements get a focus-ring class; specialised elements get
 * semantically correct ARIA attributes.
 *
 * @param {string} tagName  - Lowercase HTML tag, e.g. 'button', 'input'.
 * @param {string} role     - Archetype role string, e.g. 'primary button'.
 * @returns {{ extraAttrs: string, focusClass: string }}
 */
function ariaAttrs(tagName, role) {
  const tag       = (tagName || '').toLowerCase();
  const roleLower = (role   || '').toLowerCase();
  const focusClass = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500';

  switch (tag) {
    case 'button':
      return {
        extraAttrs: '      type="button"\n      aria-label={ariaLabel}',
        focusClass,
        extraProps: 'ariaLabel = \'\', ',
      };

    case 'input': {
      const inputType = roleLower.includes('search') ? 'search'
        : roleLower.includes('email')  ? 'email'
        : roleLower.includes('pass')   ? 'password'
        : roleLower.includes('number') ? 'number'
        : 'text';
      return {
        extraAttrs: `      type="${inputType}"\n      id={id}\n      aria-label={ariaLabel}`,
        focusClass,
        extraProps: 'id = \'\', ariaLabel = \'\', ',
      };
    }

    case 'a':
      return {
        extraAttrs: '      aria-label={ariaLabel}',
        focusClass,
        extraProps: 'ariaLabel = \'\', ',
      };

    case 'img':
      return {
        extraAttrs: '      alt={alt}',
        focusClass: '',
        extraProps: 'alt = \'\', ',
      };

    case 'nav':
      return {
        extraAttrs: '      aria-label={ariaLabel}',
        focusClass: '',
        extraProps: 'ariaLabel = \'Navigation\', ',
      };

    case 'header':
      return { extraAttrs: '      role="banner"', focusClass: '', extraProps: '' };

    case 'footer':
      return { extraAttrs: '      role="contentinfo"', focusClass: '', extraProps: '' };

    case 'main':
      return { extraAttrs: '      role="main"', focusClass: '', extraProps: '' };

    case 'aside':
      return {
        extraAttrs: '      aria-label={ariaLabel}',
        focusClass: '',
        extraProps: 'ariaLabel = \'Sidebar\', ',
      };

    case 'select':
      return {
        extraAttrs: '      id={id}\n      aria-label={ariaLabel}',
        focusClass,
        extraProps: 'id = \'\', ariaLabel = \'\', ',
      };

    case 'textarea':
      return {
        extraAttrs: '      id={id}\n      aria-label={ariaLabel}',
        focusClass,
        extraProps: 'id = \'\', ariaLabel = \'\', ',
      };

    default:
      return { extraAttrs: '', focusClass: '', extraProps: '' };
  }
}

// ─── Atom ────────────────────────────────────────────────────────────────────

/**
 * Generates a minimal but style-accurate fallback atom component.
 * Emits correct ARIA attributes and focus-ring styles for interactive elements.
 * @param {Object} atom
 * @returns {string} JSX source
 */
function generateFallbackAtomComponent(atom) {
  const name    = generateComponentName(atom.role, 'atom');
  const tag     = (atom.tagName || 'div').toLowerCase();
  const colors  = atom.styles?.colors  || {};
  const spacing = atom.styles?.spacing  || {};
  const borders = atom.styles?.borders  || {};

  const { extraAttrs, focusClass, extraProps } = ariaAttrs(tag, atom.role);

  const classes = ['inline-flex', 'items-center', 'justify-center'];

  // Spacing: map to nearest Tailwind token or arbitrary value
  if (spacing.padding) {
    classes.push(paddingClass(spacing.padding));
  } else {
    classes.push('px-4', 'py-2');
  }

  // Colors: arbitrary-value classes (hex/rgb pass-through)
  if (colors.color)           classes.push(`text-[${colors.color}]`);
  if (colors.backgroundColor) classes.push(`bg-[${colors.backgroundColor}]`);

  // Border radius: map to nearest Tailwind token
  classes.push(borders.borderRadius ? roundedClass(borders.borderRadius) : 'rounded');

  // Focus ring for interactive elements
  if (focusClass) classes.push(...focusClass.split(' '));

  const classStr    = classes.join(' ');
  const attrsBlock  = extraAttrs ? `\n${extraAttrs}` : '';

  return `import React from 'react';

/** ${atom.role} — extracted from ${atom.count} instances */
export default function ${name}({ ${extraProps}children, className = '', ...props }) {
  return (
    <${tag}${attrsBlock}
      className={\`${classStr} \${className}\`}
      {...props}
    >
      {children}
    </${tag}>
  );
}`;
}

// ─── Molecule ────────────────────────────────────────────────────────────────

/**
 * Generates a minimal fallback molecule component.
 * Uses token-mapped spacing classes and semantic ARIA where the tag warrants it.
 * @param {Object} molecule
 * @returns {string} JSX source
 */
function generateFallbackMoleculeComponent(molecule) {
  const name    = generateComponentName(molecule.role, 'molecule');
  const tag     = (molecule.tagName || 'div').toLowerCase();
  const spacing = molecule.styles?.spacing || {};
  const { extraAttrs, extraProps } = ariaAttrs(tag, molecule.role);

  const gapSuffix = spacing.gap ? spacingToken(spacing.gap) : '4';
  const padSuffix = spacing.padding ? spacingToken(spacing.padding) : '4';
  const classes   = `flex flex-col gap-${gapSuffix} p-${padSuffix}`;
  const attrsBlock = extraAttrs ? `\n${extraAttrs}` : '';

  return `import React from 'react';

/** ${molecule.role} molecule */
export default function ${name}({ ${extraProps}children, className = '', ...props }) {
  return (
    <${tag}${attrsBlock}
      className={\`${classes} \${className}\`}
      {...props}
    >
      {children}
    </${tag}>
  );
}`;
}

// ─── Shell ───────────────────────────────────────────────────────────────────

/**
 * Generates a minimal fallback shell component.
 * Maps the extracted maxWidth to the nearest Tailwind max-w token.
 * @param {Object} shell
 * @returns {string} JSX source
 */
function generateFallbackShellComponent(shell) {
  const name    = generateComponentName(shell.role, 'shell');
  const tag     = (shell.tagName || 'div').toLowerCase();
  const spatial = shell.styles?.spatial || {};
  const { extraAttrs, extraProps } = ariaAttrs(tag, shell.role);

  const { maxWidthToken } = require('./tailwind-tokens');
  const maxWClass  = spatial.maxWidth ? `max-w-${maxWidthToken(spatial.maxWidth)}` : 'max-w-7xl';
  const padSuffix  = spatial.containerPadding ? spacingToken(spatial.containerPadding) : '4';
  const classes    = `w-full ${maxWClass} mx-auto px-${padSuffix}`;
  const attrsBlock = extraAttrs ? `\n${extraAttrs}` : '';

  return `import React from 'react';

/** ${shell.role} shell */
export default function ${name}({ ${extraProps}children, className = '', ...props }) {
  return (
    <${tag}${attrsBlock}
      className={\`${classes} \${className}\`}
      {...props}
    >
      {children}
    </${tag}>
  );
}`;
}

module.exports = {
  generateFallbackAtomComponent,
  generateFallbackMoleculeComponent,
  generateFallbackShellComponent,
};
