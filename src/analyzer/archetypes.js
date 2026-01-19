/**
 * Analyzes DOM element structures to identify archetypal components.
 * @param {Array} styleData - Array of element data from the scraper.
 * @returns {Object} - Detected component archetypes and their styles.
 */
function analyzeArchetypes(styleData) {
  const treePatterns = {};

  // Build a simplified representation of element trees
  styleData.forEach(item => {
    // For now, we use a simple heuristic: group by tag + className + common children
    const pattern = `${item.tagName}.${(item.className || '').split(' ').join('.')}`;
    treePatterns[pattern] = (treePatterns[pattern] || 0) + 1;
  });

  // Identify frequent patterns (> 5 occurrences) as potential components
  const commonPatterns = Object.entries(treePatterns)
    .filter(([_, count]) => count >= 5)
    .sort((a, b) => b[1] - a[1]);

  const archetypes = {
    atoms: [],
    molecules: [],
    shells: []
  };

  commonPatterns.forEach(([pattern, count]) => {
    const [tag, classes] = pattern.split('.');
    const samples = styleData.filter(item => 
      item.tagName === tag && 
      (item.className || '').includes(classes.replace(/\./g, ' '))
    );

    const avgStyles = samples[0].styles; // Use first sample as representative

    if (tag === 'BUTTON' || (tag === 'A' && samples[0].isInteractive)) {
      archetypes.atoms.push({ role: 'Button', pattern, count, styles: avgStyles, hover: samples[0].hoverStyles });
    } else if (count >= 10) {
      archetypes.molecules.push({ role: 'Card/Item', pattern, count, styles: avgStyles });
    }
  });

  return archetypes;
}

module.exports = { analyzeArchetypes };