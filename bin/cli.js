#!/usr/bin/env node
const { extractDesign } = require('../src/index');

async function main() {
  const url = process.argv[2];
  const outputPath = process.argv[3] || 'DESIGN.md';

  if (!url) {
    console.error('Usage: design-extractor-auto <url> [output-path]');
    process.exit(1);
  }

  try {
    await extractDesign(url, outputPath);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();