'use strict';

const { downloadFavicons, downloadLogos } = require('./asset-downloader');
const { extractLogos } = require('./logo-extractor');

/**
 * Finds the highest z-index image in the top-left quadrant of the viewport.
 * Used as a heuristic for the primary brand/logo image.
 * @param {Object} assets - { images: Array }
 * @param {Array} styleData
 * @returns {Object|null}
 */
function analyzeAssets(assets, styleData) {
  if (!assets?.images) return null;

  const topLeftImages = assets.images
    .filter(img => img.x >= 0 && img.y >= 0 && img.x <= 800 && img.y <= 600)
    .map(img => {
      const element = styleData.find(item =>
        item.tagName === 'IMG' &&
        Math.abs(item.rect.x - img.x) < 5 &&
        Math.abs(item.rect.y - img.y) < 5
      );
      return { ...img, zIndex: element ? parseInt(element.styles.zIndex, 10) || 0 : 0 };
    })
    .sort((a, b) => b.zIndex - a.zIndex);

  return topLeftImages[0] || null;
}

module.exports = { analyzeAssets, downloadFavicons, downloadLogos, extractLogos };
