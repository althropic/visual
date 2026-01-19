/**
 * Analyzes asset data to find the highest z-index image in the top-left quadrant.
 * @param {Object} assets - Asset data from the scraper.
 * @param {Array} styleData - Style data from the scraper for z-index comparison.
 * @returns {Object|null} - Information about the highest z-index image in the top-left quadrant.
 */
function analyzeAssets(assets, styleData) {
  if (!assets || !assets.images) {
    return null;
  }

  // Find the highest z-index image in the top-left quadrant
  const topLeftImages = assets.images
    .filter(img => {
      // Filter for images in the top-left quadrant (approximately)
      // We'll consider the top-left quadrant as the area from (0,0) to (viewportWidth/2, viewportHeight/2)
      return img.x >= 0 && img.y >= 0 && img.x <= 800 && img.y <= 600;
    })
    .map(img => {
      // Find corresponding element in styleData to get z-index
      const element = styleData.find(item => 
        item.tagName === 'IMG' && 
        (item.rect.x === img.x || Math.abs(item.rect.x - img.x) < 5) && 
        (item.rect.y === img.y || Math.abs(item.rect.y - img.y) < 5)
      );
      
      return {
        ...img,
        zIndex: element ? parseInt(element.styles.zIndex, 10) || 0 : 0
      };
    })
    .sort((a, b) => b.zIndex - a.zIndex);

  // Return the highest z-index image or null if none found
  return topLeftImages.length > 0 ? topLeftImages[0] : null;
}

/**
 * Downloads and saves favicon assets.
 * @param {Array} favicons - Array of favicon objects.
 * @param {string} outputDir - Directory to save the favicons.
 * @param {Object} page - Playwright page object for downloading.
 * @returns {Promise<Array>} - Array of downloaded favicon file paths.
 */
async function downloadFavicons(favicons, outputDir, page) {
  const fs = require('fs').promises;
  const path = require('path');
  
  // Create assets directory if it doesn't exist
  const assetsDir = path.join(outputDir, 'assets');
  try {
    await fs.mkdir(assetsDir, { recursive: true });
  } catch (err) {
    console.warn('Could not create assets directory:', err);
  }
  
  const downloadedFavicons = [];
  
  for (const favicon of favicons) {
    try {
      // Generate filename based on sizes and type
      const fileName = `favicon${favicon.sizes ? `-${favicon.sizes}` : ''}${favicon.type.includes('png') ? '.png' : '.ico'}`;
      const filePath = path.join(assetsDir, fileName);
      
      // Download the favicon
      const response = await page.request.get(favicon.href);
      if (response.ok()) {
        const buffer = await response.body();
        await fs.writeFile(filePath, buffer);
        downloadedFavicons.push({
          href: favicon.href,
          type: favicon.type,
          sizes: favicon.sizes,
          filePath: path.relative(outputDir, filePath)
        });
      }
    } catch (err) {
      console.warn(`Failed to download favicon ${favicon.href}:`, err.message);
      // Continue with other favicons even if one fails
    }
  }
  
  return downloadedFavicons;
}

/**
 * Extracts SVG or raster logo assets.
 * @param {Object} assets - Asset data from the scraper.
 * @returns {Object} - Information about logo assets.
 */
function extractLogos(assets) {
  if (!assets) {
    return {};
  }

  // Look for logos in images based on common naming patterns and characteristics
  const potentialLogos = assets.images.filter(img => {
    const srcLower = img.src.toLowerCase();
    const altLower = img.alt?.toLowerCase() || '';
    
    // Check for common logo naming patterns
    const hasLogoPattern = srcLower.includes('logo') || 
                          srcLower.includes('brand') || 
                          srcLower.includes('icon') ||
                          altLower.includes('logo') ||
                          altLower.includes('brand');
    
    // Additional heuristics for logo detection
    const isLikelyLogo = 
      // Header or navigation area logos (common placement)
      (img.y < 200 && img.x < 300) ||
      // Square-ish images (logos are often square)
      (img.naturalWidth && img.naturalHeight && 
       Math.abs(img.naturalWidth - img.naturalHeight) < Math.min(img.naturalWidth, img.naturalHeight) * 0.5) ||
      // Small to medium sized images (logos are typically not huge)
      (img.naturalWidth < 500 && img.naturalHeight < 500);
    
    return hasLogoPattern || isLikelyLogo;
  });

  // Look for SVG logos specifically
  const svgLogos = potentialLogos.filter(img => {
    // Check if it's an SVG file
    if (img.src.endsWith('.svg')) {
      return true;
    }
    
    // Check if it's an inline SVG (if we had access to DOM elements)
    // This would require additional scraping of the actual SVG content
    
    return false;
  });

  // Categorize raster logos by quality and suitability
  const rasterLogos = potentialLogos
    .filter(img => !img.src.endsWith('.svg'))
    .map(img => {
      // Calculate a quality score based on dimensions and aspect ratio
      const width = img.naturalWidth || img.width || 1;
      const height = img.naturalHeight || img.height || 1;
      const aspectRatio = width / height;
      const area = width * height;
      
      // Score based on ideal logo characteristics:
      // - Not too small (minimum size)
      // - Reasonable aspect ratio (not too wide or tall)
      // - Good resolution
      let qualityScore = 0;
      
      // Size scoring (ideal range 50x50 to 300x300)
      if (width >= 50 && height >= 50 && width <= 500 && height <= 500) {
        qualityScore += 2;
      } else if (width >= 30 && height >= 30 && width <= 800 && height <= 800) {
        qualityScore += 1;
      }
      
      // Aspect ratio scoring (ideal is 1:1, acceptable up to 3:1 or 1:3)
      if (aspectRatio >= 0.33 && aspectRatio <= 3) {
        qualityScore += 2;
      } else if (aspectRatio >= 0.2 && aspectRatio <= 5) {
        qualityScore += 1;
      }
      
      // Resolution scoring (higher is better, but not excessively high)
      if (area >= 2500 && area <= 250000) { // Between 50x50 and 500x500
        qualityScore += 1;
      }
      
      return {
        ...img,
        qualityScore
      };
    })
    .sort((a, b) => b.qualityScore - a.qualityScore);

  // Identify the primary logo (best SVG or highest quality raster)
  let primaryLogo = null;
  if (svgLogos.length > 0) {
    // Prefer SVG logos as primary
    primaryLogo = svgLogos[0];
  } else if (rasterLogos.length > 0) {
    // Fallback to highest quality raster logo
    primaryLogo = rasterLogos[0];
  }

  return {
    svgLogos: svgLogos,
    rasterLogos: rasterLogos.slice(0, 10), // Top 10 quality raster logos
    primaryLogo: primaryLogo,
    favicon: assets.favicons[0] || null // Primary favicon
  };
}

module.exports = { analyzeAssets, downloadFavicons, extractLogos };