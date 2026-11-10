'use strict';

const fs   = require('fs').promises;
const path = require('path');
const { logger } = require('../logger');

/**
 * Downloads a single asset via Playwright's request API.
 * Returns the relative file path on success, null on failure.
 * @param {import('playwright').Page} page
 * @param {string} url
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
async function downloadAsset(page, url, filePath) {
  const response = await page.request.get(url);
  if (!response.ok()) return false;
  await fs.writeFile(filePath, await response.body());
  return true;
}

/**
 * Downloads favicon assets to `<outputDir>/assets/favicons/`.
 * @param {Array} favicons
 * @param {string} outputDir
 * @param {import('playwright').Page} page
 * @returns {Promise<Array>}
 */
async function downloadFavicons(favicons, outputDir, page) {
  const dir = path.join(outputDir, 'assets', 'favicons');
  try { await fs.mkdir(dir, { recursive: true }); }
  catch (err) { logger.warn(`Could not create favicons directory: ${err.message}`); }

  const results = [];
  for (const favicon of favicons) {
    try {
      const ext      = favicon.type.includes('png') ? '.png' : '.ico';
      const fileName = `favicon${favicon.sizes ? `-${favicon.sizes}` : ''}${ext}`;
      const filePath = path.join(dir, fileName);
      const ok       = await downloadAsset(page, favicon.href, filePath);
      if (ok) {
        results.push({ href: favicon.href, type: favicon.type,
          sizes: favicon.sizes, filePath: path.relative(outputDir, filePath) });
      }
    } catch (err) {
      logger.warn(`Failed to download favicon ${favicon.href}: ${err.message}`);
    }
  }
  return results;
}

/**
 * Downloads potential logo images to `<outputDir>/assets/logos/`.
 * Applies keyword + position heuristics to filter candidates.
 * @param {Array} images
 * @param {string} outputDir
 * @param {import('playwright').Page} page
 * @returns {Promise<Array>}
 */
async function downloadLogos(images, outputDir, page) {
  const dir = path.join(outputDir, 'assets', 'logos');
  try { await fs.mkdir(dir, { recursive: true }); }
  catch (err) { logger.warn(`Could not create logos directory: ${err.message}`); }

  const potentialLogos = images.filter(img => {
    const src = img.src.toLowerCase();
    const alt = img.alt?.toLowerCase() || '';
    const hasKeyword   = src.includes('logo') || alt.includes('logo') || src.includes('brand') || alt.includes('brand');
    const reasonableSize = img.width >= 50 && img.width <= 500 && img.height >= 20 && img.height <= 200;
    const topLeft        = img.x <= 400 && img.y <= 200;
    return (hasKeyword || topLeft) && reasonableSize;
  });

  const results = [];
  for (const logo of potentialLogos.slice(0, 5)) {
    try {
      const url      = new URL(logo.src);
      const fileName = path.basename(url.pathname) || `logo-${Date.now()}.png`;
      const filePath = path.join(dir, fileName);
      const ok       = await downloadAsset(page, logo.src, filePath);
      if (ok) {
        results.push({ src: logo.src, alt: logo.alt,
          width: logo.width, height: logo.height,
          filePath: path.relative(outputDir, filePath) });
      }
    } catch (err) {
      logger.warn(`Failed to download logo ${logo.src}: ${err.message}`);
    }
  }
  return results;
}

module.exports = { downloadFavicons, downloadLogos };
