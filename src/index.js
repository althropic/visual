const { scrape } = require('./scraper');
const { analyzeColors } = require('./analyzer/colors');
const { analyzeSpatial } = require('./analyzer/spatial');
const { mapSemanticRoles } = require('./llm/client');
const { generateDesignDoc } = require('./generator/design-md');
const fs = require('fs').promises;

/**
 * Main orchestration function to extract design system from a URL.
 * @param {string} url - The target URL.
 * @param {string} outputPath - The path to save the DESIGN.md file.
 */
async function extractDesign(url, outputPath = 'DESIGN.md') {
  console.log(`Starting design extraction for: ${url}`);

  try {
    // 1. Scrape style data
    console.log('Scraping style data...');
    const styleData = await scrape(url);

    // 2. Run heuristic analysis
    console.log('Analyzing colors and spatial patterns...');
    const colors = analyzeColors(styleData);
    const spatial = analyzeSpatial(styleData);

    // 3. LLM Semantic Mapping
    console.log('Mapping semantic roles via LLM...');
    const semanticTokens = await mapSemanticRoles({ colors, spatial });

    // 4. Generate documentation
    console.log('Generating DESIGN.md...');
    const designDoc = generateDesignDoc(semanticTokens);

    // 5. Save output
    await fs.writeFile(outputPath, designDoc);
    console.log(`Successfully generated design manifesto at: ${outputPath}`);

    return semanticTokens;
  } catch (error) {
    console.error('Design extraction failed:', error);
    throw error;
  }
}

module.exports = { extractDesign };