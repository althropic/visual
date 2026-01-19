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
const { generateComponentIndex, generateComponentReadme } = require('./generator/component-index');
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
    await createDistStructure(outputDir);

    // 5. Generate and save implementation files
    console.log('Saving implementation files...');
    await saveDesignPackage(outputDir, {
      designData,
      colors,
      reactComponents,
      archetypes,
      assets: { topLeftImage, logos, favicons: downloadedFavicons }
    });

    console.log(`Successfully captured design package at: ${outputDir}`);

    return designData;
  } catch (error) {
    console.error('Design extraction failed:', error);
    throw error;
  }
}

/**
 * Creates the complete dist/ folder structure for the design package.
 * @param {string} outputDir - The output directory path.
 */
async function createDistStructure(outputDir) {
  // Create main directories
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(path.join(outputDir, 'components'), { recursive: true });
  await fs.mkdir(path.join(outputDir, 'assets'), { recursive: true });
  await fs.mkdir(path.join(outputDir, 'assets', 'logos'), { recursive: true });
  await fs.mkdir(path.join(outputDir, 'assets', 'favicons'), { recursive: true });
  await fs.mkdir(path.join(outputDir, 'styles'), { recursive: true });
  
  console.log('Created dist/ folder structure:');
  console.log('  - components/     (React components)');
  console.log('  - assets/         (Logos, favicons, images)');
  console.log('  - styles/         (CSS and theme files)');
}

/**
 * Saves the complete design package to the output directory.
 * @param {string} outputDir - The output directory path.
 * @param {Object} packageData - All data needed for the design package.
 */
async function saveDesignPackage(outputDir, packageData) {
  const { designData, colors, reactComponents, archetypes, assets } = packageData;
  
  // 1. Save documentation
  const designDoc = generateDesignDoc(designData);
  await fs.writeFile(path.join(outputDir, 'DESIGN.md'), designDoc);
  
  // 2. Save Tailwind configuration
  const twConfig = generateTailwindConfig(designData, colors);
  await fs.writeFile(path.join(outputDir, 'tailwind.config.js'), twConfig);
  
  // 3. Save theme CSS
  const themeCss = generateThemeCSS(designData);
  await fs.writeFile(path.join(outputDir, 'styles', 'theme.css'), themeCss);
  
  // 4. Save React components
  for (const [name, code] of Object.entries(reactComponents)) {
    await fs.writeFile(path.join(outputDir, 'components', `${name}.jsx`), code);
  }
  
  // 5. Save component library index and README
  const componentIndex = generateComponentIndex(reactComponents);
  await fs.writeFile(path.join(outputDir, 'components', 'index.js'), componentIndex);
  
  const componentReadme = generateComponentReadme(reactComponents, archetypes);
  await fs.writeFile(path.join(outputDir, 'components', 'README.md'), componentReadme);
  
  // 6. Save package.json for the design system
  const packageJson = generatePackageJson();
  await fs.writeFile(path.join(outputDir, 'package.json'), packageJson);
  
  // 7. Save main README
  const mainReadme = generateMainReadme(designData, reactComponents, assets);
  await fs.writeFile(path.join(outputDir, 'README.md'), mainReadme);
  
  console.log('Saved all design package files successfully!');
}

/**
 * Generates theme CSS content.
 * @param {Object} designData - Design tokens.
 * @returns {string} - CSS content.
 */
function generateThemeCSS(designData) {
  return `:root {
  /* Color tokens */
  --primary: ${designData.colorTokens?.primaryAction || '#3b82f6'};
  --secondary: ${designData.colorTokens?.secondaryAction || '#8b5cf6'};
  --surface: ${designData.colorTokens?.surface || '#ffffff'};
  --text-main: ${designData.colorTokens?.textMain || '#000000'};
  --text-muted: ${designData.colorTokens?.textMuted || '#6b7280'};
  
  /* Spacing tokens */
  --base-unit: ${designData.spatialTokens?.baseUnit || 8}px;
  --container-padding: ${designData.spatialTokens?.containerPadding || 16}px;
  --max-width: ${designData.spatialTokens?.maxWidth || 1280}px;
  
  /* Interaction tokens */
  --hover-color-shift: ${designData.interactionTokens?.hover?.colorShift || 'lighten'};
  --hover-background-shift: ${designData.interactionTokens?.hover?.backgroundColorShift || 'darken'};
  --hover-transform: ${designData.interactionTokens?.hover?.transformEffect || 'scale(1.05)'};
  --hover-shadow: ${designData.interactionTokens?.hover?.shadowEffect || '0 4px 8px rgba(0,0,0,0.1)'};
}

/* Base styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  color: var(--text-main);
  background-color: var(--surface);
}
`;
}

/**
 * Generates package.json for the design system.
 * @returns {string} - package.json content.
 */
function generatePackageJson() {
  const pkg = {
    name: "extracted-design-system",
    version: "1.0.0",
    description: "Design system extracted and generated automatically",
    main: "components/index.js",
    scripts: {
      build: "echo 'Build your components here'",
      dev: "echo 'Start your dev server here'"
    },
    peerDependencies: {
      react: "^18.0.0",
      "react-dom": "^18.0.0"
    },
    devDependencies: {
      tailwindcss: "^3.0.0",
      autoprefixer: "^10.0.0",
      postcss: "^8.0.0"
    }
  };
  
  return JSON.stringify(pkg, null, 2);
}

/**
 * Generates main README for the design package.
 * @param {Object} designData - Design tokens.
 * @param {Object} reactComponents - Generated components.
 * @param {Object} assets - Extracted assets.
 * @returns {string} - README content.
 */
function generateMainReadme(designData, reactComponents, assets) {
  const componentCount = Object.keys(reactComponents).length;
  
  return `# Extracted Design System

This design system was automatically extracted and generated from a website.

## Contents

- **Components:** ${componentCount} React components
- **Design Tokens:** Colors, spacing, typography, and interaction patterns
- **Assets:** Logos, favicons, and brand assets
- **Configuration:** Tailwind CSS configuration

## Quick Start

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Import components:
\`\`\`javascript
import { Button, Card } from './components';
\`\`\`

3. Use Tailwind configuration:
\`\`\`javascript
// tailwind.config.js
module.exports = require('./tailwind.config.js');
\`\`\`

## Structure

\`\`\`
dist/
├── components/       # React components
├── assets/          # Logos, favicons, images
├── styles/          # CSS and theme files
├── tailwind.config.js
├── DESIGN.md        # Design system documentation
└── README.md        # This file
\`\`\`

## Design Tokens

### Colors
- Primary: ${designData.colorTokens?.primaryAction || '#3b82f6'}
- Secondary: ${designData.colorTokens?.secondaryAction || '#8b5cf6'}
- Surface: ${designData.colorTokens?.surface || '#ffffff'}

### Spacing
- Base Unit: ${designData.spatialTokens?.baseUnit || 8}px
- Container Padding: ${designData.spatialTokens?.containerPadding || 16}px
- Max Width: ${designData.spatialTokens?.maxWidth || 1280}px

## Components

See \`components/README.md\` for detailed component documentation.

## Customization

All components accept a \`className\` prop for additional styling. Design tokens can be customized in \`tailwind.config.js\` and \`styles/theme.css\`.

## License

Generated design system - check original source for licensing information.
`;
}

module.exports = { extractDesign };