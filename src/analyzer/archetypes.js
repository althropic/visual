'use strict';

const { config } = require('../config');
const { buildTreePatterns, groupSimilarPatterns } = require('./archetype-patterns');
const { categorizePatternGroup } = require('./archetype-classifiers');

/**
 * Analyses DOM element structures to identify archetypal components
 * (atoms, molecules, shells).
 * @param {Array} styleData - Array of element data from the scraper.
 * @returns {{ atoms: Array, molecules: Array, shells: Array }}
 */
function analyzeArchetypes(styleData) {
  const treePatterns    = buildTreePatterns(styleData);
  const groupedPatterns = groupSimilarPatterns(treePatterns);

  const commonGroups = Object.entries(groupedPatterns)
    .filter(([, group]) => group.count >= config.analyzer.archetypeMinCount)
    .sort((a, b) => b[1].count - a[1].count);

  const archetypes = { atoms: [], molecules: [], shells: [] };

  for (const [basePattern, group] of commonGroups) {
    const archetype = categorizePatternGroup(basePattern, group);
    if (!archetype) continue;
    if (archetype.type === 'atom')     archetypes.atoms.push(archetype.data);
    else if (archetype.type === 'molecule') archetypes.molecules.push(archetype.data);
    else if (archetype.type === 'shell')    archetypes.shells.push(archetype.data);
  }

  return archetypes;
}

module.exports = { analyzeArchetypes };
