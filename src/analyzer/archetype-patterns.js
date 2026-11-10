'use strict';

const { config } = require('../config');

/**
 * Builds a frequency map of DOM structural patterns from scraped element data.
 * @param {Array} styleData
 * @returns {Object} map of pattern-string → { count, elements[] }
 */
function buildTreePatterns(styleData) {
  const treePatterns = {};

  styleData.forEach(item => {
    const childStructure = (item.children || [])
      .map(child => `${child.tagName}.${(child.className || '').split(' ').join('.')}`)
      .filter(Boolean)
      .slice(0, 5);

    const patternParts = [
      item.tagName,
      ...(item.className && typeof item.className === 'string' ? item.className.split(' ') : []),
      ...childStructure.map(c => `>${c}`),
    ];
    const pattern = patternParts.join('.');

    if (!treePatterns[pattern]) {
      treePatterns[pattern] = { count: 0, elements: [] };
    }
    treePatterns[pattern].count += 1;
    treePatterns[pattern].elements.push(item);
  });

  return treePatterns;
}

/**
 * Calculates Jaccard similarity between two dot-separated pattern strings.
 * @param {string} pattern1
 * @param {string} pattern2
 * @returns {number} 0–1
 */
function calculatePatternSimilarity(pattern1, pattern2) {
  const parts1 = pattern1.split('.');
  const parts2 = pattern2.split('.');
  const set1 = new Set(parts1);
  const set2 = new Set(parts2);
  const intersection = [...set1].filter(p => set2.has(p)).length;
  const union = new Set([...parts1, ...parts2]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Groups structurally-similar patterns into clusters using Jaccard similarity.
 * @param {Object} treePatterns - output of buildTreePatterns
 * @returns {Object} map of group-key → { patterns[], count, elements[] }
 */
function groupSimilarPatterns(treePatterns) {
  const grouped = {};

  for (const [pattern, data] of Object.entries(treePatterns)) {
    let bestMatch = null;
    let bestScore = 0;

    for (const groupBase of Object.keys(grouped)) {
      const sim = calculatePatternSimilarity(pattern, groupBase);
      if (sim > bestScore && sim > config.analyzer.archetypeSimilarityThreshold) {
        bestScore = sim;
        bestMatch = groupBase;
      }
    }

    if (bestMatch) {
      grouped[bestMatch].patterns.push(pattern);
      grouped[bestMatch].count += data.count;
      grouped[bestMatch].elements.push(...data.elements);
    } else {
      grouped[pattern] = {
        patterns: [pattern],
        count: data.count,
        elements: [...data.elements],
      };
    }
  }

  return grouped;
}

module.exports = { buildTreePatterns, groupSimilarPatterns, calculatePatternSimilarity };
