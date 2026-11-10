'use strict';

/** CSS property → style category mapping */
const PROPERTY_CATEGORIES = Object.freeze({
  display: 'layout', position: 'layout', top: 'layout', right: 'layout',
  bottom: 'layout', left: 'layout', float: 'layout', clear: 'layout', zIndex: 'layout',
  fontFamily: 'typography', fontSize: 'typography', fontWeight: 'typography',
  lineHeight: 'typography', letterSpacing: 'typography', textAlign: 'typography',
  textTransform: 'typography', textDecoration: 'typography',
  color: 'colors', backgroundColor: 'colors', borderColor: 'colors', outlineColor: 'colors',
  margin: 'spacing', marginTop: 'spacing', marginRight: 'spacing',
  marginBottom: 'spacing', marginLeft: 'spacing',
  padding: 'spacing', paddingTop: 'spacing', paddingRight: 'spacing',
  paddingBottom: 'spacing', paddingLeft: 'spacing',
  border: 'borders', borderWidth: 'borders', borderStyle: 'borders', borderRadius: 'borders',
  boxShadow: 'effects', opacity: 'effects', transition: 'effects', transform: 'effects',
  width: 'sizing', height: 'sizing', minWidth: 'sizing', maxWidth: 'sizing',
  minHeight: 'sizing', maxHeight: 'sizing',
});

const VARIANT_INDICATORS = Object.freeze({
  primary: 'Primary', secondary: 'Secondary', tertiary: 'Tertiary',
  success: 'Success', warning: 'Warning', error: 'Error', info: 'Info',
  large: 'Large', small: 'Small', medium: 'Medium',
  disabled: 'Disabled', active: 'Active', selected: 'Selected',
});

const VARIANT_DEFAULTS = Object.freeze({
  atom: 'Variant', molecule: 'Layout Variant', shell: 'Theme Variant',
});

/**
 * Categorises raw CSS property map into typed style spec object.
 * @param {Object} rawStyles
 * @param {'atom'|'molecule'|'shell'} componentType
 * @returns {Object}
 */
function generateStyleSpecifications(rawStyles, componentType) {
  if (!rawStyles) return {};

  const styleSpecs = {
    layout: {}, typography: {}, colors: {}, spacing: {},
    borders: {}, effects: {}, sizing: {},
  };

  for (const [property, value] of Object.entries(rawStyles)) {
    const category = PROPERTY_CATEGORIES[property] || 'layout';
    styleSpecs[category][property] = value;
  }

  if (componentType === 'atom') {
    styleSpecs.interactive = { focus: {}, hover: {}, active: {}, disabled: {} };
  } else if (componentType === 'molecule') {
    styleSpecs.composition = { children: [], layout: 'flex' };
  } else if (componentType === 'shell') {
    styleSpecs.responsive = { mobile: {}, tablet: {}, desktop: {} };
  }

  return styleSpecs;
}

/**
 * Derives a human-readable variant name from class names.
 * @param {string[]} classNames
 * @param {'atom'|'molecule'|'shell'} componentType
 * @returns {string}
 */
function generateVariantName(classNames, componentType) {
  for (const [indicator, name] of Object.entries(VARIANT_INDICATORS)) {
    if (classNames.some(cls => cls.includes(indicator))) return name;
  }
  return VARIANT_DEFAULTS[componentType] || 'Variant';
}

/**
 * Extracts variant specifications from a group of similar elements.
 * @param {Array} elements
 * @param {'atom'|'molecule'|'shell'} componentType
 * @returns {Array}
 */
function extractVariants(elements, componentType) {
  if (!elements || elements.length <= 1) return [];

  const variantMap = {};
  for (const element of elements) {
    const className = element.className || '';
    const classes = typeof className === 'string' ? className.split(' ').filter(Boolean) : [];
    const key = [...classes].sort().join(' ');
    if (!variantMap[key]) {
      variantMap[key] = { classNames: classes, count: 0, elements: [] };
    }
    variantMap[key].count++;
    variantMap[key].elements.push(element);
  }

  return Object.values(variantMap)
    .filter(v => v.count > 1)
    .map(v => ({
      name: generateVariantName(v.classNames, componentType),
      classNames: v.classNames,
      count: v.count,
      styles: v.elements[0]?.styles
        ? generateStyleSpecifications(v.elements[0].styles, componentType)
        : {},
    }));
}

module.exports = { generateStyleSpecifications, extractVariants, generateVariantName };
