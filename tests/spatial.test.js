'use strict';

const { analyzeSpatial } = require('../src/analyzer/spatial');

const mockStyleData = [
  { styles: { marginTop: '8px', paddingLeft: '16px', gap: '24px' }, rect: { x: 0, y: 0, width: 500, height: 100 } },
  { styles: { marginBottom: '32px', paddingRight: '8px' }, rect: { x: 0, y: 100, width: 500, height: 100 } },
  { styles: { marginTop: '0px', padding: '16px' }, rect: { x: 0, y: 200, width: 500, height: 100 } },
  { styles: { marginLeft: '40px', gap: '8px' }, rect: { x: 40, y: 300, width: 460, height: 100 } },
  { styles: { marginTop: '7px' }, rect: { x: 0, y: 400, width: 500, height: 100 } },
];

describe('analyzeSpatial', () => {
  let results;
  beforeAll(() => { results = analyzeSpatial(mockStyleData); });

  test('detects 8px base unit', () => {
    expect(results.baseUnit).toBe(8);
  });

  test('identifies 8px and 16px as common spacings', () => {
    expect(results.commonSpacings).toContain(8);
    expect(results.commonSpacings).toContain(16);
  });

  test('grid consistency score is above 0.8', () => {
    expect(results.gridConsistency).toBeGreaterThanOrEqual(0.8);
  });

  test('returns layout object with gutters array', () => {
    expect(results.layout).toHaveProperty('gutters');
    expect(Array.isArray(results.layout.gutters)).toBe(true);
  });
});
