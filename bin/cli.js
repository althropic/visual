#!/usr/bin/env node

const { extractDesign } = require('../src/index');
const path = require('path');

/**
 * CLI entry point for bioses-incite design extraction tool.
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  const url = args[0];
  const outputDir = args[1] || 'dist';
  
  // Display help if no URL provided
  if (!url || url === '--help' || url === '-h') {
    displayHelp();
    process.exit(0);
  }
  
  // Validate URL
  if (!isValidUrl(url)) {
    console.error('Error: Invalid URL provided');
    console.error('Please provide a valid HTTP or HTTPS URL');
    process.exit(1);
  }
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         BIOSES-INCITE: Design Extraction Tool             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Target URL: ${url}`);
  console.log(`Output Directory: ${path.resolve(outputDir)}`);
  console.log('');
  
  try {
    // Run extraction
    const startTime = Date.now();
    await extractDesign(url, outputDir);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                    EXTRACTION COMPLETE                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`✓ Design system extracted in ${duration}s`);
    console.log(`✓ Output saved to: ${path.resolve(outputDir)}`);
    console.log('');
    console.log('Next steps:');
    console.log(`  1. cd ${outputDir}`);
    console.log('  2. npm install');
    console.log('  3. Review DESIGN.md for design system documentation');
    console.log('  4. Import components from ./components');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('╔════════════════════════════════════════════════════════════╗');
    console.error('║                    EXTRACTION FAILED                       ║');
    console.error('╚════════════════════════════════════════════════════════════╝');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('  - Ensure the URL is accessible');
    console.error('  - Check your internet connection');
    console.error('  - Verify OPENAI_API_KEY is set in .env');
    console.error('  - Try a different URL');
    console.error('');
    
    process.exit(1);
  }
}

/**
 * Displays CLI help information.
 */
function displayHelp() {
  console.log('');
  console.log('BIOSES-INCITE: Design Extraction Tool');
  console.log('');
  console.log('Usage:');
  console.log('  bioses-incite <url> [output-dir]');
  console.log('');
  console.log('Arguments:');
  console.log('  url          Target website URL to extract design from');
  console.log('  output-dir   Output directory (default: dist)');
  console.log('');
  console.log('Examples:');
  console.log('  bioses-incite https://example.com');
  console.log('  bioses-incite https://example.com my-design-system');
  console.log('');
  console.log('Environment Variables:');
  console.log('  OPENAI_API_KEY       OpenAI API key (required)');
  console.log('  OPENAI_MODEL         Model to use (default: gpt-4o)');
  console.log('  OPENAI_BASE_URL      Custom API base URL (optional)');
  console.log('');
  console.log('Output:');
  console.log('  The tool generates a complete design system package including:');
  console.log('    - React components with Tailwind CSS');
  console.log('    - Design tokens (colors, spacing, typography)');
  console.log('    - Tailwind configuration');
  console.log('    - Extracted assets (logos, favicons)');
  console.log('    - Documentation (DESIGN.md, README.md)');
  console.log('');
}

/**
 * Validates if a string is a valid URL.
 * @param {string} string - The string to validate.
 * @returns {boolean} - True if valid URL.
 */
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Run CLI
main();
