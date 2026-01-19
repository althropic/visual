/**
 * Analyzes DOM element structures to identify archetypal components.
 * @param {Array} styleData - Array of element data from the scraper.
 * @returns {Object} - Detected component archetypes and their styles.
 */
function analyzeArchetypes(styleData) {
  // Build element tree patterns by analyzing parent-child relationships
  const treePatterns = buildTreePatterns(styleData);
  
  // Group similar patterns using similarity analysis
  const groupedPatterns = groupSimilarPatterns(treePatterns, styleData);
  
  // Identify frequent pattern groups as potential components
  const commonPatternGroups = Object.entries(groupedPatterns)
    .filter(([_, group]) => group.count >= 2) // Lower threshold for grouped patterns
    .sort((a, b) => b[1].count - a[1].count);

  const archetypes = {
    atoms: [],
    molecules: [],
    shells: []
  };

  // Categorize pattern groups into atoms, molecules, and shells
  commonPatternGroups.forEach(([basePattern, group]) => {
    const archetype = categorizePatternGroup(basePattern, group, styleData);
    if (archetype) {
      if (archetype.type === 'atom') {
        archetypes.atoms.push(archetype.data);
      } else if (archetype.type === 'molecule') {
        archetypes.molecules.push(archetype.data);
      } else if (archetype.type === 'shell') {
        archetypes.shells.push(archetype.data);
      }
    }
  });

  return archetypes;
}

/**
 * Builds tree patterns by analyzing parent-child relationships in the DOM
 * @param {Array} styleData - Array of element data from the scraper
 * @returns {Object} - Map of tree patterns to their frequencies
 */
function buildTreePatterns(styleData) {
  const treePatterns = {};
  
  // Analyze each element's structure
  styleData.forEach(item => {
    // Create a signature based on tag, classes, and simplified child structure
    const childStructure = (item.children || [])
      .map(child => `${child.tagName}.${(child.className || '').split(' ').join('.')}`)
      .filter(Boolean)
      .slice(0, 5); // Limit to first 5 children for pattern consistency
    
    // Create a pattern signature that includes parent and children
    const patternParts = [
      item.tagName,
      ...(item.className && typeof item.className === 'string' ? item.className.split(' ') : []),
      ...childStructure.map(child => `>${child}`)
    ];
    
    const pattern = patternParts.join('.');
    
    // Store pattern with additional metadata
    if (!treePatterns[pattern]) {
      treePatterns[pattern] = {
        count: 0,
        elements: []
      };
    }
    
    treePatterns[pattern].count += 1;
    treePatterns[pattern].elements.push(item);
  });
  
  return treePatterns;
}

/**
 * Groups similar patterns together based on structural similarity
 * @param {Object} treePatterns - Map of tree patterns to their data
 * @param {Array} styleData - Array of element data from the scraper
 * @returns {Object} - Grouped patterns with similarity scores
 */
function groupSimilarPatterns(treePatterns, styleData) {
  const groupedPatterns = {};
  
  // Convert to array for easier processing
  const patternEntries = Object.entries(treePatterns);
  
  patternEntries.forEach(([pattern, data]) => {
    // Find the most similar existing group or create a new one
    let bestMatch = null;
    let bestScore = 0;
    
    // Check against existing groups
    Object.keys(groupedPatterns).forEach(groupBase => {
      const similarity = calculatePatternSimilarity(pattern, groupBase);
      if (similarity > bestScore && similarity > 0.7) { // Threshold for similarity
        bestScore = similarity;
        bestMatch = groupBase;
      }
    });
    
    if (bestMatch) {
      // Add to existing group
      groupedPatterns[bestMatch].patterns.push(pattern);
      groupedPatterns[bestMatch].count += data.count;
      groupedPatterns[bestMatch].elements.push(...data.elements);
    } else {
      // Create new group
      groupedPatterns[pattern] = {
        patterns: [pattern],
        count: data.count,
        elements: [...data.elements]
      };
    }
  });
  
  return groupedPatterns;
}

/**
 * Calculates similarity between two patterns
 * @param {string} pattern1 - First pattern
 * @param {string} pattern2 - Second pattern
 * @returns {number} - Similarity score between 0 and 1
 */
function calculatePatternSimilarity(pattern1, pattern2) {
  // Simple Jaccard similarity on pattern parts
  const parts1 = pattern1.split('.');
  const parts2 = pattern2.split('.');
  
  // Convert to sets for easier comparison
  const set1 = new Set(parts1);
  const set2 = new Set(parts2);
  
  // Calculate intersection and union
  const intersection = [...set1].filter(part => set2.has(part)).length;
  const union = new Set([...parts1, ...parts2]).size;
  
  // Return Jaccard similarity
  return union === 0 ? 0 : intersection / union;
}

/**
 * Categorizes a pattern group into atom, molecule, or shell
 * @param {string} basePattern - The base pattern string
 * @param {Object} group - Group containing patterns, count, and elements
 * @param {Array} styleData - Array of element data from the scraper
 * @returns {Object|null} - Categorized archetype or null
 */
function categorizePatternGroup(basePattern, group, styleData) {
  // Use the first element in the group as representative
  const sample = group.elements[0];
  if (!sample) return null;
  
  const avgStyles = sample.styles;
  const tagName = sample.tagName;
  const className = sample.className || '';
  
  // Categorization logic with enhanced identification:
  // Atoms: Interactive elements or simple elements (< 3 children)
  // Molecules: Complex elements with 3-10 children or specific semantic classes
  // Shells: Elements with many children or specific structural roles
  
  const childCount = (sample.children || []).length;
  
  // Enhanced atom identification
  if (isAtomElement(tagName, className, sample, childCount)) {
    return {
      type: 'atom',
      data: { 
        role: getAtomRole(tagName, className), 
        pattern: basePattern, 
        count: group.count, 
        styles: generateStyleSpecifications(avgStyles, 'atom'),
        hover: sample.hoverStyles ? generateStyleSpecifications(sample.hoverStyles, 'atom') : null,
        tagName: tagName,
        className: className,
        variants: extractVariants(group.elements, 'atom')
      }
    };
  } 
  // Enhanced shell identification
  else if (isShellElement(tagName, className, childCount)) {
    return {
      type: 'shell',
      data: { 
        role: getShellRole(tagName, className), 
        pattern: basePattern, 
        count: group.count, 
        styles: generateStyleSpecifications(avgStyles, 'shell'),
        tagName: tagName,
        className: className,
        variants: extractVariants(group.elements, 'shell')
      }
    };
  }
  // Enhanced molecule identification
  else if (isMoleculeElement(tagName, className, childCount)) {
    return {
      type: 'molecule',
      data: { 
        role: getMoleculeRole(tagName, className, childCount), 
        pattern: basePattern, 
        count: group.count, 
        styles: generateStyleSpecifications(avgStyles, 'molecule'),
        tagName: tagName,
        className: className,
        variants: extractVariants(group.elements, 'molecule')
      }
    };
  }
  
  // Default categorization based on child count
  if (childCount < 3) {
    return {
      type: 'atom',
      data: { 
        role: getAtomRole(tagName, className), 
        pattern: basePattern, 
        count: group.count, 
        styles: generateStyleSpecifications(avgStyles, 'atom'),
        hover: sample.hoverStyles ? generateStyleSpecifications(sample.hoverStyles, 'atom') : null,
        tagName: tagName,
        className: className,
        variants: extractVariants(group.elements, 'atom')
      }
    };
  } else if (childCount <= 10) {
    return {
      type: 'molecule',
      data: { 
        role: getMoleculeRole(tagName, className, childCount), 
        pattern: basePattern, 
        count: group.count, 
        styles: generateStyleSpecifications(avgStyles, 'molecule'),
        tagName: tagName,
        className: className,
        variants: extractVariants(group.elements, 'molecule')
      }
    };
  } else {
    return {
      type: 'shell',
      data: { 
        role: getShellRole(tagName, className), 
        pattern: basePattern, 
        count: group.count, 
        styles: generateStyleSpecifications(avgStyles, 'shell'),
        tagName: tagName,
        className: className,
        variants: extractVariants(group.elements, 'shell')
      }
    };
  }
}

/**
 * Determines if an element should be categorized as an atom
 * @param {string} tagName - The HTML tag name
 * @param {string} className - The element's class name
 * @param {Object} element - The element object
 * @param {number} childCount - Number of child elements
 * @returns {boolean} - True if the element is an atom
 */
function isAtomElement(tagName, className, element, childCount) {
  // Ensure className is a string
  const classNameStr = typeof className === 'string' ? className : '';
  
  // Direct atom tags
  const atomTags = ['BUTTON', 'INPUT', 'A', 'IMG', 'TEXTAREA', 'SELECT', 'LABEL', 'SPAN'];
  if (atomTags.includes(tagName)) return true;
  
  // Interactive elements with few children
  if (element.isInteractive && childCount < 3) return true;
  
  // Elements with specific atom-like classes
  const atomClasses = ['btn', 'button', 'input', 'link', 'icon', 'checkbox', 'radio', 'switch'];
  if (atomClasses.some(cls => classNameStr.toLowerCase().includes(cls))) return true;
  
  return false;
}

/**
 * Determines if an element should be categorized as a molecule
 * @param {string} tagName - The HTML tag name
 * @param {string} className - The element's class name
 * @param {number} childCount - Number of child elements
 * @returns {boolean} - True if the element is a molecule
 */
function isMoleculeElement(tagName, className, childCount) {
  // Ensure className is a string
  const classNameStr = typeof className === 'string' ? className : '';
  
  // Molecules have moderate child counts
  if (childCount >= 3 && childCount <= 10) return true;
  
  // Elements with specific molecule-like classes
  const moleculeClasses = ['card', 'form-group', 'list-item', 'media', 'alert', 'panel', 'well', 'box'];
  if (moleculeClasses.some(cls => classNameStr.toLowerCase().includes(cls))) return true;
  
  // Specific tag combinations that indicate molecules
  const moleculeTags = ['FORM', 'FIELDSET', 'DL', 'UL', 'OL', 'TABLE'];
  if (moleculeTags.includes(tagName)) return true;
  
  return false;
}

/**
 * Determines if an element should be categorized as a shell
 * @param {string} tagName - The HTML tag name
 * @param {string} className - The element's class name
 * @param {number} childCount - Number of child elements
 * @returns {boolean} - True if the element is a shell
 */
function isShellElement(tagName, className, childCount) {
  // Ensure className is a string
  const classNameStr = typeof className === 'string' ? className : '';
  
  // Direct shell tags
  const shellTags = ['NAV', 'HEADER', 'FOOTER', 'MAIN', 'ASIDE', 'SECTION', 'ARTICLE'];
  if (shellTags.includes(tagName)) return true;
  
  // Elements with many children
  if (childCount > 10) return true;
  
  // Elements with specific shell-like classes
  const shellClasses = ['navbar', 'navigation', 'header', 'footer', 'sidebar', 'container', 'wrapper'];
  if (shellClasses.some(cls => classNameStr.toLowerCase().includes(cls))) return true;
  
  return false;
}

/**
 * Categorizes a pattern into atom, molecule, or shell
 * @param {string} pattern - The pattern string
 * @param {number} count - Frequency of the pattern
 * @param {Array} styleData - Array of element data from the scraper
 * @returns {Object|null} - Categorized archetype or null
 */
function categorizePattern(pattern, count, styleData) {
  // Split pattern to analyze components
  const parts = pattern.split('.');
  const tagName = parts[0];
  
  // Find matching elements for this pattern
  const samples = styleData.filter(item => 
    item.tagName === tagName && 
    (!parts[1] || (item.className || '').includes(parts[1]))
  );
  
  if (samples.length === 0) return null;
  
  // Use first sample as representative
  const sample = samples[0];
  const avgStyles = sample.styles;
  const className = sample.className || '';
  
  // Categorization logic with enhanced identification:
  // Atoms: Interactive elements or simple elements (< 3 children)
  // Molecules: Complex elements with 3-10 children or specific semantic classes
  // Shells: Elements with many children or specific structural roles
  
  const childCount = (sample.children || []).length;
  
  // Enhanced atom identification
  if (isAtomElement(tagName, className, sample, childCount)) {
    return {
      type: 'atom',
      data: { 
        role: getAtomRole(tagName, className), 
        pattern, 
        count, 
        styles: generateStyleSpecifications(avgStyles, 'atom'),
        hover: sample.hoverStyles ? generateStyleSpecifications(sample.hoverStyles, 'atom') : null,
        tagName: tagName,
        className: className,
        variants: extractVariants(samples, 'atom')
      }
    };
  } 
  // Enhanced shell identification
  else if (isShellElement(tagName, className, childCount)) {
    return {
      type: 'shell',
      data: { 
        role: getShellRole(tagName, className), 
        pattern, 
        count, 
        styles: generateStyleSpecifications(avgStyles, 'shell'),
        tagName: tagName,
        className: className,
        variants: extractVariants(samples, 'shell')
      }
    };
  }
  // Enhanced molecule identification
  else if (isMoleculeElement(tagName, className, childCount)) {
    return {
      type: 'molecule',
      data: { 
        role: getMoleculeRole(tagName, className, childCount), 
        pattern, 
        count, 
        styles: generateStyleSpecifications(avgStyles, 'molecule'),
        tagName: tagName,
        className: className,
        variants: extractVariants(samples, 'molecule')
      }
    };
  }
  
  // Default categorization based on child count
  if (childCount < 3) {
    return {
      type: 'atom',
      data: { 
        role: getAtomRole(tagName, className), 
        pattern, 
        count, 
        styles: generateStyleSpecifications(avgStyles, 'atom'),
        hover: sample.hoverStyles ? generateStyleSpecifications(sample.hoverStyles, 'atom') : null,
        tagName: tagName,
        className: className,
        variants: extractVariants(samples, 'atom')
      }
    };
  } else if (childCount <= 10) {
    return {
      type: 'molecule',
      data: { 
        role: getMoleculeRole(tagName, className, childCount), 
        pattern, 
        count, 
        styles: generateStyleSpecifications(avgStyles, 'molecule'),
        tagName: tagName,
        className: className,
        variants: extractVariants(samples, 'molecule')
      }
    };
  } else {
    return {
      type: 'shell',
      data: { 
        role: getShellRole(tagName, className), 
        pattern, 
        count, 
        styles: generateStyleSpecifications(avgStyles, 'shell'),
        tagName: tagName,
        className: className,
        variants: extractVariants(samples, 'shell')
      }
    };
  }
}

/**
 * Generates structured style specifications from raw style data
 * @param {Object} rawStyles - Raw style data from the scraper
 * @param {string} componentType - Type of component (atom, molecule, shell)
 * @returns {Object} - Structured style specifications
 */
function generateStyleSpecifications(rawStyles, componentType) {
  if (!rawStyles) return {};
  
  // Organize styles by category
  const styleSpecs = {
    layout: {},
    typography: {},
    colors: {},
    spacing: {},
    borders: {},
    effects: {},
    sizing: {}
  };
  
  // Map CSS properties to categories
  const propertyCategories = {
    // Layout properties
    'display': 'layout',
    'position': 'layout',
    'top': 'layout',
    'right': 'layout',
    'bottom': 'layout',
    'left': 'layout',
    'float': 'layout',
    'clear': 'layout',
    'zIndex': 'layout',
    
    // Typography properties
    'fontFamily': 'typography',
    'fontSize': 'typography',
    'fontWeight': 'typography',
    'lineHeight': 'typography',
    'letterSpacing': 'typography',
    'textAlign': 'typography',
    'textTransform': 'typography',
    'textDecoration': 'typography',
    
    // Color properties
    'color': 'colors',
    'backgroundColor': 'colors',
    'borderColor': 'colors',
    'outlineColor': 'colors',
    
    // Spacing properties
    'margin': 'spacing',
    'marginTop': 'spacing',
    'marginRight': 'spacing',
    'marginBottom': 'spacing',
    'marginLeft': 'spacing',
    'padding': 'spacing',
    'paddingTop': 'spacing',
    'paddingRight': 'spacing',
    'paddingBottom': 'spacing',
    'paddingLeft': 'spacing',
    
    // Border properties
    'border': 'borders',
    'borderWidth': 'borders',
    'borderStyle': 'borders',
    'borderRadius': 'borders',
    
    // Effect properties
    'boxShadow': 'effects',
    'opacity': 'effects',
    'transition': 'effects',
    'transform': 'effects',
    
    // Sizing properties
    'width': 'sizing',
    'height': 'sizing',
    'minWidth': 'sizing',
    'maxWidth': 'sizing',
    'minHeight': 'sizing',
    'maxHeight': 'sizing'
  };
  
  // Categorize each style property
  Object.entries(rawStyles).forEach(([property, value]) => {
    const category = propertyCategories[property] || 'layout';
    styleSpecs[category][property] = value;
  });
  
  // Add component-specific enhancements
  if (componentType === 'atom') {
    styleSpecs.interactive = {
      focus: {},
      hover: {},
      active: {},
      disabled: {}
    };
  } else if (componentType === 'molecule') {
    styleSpecs.composition = {
      children: [],
      layout: 'flex' // Default assumption
    };
  } else if (componentType === 'shell') {
    styleSpecs.responsive = {
      mobile: {},
      tablet: {},
      desktop: {}
    };
  }
  
  return styleSpecs;
}

/**
 * Extracts variants from a group of similar elements
 * @param {Array} elements - Array of element data
 * @param {string} componentType - Type of component (atom, molecule, shell)
 * @returns {Array} - Array of variant specifications
 */
function extractVariants(elements, componentType) {
  if (!elements || elements.length <= 1) return [];
  
  const variants = [];
  const variantMap = {};
  
  // Group elements by className patterns
  elements.forEach(element => {
    const className = element.className || '';
    const classes = typeof className === 'string' ? className.split(' ').filter(c => c) : [];
    
    // Create a signature based on class variations
    const variantKey = classes.sort().join(' ');
    
    if (!variantMap[variantKey]) {
      variantMap[variantKey] = {
        classNames: classes,
        count: 0,
        elements: []
      };
    }
    
    variantMap[variantKey].count++;
    variantMap[variantKey].elements.push(element);
  });
  
  // Create variant specifications
  Object.entries(variantMap).forEach(([key, variantData]) => {
    if (variantData.count > 1) {
      variants.push({
        name: generateVariantName(variantData.classNames, componentType),
        classNames: variantData.classNames,
        count: variantData.count,
        styles: variantData.elements[0]?.styles ? 
          generateStyleSpecifications(variantData.elements[0].styles, componentType) : {}
      });
    }
  });
  
  return variants;
}

/**
 * Generates a human-readable name for a variant based on class names
 * @param {Array} classNames - Array of class names
 * @param {string} componentType - Type of component (atom, molecule, shell)
 * @returns {string} - Human-readable variant name
 */
function generateVariantName(classNames, componentType) {
  // Common variant indicators
  const variantIndicators = {
    'primary': 'Primary',
    'secondary': 'Secondary',
    'tertiary': 'Tertiary',
    'success': 'Success',
    'warning': 'Warning',
    'error': 'Error',
    'info': 'Info',
    'large': 'Large',
    'small': 'Small',
    'medium': 'Medium',
    'disabled': 'Disabled',
    'active': 'Active',
    'selected': 'Selected'
  };
  
  // Find the first matching indicator
  for (const [indicator, name] of Object.entries(variantIndicators)) {
    if (classNames.some(cls => cls.includes(indicator))) {
      return name;
    }
  }
  
  // Default naming based on component type
  const defaultNames = {
    'atom': 'Variant',
    'molecule': 'Layout Variant',
    'shell': 'Theme Variant'
  };
  
  return defaultNames[componentType] || 'Variant';
}

/**
 * Determines the role of an atom based on its tag name and class name
 * @param {string} tagName - The HTML tag name
 * @param {string} className - The element's class name
 * @returns {string} - The role description
 */
function getAtomRole(tagName, className = '') {
  // Ensure className is a string
  const classNameStr = typeof className === 'string' ? className : '';
  
  // Check for specific class-based roles first
  const classRoles = {
    'btn': 'Button',
    'button': 'Button',
    'input': 'Input Field',
    'link': 'Link',
    'icon': 'Icon',
    'checkbox': 'Checkbox',
    'radio': 'Radio Button',
    'switch': 'Toggle Switch'
  };
  
  // Check if any class role matches
  for (const [cls, role] of Object.entries(classRoles)) {
    if (classNameStr.toLowerCase().includes(cls)) {
      return role;
    }
  }
  
  // Fall back to tag-based roles
  const tagRoles = {
    'BUTTON': 'Button',
    'INPUT': 'Input Field',
    'A': 'Link',
    'IMG': 'Image',
    'TEXTAREA': 'Text Area',
    'SELECT': 'Dropdown',
    'LABEL': 'Label',
    'SPAN': 'Text Span'
  };
  
  return tagRoles[tagName] || 'UI Element';
}

/**
 * Determines the role of a molecule based on its tag name, class name, and child count
 * @param {string} tagName - The HTML tag name
 * @param {string} className - The element's class name
 * @param {number} childCount - Number of child elements
 * @returns {string} - The role description
 */
function getMoleculeRole(tagName, className = '', childCount = 0) {
  // Ensure className is a string
  const classNameStr = typeof className === 'string' ? className : '';
  
  // Check for specific class-based roles first
  const classRoles = {
    'card': 'Card',
    'form-group': 'Form Group',
    'list-item': 'List Item',
    'media': 'Media Object',
    'alert': 'Alert Message',
    'panel': 'Panel',
    'well': 'Well Container',
    'box': 'Box Container'
  };
  
  // Check if any class role matches
  for (const [cls, role] of Object.entries(classRoles)) {
    if (classNameStr.toLowerCase().includes(cls)) {
      return role;
    }
  }
  
  // Fall back to tag-based roles with child count consideration
  const tagRoles = {
    'DIV': childCount > 5 ? 'Card Container' : 'Content Block',
    'SECTION': 'Section',
    'ARTICLE': 'Article',
    'LI': 'List Item',
    'TD': 'Table Cell',
    'FORM': 'Form',
    'FIELDSET': 'Field Set',
    'DL': 'Description List'
  };
  
  return tagRoles[tagName] || 'Component';
}

/**
 * Determines the role of a shell based on its tag name and class name
 * @param {string} tagName - The HTML tag name
 * @param {string} className - The element's class name
 * @returns {string} - The role description
 */
function getShellRole(tagName, className = '') {
  // Ensure className is a string
  const classNameStr = typeof className === 'string' ? className : '';
  
  // Check for specific class-based roles first
  const classRoles = {
    'navbar': 'Navigation Bar',
    'navigation': 'Navigation',
    'header': 'Header',
    'footer': 'Footer',
    'sidebar': 'Sidebar',
    'container': 'Container',
    'wrapper': 'Wrapper'
  };
  
  // Check if any class role matches
  for (const [cls, role] of Object.entries(classRoles)) {
    if (classNameStr.toLowerCase().includes(cls)) {
      return role;
    }
  }
  
  // Fall back to tag-based roles
  const tagRoles = {
    'NAV': 'Navigation',
    'HEADER': 'Header',
    'FOOTER': 'Footer',
    'MAIN': 'Main Content',
    'ASIDE': 'Sidebar',
    'SECTION': 'Section Container',
    'ARTICLE': 'Article Container'
  };
  
  return tagRoles[tagName] || 'Layout Container';
}

module.exports = { analyzeArchetypes };