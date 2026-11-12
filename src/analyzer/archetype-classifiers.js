'use strict';

const { generateStyleSpecifications, extractVariants } = require('./archetype-styles');

const ATOM_TAGS    = new Set(['BUTTON', 'INPUT', 'A', 'IMG', 'TEXTAREA', 'SELECT', 'LABEL', 'SPAN']);
const MOLECULE_TAGS = new Set(['FORM', 'FIELDSET', 'DL', 'UL', 'OL', 'TABLE']);
const SHELL_TAGS   = new Set(['NAV', 'HEADER', 'FOOTER', 'MAIN', 'ASIDE', 'SECTION', 'ARTICLE']);

const ATOM_CLASSES    = ['btn', 'button', 'input', 'link', 'icon', 'checkbox', 'radio', 'switch'];
const MOLECULE_CLASSES = ['card', 'form-group', 'list-item', 'media', 'alert', 'panel', 'well', 'box'];
const SHELL_CLASSES   = ['navbar', 'navigation', 'header', 'footer', 'sidebar', 'container', 'wrapper'];

/** @param {string} s */
const low = s => (typeof s === 'string' ? s : '').toLowerCase();

function isAtomElement(tagName, className, element, childCount) {
  if (ATOM_TAGS.has(tagName)) return true;
  if (element.isInteractive && childCount < 3) return true;
  return ATOM_CLASSES.some(c => low(className).includes(c));
}

function isMoleculeElement(tagName, className, childCount) {
  if (childCount >= 3 && childCount <= 10) return true;
  if (MOLECULE_TAGS.has(tagName)) return true;
  return MOLECULE_CLASSES.some(c => low(className).includes(c));
}

function isShellElement(tagName, className, childCount) {
  if (SHELL_TAGS.has(tagName)) return true;
  if (childCount > 10) return true;
  return SHELL_CLASSES.some(c => low(className).includes(c));
}

function getAtomRole(tagName, className = '') {
  const cls = low(className);
  const classRoles = { btn: 'Button', button: 'Button', input: 'Input Field',
    link: 'Link', icon: 'Icon', checkbox: 'Checkbox', radio: 'Radio Button', switch: 'Toggle Switch' };
  for (const [k, v] of Object.entries(classRoles)) {
    if (cls.includes(k)) return v;
  }
  const tagRoles = { BUTTON: 'Button', INPUT: 'Input Field', A: 'Link', IMG: 'Image',
    TEXTAREA: 'Text Area', SELECT: 'Dropdown', LABEL: 'Label', SPAN: 'Text Span' };
  return tagRoles[tagName] || 'UI Element';
}

function getMoleculeRole(tagName, className = '', childCount = 0) {
  const cls = low(className);
  const classRoles = { card: 'Card', 'form-group': 'Form Group', 'list-item': 'List Item',
    media: 'Media Object', alert: 'Alert Message', panel: 'Panel',
    well: 'Well Container', box: 'Box Container' };
  for (const [k, v] of Object.entries(classRoles)) {
    if (cls.includes(k)) return v;
  }
  const tagRoles = { DIV: childCount > 5 ? 'Card Container' : 'Content Block',
    SECTION: 'Section', ARTICLE: 'Article', LI: 'List Item', TD: 'Table Cell',
    FORM: 'Form', FIELDSET: 'Field Set', DL: 'Description List' };
  return tagRoles[tagName] || 'Component';
}

function getShellRole(tagName, className = '') {
  const cls = low(className);
  const classRoles = { navbar: 'Navigation Bar', navigation: 'Navigation',
    header: 'Header', footer: 'Footer', sidebar: 'Sidebar',
    container: 'Container', wrapper: 'Wrapper' };
  for (const [k, v] of Object.entries(classRoles)) {
    if (cls.includes(k)) return v;
  }
  const tagRoles = { NAV: 'Navigation', HEADER: 'Header', FOOTER: 'Footer',
    MAIN: 'Main Content', ASIDE: 'Sidebar',
    SECTION: 'Section Container', ARTICLE: 'Article Container' };
  return tagRoles[tagName] || 'Layout Container';
}

/**
 * Determines the type and data for a single archetype group.
 * @param {string} basePattern
 * @param {Object} group - { elements[], count }
 * @returns {{ type: string, data: Object }|null}
 */
function categorizePatternGroup(basePattern, group) {
  const sample = group.elements[0];
  if (!sample) return null;

  const { tagName, className = '' } = sample;
  const childCount = (sample.children || []).length;
  generateStyleSpecifications(sample.styles, 'atom'); // placeholder call — result overridden per-type below

  const makeData = (type, role) => ({
    role,
    pattern: basePattern,
    count: group.count,
    styles: generateStyleSpecifications(sample.styles, type),
    ...(type === 'atom' && sample.hoverStyles
      ? { hover: generateStyleSpecifications(sample.hoverStyles, 'atom') }
      : {}),
    tagName,
    className,
    variants: extractVariants(group.elements, type),
  });

  if (isAtomElement(tagName, className, sample, childCount)) {
    return { type: 'atom', data: makeData('atom', getAtomRole(tagName, className)) };
  }
  if (isShellElement(tagName, className, childCount)) {
    return { type: 'shell', data: makeData('shell', getShellRole(tagName, className)) };
  }
  if (isMoleculeElement(tagName, className, childCount)) {
    return { type: 'molecule', data: makeData('molecule', getMoleculeRole(tagName, className, childCount)) };
  }

  // Fallback by child count
  if (childCount < 3) {
    return { type: 'atom', data: makeData('atom', getAtomRole(tagName, className)) };
  }
  if (childCount <= 10) {
    return { type: 'molecule', data: makeData('molecule', getMoleculeRole(tagName, className, childCount)) };
  }
  return { type: 'shell', data: makeData('shell', getShellRole(tagName, className)) };
}

module.exports = {
  categorizePatternGroup,
  isAtomElement, isMoleculeElement, isShellElement,
  getAtomRole, getMoleculeRole, getShellRole,
};
