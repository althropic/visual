'use strict';

const http = require('http');
const { scrape } = require('../src/scraper');

const TEST_HTML = `<html><head><style>
  body { color: #333; background-color: #fff; margin: 0; padding: 20px; font-family: sans-serif; }
  .container { display: flex; gap: 16px; margin-bottom: 32px; }
  .item { width: 100px; height: 100px; background-color: #f0f0f0; border-radius: 8px; }
  .hidden { display: none; }
  .invisible { visibility: hidden; }
</style></head><body>
  <div class="container">
    <div class="item">Item 1</div>
    <div class="item">Item 2</div>
  </div>
  <div class="hidden">Hidden</div>
  <div class="invisible">Invisible</div>
</body></html>`;

describe('scraper', () => {
  let server;
  let scrapeResult;

  beforeAll(async () => {
    server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(TEST_HTML);
    });
    await new Promise(resolve => server.listen(3001, resolve));
    scrapeResult = await scrape('http://localhost:3001');
  }, 60_000);

  afterAll(async () => {
    if (scrapeResult?.browser) {
      try { await scrapeResult.browser.close(); } catch (_) {}
    }
    await new Promise(resolve => server.close(resolve));
  });

  test('returns styles, assets, fragments, page, browser', () => {
    expect(scrapeResult).toHaveProperty('styles');
    expect(scrapeResult).toHaveProperty('assets');
    expect(scrapeResult).toHaveProperty('fragments');
    expect(scrapeResult).toHaveProperty('page');
    expect(scrapeResult).toHaveProperty('browser');
  });

  test('extracts exactly 2 visible .item elements', () => {
    const items = scrapeResult.styles.filter(el => el.className === 'item');
    expect(items.length).toBe(2);
  });

  test('excludes hidden elements', () => {
    const hidden = scrapeResult.styles.find(el => el.className === 'hidden' || el.className === 'invisible');
    expect(hidden).toBeUndefined();
  });

  test('extracts body color as rgb(51, 51, 51)', () => {
    const body = scrapeResult.styles.find(el => el.tagName === 'BODY');
    expect(body).toBeDefined();
    expect(body.styles.color).toBe('rgb(51, 51, 51)');
  });

  test('assets has favicons and images arrays', () => {
    expect(Array.isArray(scrapeResult.assets.favicons)).toBe(true);
    expect(Array.isArray(scrapeResult.assets.images)).toBe(true);
  });
});
