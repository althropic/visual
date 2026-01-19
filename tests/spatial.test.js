const { analyzeSpatial } = require('../src/analyzer/spatial');

function runTests() {
  console.log('Running spatial analysis tests...');

  const mockStyleData = [
    { styles: { marginTop: '8px', paddingLeft: '16px', gap: '24px' } },
    { styles: { marginBottom: '32px', paddingRight: '8px' } },
    { styles: { marginTop: '0px', padding: '16px' } },
    { styles: { marginLeft: '40px', gap: '8px' } },
    { styles: { marginTop: '7px' } } // 7px is an outlier for 8pt grid
  ];

  const results = analyzeSpatial(mockStyleData);

  // Assertion 1: Check base unit detection (8pt grid)
  if (results.baseUnit !== 8) {
    throw new Error(`Incorrect base unit: ${results.baseUnit}`);
  }
  console.log('✓ Detected 8px base unit correctly');

  // Assertion 2: Check common spacings
  if (!results.commonSpacings.includes(8) || !results.commonSpacings.includes(16)) {
    throw new Error(`Common spacings missing: ${results.commonSpacings}`);
  }
  console.log('✓ Identified common spacing values correctly');

  // Assertion 3: Check grid consistency score
  // Total spacing values: 3 (item 0) + 2 (item 1) + 1 (item 2, ignoring 0px) + 2 (item 3) + 1 (item 4) = 9
  // Multiples of 8: 8, 16, 24, 32, 8, 16, 40, 8 (8 out of 9)
  if (results.gridConsistency < 0.8) {
    throw new Error(`Grid consistency too low: ${results.gridConsistency}`);
  }
  console.log(`✓ Grid consistency score: ${results.gridConsistency.toFixed(2)}`);

  console.log('\nAll spatial analysis tests passed!');
}

runTests();