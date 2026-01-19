const { scrape } = require('./scraper');
const { analyzeColors } = require('./analyzer/colors');
const { analyzeSpatial } = require('./analyzer/spatial');
const { analyzeArchetypes } = require('./analyzer/archetypes');
const { analyzeHoverStates } = require('./analyzer/hover');
const { analyzeAssets, extractLogos, downloadFavicons } = require('./analyzer/assets');
const { mapSemanticRoles } = require('./llm/client');
const { generateDesignDoc } = require('./generator/design-md');
const { generateTailwindConfig } = require('./generator/tailwind-config');
const { generateReactComponents } = require('./generator/react-components');
const fs = require('fs').promises;
const path = require('path');

/**
 * Main orchestration function to extract design system from a URL.
 * @param {string} url - The target URL.
 * @param {string} outputDir - The directory to save the design package.
 */
async function extractDesign(url, outputDir = 'dist') {
  console.log(`Starting "True Capture" extraction for: ${url}`);

  try {
    // 1. Scrape style data and assets
    console.log('Scraping style data and assets...');
    const scrapedData = await scrape(url);
    const styles = scrapedData.styles;
    const assets = scrapedData.assets;

    // 2. Run heuristic analysis
    console.log('Analyzing colors and spatial patterns...');
    const colors = analyzeColors(styles);
    const spatial = analyzeSpatial(styles);
    
    console.log('Identifying archetypal components...');
    const archetypes = analyzeArchetypes(styles);

    // Analyze hover states for interactive elements
    console.log('Analyzing hover state interactions...');
    const hoverStates = analyzeHoverStates(styles);

    // Analyze assets for logos and favicons
    console.log('Analyzing asset data...');
    const topLeftImage = analyzeAssets(assets, styles);
    const logos = extractLogos(assets);
    
    // Download favicons
    console.log('Downloading favicon assets...');
    const downloadedFavicons = await downloadFavicons(assets.favicons || [], outputDir, scrapedData.page);

    // 3. LLM Semantic Mapping & Component Generation
    console.log('Mapping semantic roles and generating components via LLM...');
    const designData = await mapSemanticRoles({ colors, spatial, archetypes, hoverStates, assets: { topLeftImage, logos, favicons: downloadedFavicons } });
    
    // Generate React components from archetypes
    console.log('Generating React components from archetypes...');
    const reactComponents = await generateReactComponents(archetypes, designData);

    // 4. Create output structure
    console.log(`Creating output directory: ${outputDir}`);
    await fs.mkdir(outputDir, { recursive: true });
    await fs.mkdir(path.join(outputDir, 'components'), { recursive: true });

    // 5. Generate and save implementation files
    console.log('Saving implementation files...');
    
    // DESIGN.md
    const designDoc = generateDesignDoc(designData);
    await fs.writeFile(path.join(outputDir, 'DESIGN.md'), designDoc);

    // tailwind.config.js
    const twConfig = generateTailwindConfig(designData, colors);
    await fs.writeFile(path.join(outputDir, 'tailwind.config.js'), twConfig);

    // theme.css
    const themeCss = `:root {
  --primary: ${designData.colorTokens.primaryAction};
  --secondary: ${designData.colorTokens.secondaryAction};
  --surface: ${designData.colorTokens.surface};
  --text-main: ${designData.colorTokens.textMain};
  --text-muted: ${designData.colorTokens.textMuted};
  --base-unit: ${designData.spatialTokens.baseUnit}px;
  /* Interaction tokens */
  --hover-color-shift: ${designData.interactionTokens?.hover?.colorShift || 'lighten'};
  --hover-background-shift: ${designData.interactionTokens?.hover?.backgroundColorShift || 'darken'};
  --hover-transform: ${designData.interactionTokens?.hover?.transformEffect || 'scale(1.05)'};
  --hover-shadow: ${designData.interactionTokens?.hover?.shadowEffect || '0 4px 8px rgba(0,0,0,0.1)'};
}`;
    await fs.writeFile(path.join(outputDir, 'theme.css'), themeCss);

    // Components
    for (const [name, code] of Object.entries(reactComponents)) {
      await fs.writeFile(path.join(outputDir, 'components', `${name}.jsx`), code);
    }

    console.log(`Successfully captured design package at: ${outputDir}`);

    return designData;
  } catch (error) {
    console.error('Design extraction failed:', error);
    throw error;
  }
}

module.exports = { extractDesign };