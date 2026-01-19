const { analyzeColors } = require('../src/analyzer/colors');

function runTests() {
  console.log('Running color analysis tests...');

  const mockStyleData = [
    { styles: { color: '#333333', backgroundColor: '#ffffff' } },
    { styles: { color: '#333333', backgroundColor: '#ffffff' } },
    { styles: { color: '#007bff', backgroundColor: 'transparent' } }, // Primary action
    { styles: { color: '#343a40', backgroundColor: '#f8f9fa' } },
    { styles: { color: 'rgb(51, 51, 51)', backgroundColor: 'rgba(255, 255, 255, 1)' } } // Should match #333333 and #ffffff
  ];

  const results = analyzeColors(mockStyleData);

  // Assertion 1: Check primary color detection (most frequent)
  // #ffffff appears 3 times (2 hex, 1 rgba), #333333 appears 3 times (2 hex, 1 rgb)
  // Actually, both appear 3 times. Let's see what the heuristic picks.
  if (!results.primary || !['#ffffff', '#333333'].includes(results.primary)) {
    throw new Error(`Incorrect primary color: ${results.primary}`);
  }
  console.log(`✓ Detected primary color: ${results.primary}`);

  // Assertion 2: Check accent color detection
  if (results.accent !== '#007bff') {
    throw new Error(`Incorrect accent color: ${results.accent}`);
  }
  console.log('✓ Detected accent color correctly');

  // Assertion 3: Check palette clustering
  if (results.palette.length === 0) {
    throw new Error('Palette is empty');
  }
  console.log(`✓ Generated palette with ${results.palette.length} unique colors`);

  console.log('\nAll color analysis tests passed!');
}

runTests();