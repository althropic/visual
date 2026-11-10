'use strict';

/**
 * Scores a raster image on how logo-like it is.
 * @param {Object} img
 * @returns {number}
 */
function scoreLogoCandidate(img) {
  const w = img.naturalWidth  || img.width  || 1;
  const h = img.naturalHeight || img.height || 1;
  const ratio = w / h;
  const area  = w * h;
  let score = 0;

  if (w >= 50 && h >= 50 && w <= 500 && h <= 500) score += 2;
  else if (w >= 30 && h >= 30 && w <= 800 && h <= 800) score += 1;

  if (ratio >= 0.33 && ratio <= 3) score += 2;
  else if (ratio >= 0.2 && ratio <= 5) score += 1;

  if (area >= 2500 && area <= 250_000) score += 1;

  return score;
}

/**
 * Extracts SVG and raster logo candidates from scraped asset data.
 * @param {Object} assets - { images: Array, favicons: Array }
 * @returns {{ svgLogos: Array, rasterLogos: Array, primaryLogo: Object|null, favicon: Object|null }}
 */
function extractLogos(assets) {
  if (!assets || !assets.images) return {};

  const potentialLogos = assets.images.filter(img => {
    const src = img.src.toLowerCase();
    const alt = img.alt?.toLowerCase() || '';
    const hasLogoPattern =
      src.includes('logo') || src.includes('brand') || src.includes('icon') ||
      alt.includes('logo') || alt.includes('brand');
    const isLikelyLogo =
      (img.y < 200 && img.x < 300) ||
      (img.naturalWidth && img.naturalHeight &&
        Math.abs(img.naturalWidth - img.naturalHeight) < Math.min(img.naturalWidth, img.naturalHeight) * 0.5) ||
      (img.naturalWidth < 500 && img.naturalHeight < 500);
    return hasLogoPattern || isLikelyLogo;
  });

  const svgLogos    = potentialLogos.filter(img => img.src.endsWith('.svg'));
  const rasterLogos = potentialLogos
    .filter(img => !img.src.endsWith('.svg'))
    .map(img => ({ ...img, qualityScore: scoreLogoCandidate(img) }))
    .sort((a, b) => b.qualityScore - a.qualityScore);

  const primaryLogo = svgLogos[0] || rasterLogos[0] || null;

  return {
    svgLogos,
    rasterLogos: rasterLogos.slice(0, 10),
    primaryLogo,
    favicon: assets.favicons?.[0] || null,
  };
}

module.exports = { extractLogos };
