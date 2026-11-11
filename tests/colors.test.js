'use strict';

const { analyzeColors } = require('../src/analyzer/colors');

const mockStyleData = [
  { styles: { color: '#333333', backgroundColor: '#ffffff' }, rect: { x: 0, y: 0, width: 100, height: 20 } },
  { styles: { color: '#333333', backgroundColor: '#ffffff' }, rect: { x: 0, y: 20, width: 100, height: 20 } },
  { styles: { color: '#007bff', backgroundColor: 'transparent' }, rect: { x: 0, y: 40, width: 80, height: 20 } },
  { styles: { color: '#343a40', backgroundColor: '#f8f9fa' }, rect: { x: 0, y: 60, width: 100, height: 20 } },
  { styles: { color: 'rgb(51, 51, 51)', backgroundColor: 'rgba(255, 255, 255, 1)' }, rect: { x: 0, y: 80, width: 100, height: 20 } },
];

describe('analyzeColors', () => {
  let results;
  beforeAll(() => { results = analyzeColors(mockStyleData); });

  test('detects a primary color', () => {
    expect(results.primary).toBeTruthy();
    expect(['#ffffff', '#333333']).toContain(results.primary);
  });

  test('detects accent color as #007bff', () => {
    expect(results.accent).toBe('#007bff');
  });

  test('generates a non-empty palette', () => {
    expect(results.palette.length).toBeGreaterThan(0);
  });

  test('palette contains at most topPaletteSize entries', () => {
    expect(results.palette.length).toBeLessThanOrEqual(10);
  });

  test('generates primaryScale with all 11 standard keys', () => {
    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].forEach(k =>
      expect(results.primaryScale).toHaveProperty(String(k))
    );
  });

  test('semantic palette has required roles', () => {
    ['action', 'surface', 'text', 'success', 'warning', 'error', 'info'].forEach(role =>
      expect(results.semantic).toHaveProperty(role)
    );
  });
});
