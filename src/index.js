'use strict';

const fs   = require('fs').promises;
const path = require('path');

const { config } = require('./config');
const { logger } = require('./logger');
const { scrape } = require('./scraper');
const { analyzeColors } = require('./analyzer/colors');
const { analyzeSpatial, analyzeLayoutFulcrum } = require('./analyzer/spatial');
const { analyzeArchetypes } = require('./analyzer/archetypes');
const { analyzeHoverStates } = require('./analyzer/hover');
const { analyzeTypography } = require('./analyzer/typography');
const { analyzeAssets, extractLogos, downloadFavicons, downloadLogos } = require('./analyzer/assets');
const { mapSemanticRoles } = require('./llm/client');
const { generateDesignDoc } = require('./generator/design-md');
const { generateTailwindConfig } = require('./generator/tailwind-config');
const { generateReactComponents } = require('./generator/react-components');
const { generateFragmentComponents } = require('./generator/fragment-components');
const { generateComponentIndex, generateComponentReadme } = require('./generator/component-index');
const { generateThemeCSS, generatePackageJson, generateMainReadme } = require('./generator/templates');

logger.setLevel(config.logLevel);
logger.info('Config loaded', {
  model: config.llm.model,
  baseURL: config.llm.baseURL || '(openai)',
  logLevel: config.logLevel,
  defaultOutputDir: config.output.defaultOutputDir,
});

/**
 * Full pipeline: scrape → analyse → LLM → generate → write.
 * @param {string} url
 * @param {string} [outputDir]
 * @returns {Promise<Object>} resolved design tokens
 */
async function extractDesign(url, outputDir = config.output.defaultOutputDir) {
  logger.info(`Starting extraction for: ${url}`);
  let scrapeResult;

  try {
    // Phase 1: Scrape
    logger.info('Phase 1: scraping');
    scrapeResult = await scrape(url);
    const { styles, assets, fragments = [] } = scrapeResult;

    // Phase 2: Heuristic analysis
    logger.info('Phase 2: heuristic analysis');
    const colors       = analyzeColors(styles);
    const spatial      = analyzeSpatial(styles);
    const layoutFulcrum = analyzeLayoutFulcrum(styles);
    const typography   = analyzeTypography(styles);
    const archetypes   = analyzeArchetypes(styles);
    const hoverStates  = analyzeHoverStates(styles);
    logger.debug('Archetypes', { atoms: archetypes.atoms.length, molecules: archetypes.molecules.length, shells: archetypes.shells.length });

    // Phase 3: Asset download
    logger.info('Phase 3: downloading assets');
    const topLeftImage    = analyzeAssets(assets, styles);
    const logos           = extractLogos(assets);
    const downloadedFavicons = await downloadFavicons(assets.favicons || [], outputDir, scrapeResult.page);
    const downloadedLogos    = await downloadLogos(assets.images   || [], outputDir, scrapeResult.page);
    logger.info(`Downloaded ${downloadedFavicons.length} favicons, ${downloadedLogos.length} logos`);

    // Phase 4: LLM semantic mapping
    logger.info('Phase 4: LLM semantic mapping');
    const designData = await mapSemanticRoles({
      colors, spatial, layoutFulcrum, typography, archetypes, hoverStates,
      assets: { topLeftImage, logos, favicons: downloadedFavicons, downloadedLogos },
    });
    logger.debug('Design tokens resolved', designData);

    // Phase 5: Component generation
    logger.info('Phase 5: generating React components');
    const reactComponents    = await generateReactComponents(archetypes, designData);
    const fragmentComponents = await generateFragmentComponents(fragments, designData);
    const allComponents      = { ...reactComponents, ...fragmentComponents };
    logger.info(`Generated ${Object.keys(allComponents).length} components`);

    // Phase 6: Write output
    logger.info(`Phase 6: writing design package to "${outputDir}"`);
    await createDistStructure(outputDir);
    await saveDesignPackage(outputDir, {
      designData, colors, reactComponents, fragmentComponents, archetypes,
      assets: { topLeftImage, logos, favicons: downloadedFavicons },
    });

    logger.info(`Extraction complete: ${outputDir}`);
    return designData;
  } catch (error) {
    logger.error('Extraction failed', error);
    throw error;
  } finally {
    if (scrapeResult?.browser) {
      try { await scrapeResult.browser.close(); } catch (_e) { /* non-fatal */ }
    }
  }
}

/** @param {string} outputDir */
async function createDistStructure(outputDir) {
  for (const dir of [
    outputDir,
    path.join(outputDir, 'components'),
    path.join(outputDir, 'assets', 'logos'),
    path.join(outputDir, 'assets', 'favicons'),
    path.join(outputDir, 'styles'),
  ]) {
    await fs.mkdir(dir, { recursive: true });
  }
  logger.debug('Created dist/ structure');
}

/** @param {string} outputDir @param {Object} pkg */
async function saveDesignPackage(outputDir, pkg) {
  const { designData, colors, reactComponents, fragmentComponents, archetypes, assets } = pkg;
  const allComponents = { ...reactComponents, ...fragmentComponents };

  await fs.writeFile(path.join(outputDir, 'DESIGN.md'),          generateDesignDoc(designData));
  await fs.writeFile(path.join(outputDir, 'tailwind.config.js'), generateTailwindConfig(designData, colors));
  await fs.writeFile(path.join(outputDir, 'styles', 'theme.css'), generateThemeCSS(designData));

  for (const [name, code] of Object.entries(allComponents)) {
    await fs.writeFile(path.join(outputDir, 'components', `${name}.jsx`), code);
  }

  await fs.writeFile(path.join(outputDir, 'components', 'index.js'), generateComponentIndex(allComponents));
  await fs.writeFile(path.join(outputDir, 'components', 'README.md'), generateComponentReadme(allComponents, archetypes));
  await fs.writeFile(path.join(outputDir, 'package.json'), generatePackageJson());
  await fs.writeFile(path.join(outputDir, 'README.md'), generateMainReadme(designData, allComponents, assets));

  logger.info('All design package files saved');
}

module.exports = { extractDesign };
