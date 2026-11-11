'use strict';

jest.mock('../src/config', () => ({
  config: {
    llm: { apiKey: '', model: 'gpt-4o', baseURL: null, temperature: 0.3 },
    scraper: {}, analyzer: {},
    output: { defaultOutputDir: 'dist' },
    logLevel: 'error',
  },
}));

jest.mock('../src/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn(), setLevel: jest.fn(), getLevel: jest.fn(() => 'error') },
}));

const { mapSemanticRoles } = require('../src/llm/client');

const mockData = {
  colors:     { primary: '#333333', accent: '#007bff', palette: ['#333333', '#ffffff', '#007bff'] },
  spatial:    { baseUnit: 8, commonSpacings: [8, 16, 24], gridConsistency: 0.9 },
  typography: { bodySize: 16, scaleRatio: 1.25, scaleName: 'Major Third', primaryFont: 'sans-serif' },
  hoverStates: {},
};

describe('mapSemanticRoles — fallback path (no API key)', () => {
  let result;
  beforeAll(async () => { result = await mapSemanticRoles(mockData); });

  test('returns colorTokens with primaryAction', () => {
    expect(result).toHaveProperty('colorTokens');
    expect(result.colorTokens).toHaveProperty('primaryAction');
  });

  test('returns spatialTokens with baseUnit', () => {
    expect(result).toHaveProperty('spatialTokens');
    expect(result.spatialTokens.baseUnit).toBe(8);
  });

  test('returns typographyTokens', () => {
    expect(result).toHaveProperty('typographyTokens');
    expect(result.typographyTokens).toHaveProperty('scaleType');
  });

  test('returns interactionTokens with hover', () => {
    expect(result).toHaveProperty('interactionTokens');
    expect(result.interactionTokens).toHaveProperty('hover');
  });
});
