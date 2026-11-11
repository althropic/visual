'use strict';

const fs   = require('fs').promises;
const path = require('path');
const { generateDesignDoc }      = require('../src/generator/design-md');
const { generateTailwindConfig } = require('../src/generator/tailwind-config');
const { generateComponentIndex } = require('../src/generator/component-index');

const MOCK_TOKENS = {
  colorTokens:    { primaryAction: '#007bff', secondaryAction: '#6c757d', surface: '#ffffff', textMain: '#212529', textMuted: '#6c757d' },
  spatialTokens:  { baseUnit: 8, containerPadding: 16, stackGap: 8 },
  typographyTokens: { scaleType: 'Major Third', baseSize: '16px', primaryFont: 'sans-serif' },
  interactionTokens: { hover: { colorShift: 'lighten', backgroundColorShift: 'darken', transformEffect: 'scale(1.02)', shadowEffect: '0 4px 8px rgba(0,0,0,0.1)' } },
};

describe('generateDesignDoc', () => {
  test('contains all color roles', () => {
    const doc = generateDesignDoc(MOCK_TOKENS);
    expect(doc).toContain('Design System Manifesto');
    expect(doc).toContain('#007bff');
    expect(doc).toContain('8px');
    expect(doc).toContain('Major Third');
  });

  test('includes interaction section when present', () => {
    expect(generateDesignDoc(MOCK_TOKENS)).toContain('Interaction System');
  });

  test('omits interaction section when absent', () => {
    const { interactionTokens: _, ...without } = MOCK_TOKENS;
    expect(generateDesignDoc(without)).not.toContain('Interaction System');
  });
});

describe('generateTailwindConfig', () => {
  test('produces valid JS with brand colors', () => {
    const cfg = generateTailwindConfig(MOCK_TOKENS);
    expect(cfg).toContain('module.exports');
    expect(cfg).toContain('#007bff');
  });
});

describe('generateComponentIndex', () => {
  test('returns empty export for no components', () => {
    expect(generateComponentIndex({})).toContain('export {}');
  });

  test('exports named components', () => {
    const idx = generateComponentIndex({ Button: 'code', Card: 'code' });
    expect(idx).toContain("export { default as Button }");
    expect(idx).toContain("export { default as Card }");
  });
});

describe('file I/O roundtrip', () => {
  const TMP = path.join(__dirname, '__tmp_integration__');
  beforeAll(async () => fs.mkdir(TMP, { recursive: true }));
  afterAll(async () => fs.rm(TMP, { recursive: true, force: true }));

  test('writes and reads DESIGN.md', async () => {
    const filePath = path.join(TMP, 'DESIGN.md');
    await fs.writeFile(filePath, generateDesignDoc(MOCK_TOKENS));
    const content = await fs.readFile(filePath, 'utf8');
    expect(content).toContain('Design System Manifesto');
    expect(content).toContain('#007bff');
  });
});
