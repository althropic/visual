const { scrape } = require('../src/scraper');
const fs = require('fs').promises;
const path = require('path');
const http = require('http');

async function runTests() {
  console.log('Running scraper tests...');

  // Create a simple test server to serve local HTML
  const testHtml = `
    <html>
      <head>
        <style>
          body { color: #333; background-color: #fff; margin: 0; padding: 20px; font-family: sans-serif; }
          .container { display: flex; gap: 16px; margin-bottom: 32px; }
          .item { width: 100px; height: 100px; background-color: #f0f0f0; border-radius: 8px; }
          .hidden { display: none; }
          .invisible { visibility: hidden; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="item">Item 1</div>
          <div class="item">Item 2</div>
        </div>
        <div class="hidden">Hidden</div>
        <div class="invisible">Invisible</div>
      </body>
    </html>
  `;

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(testHtml);
  });

  server.listen(3001);
  console.log('Test server listening on http://localhost:3001');

  try {
    const data = await scrape('http://localhost:3001');

    // Assertion 1: Check if visible elements are extracted
    const items = data.filter(el => el.className === 'item');
    if (items.length !== 2) throw new Error(`Expected 2 items, found ${items.length}`);
    console.log('✓ Extracted visible elements correctly');

    // Assertion 2: Check if hidden elements are excluded
    const hidden = data.find(el => el.className === 'hidden' || el.className === 'invisible');
    if (hidden) throw new Error('Found hidden elements in extracted data');
    console.log('✓ Excluded hidden elements correctly');

    // Assertion 3: Check style extraction
    const body = data.find(el => el.tagName === 'BODY');
    if (!body || body.styles.color !== 'rgb(51, 51, 51)') {
      throw new Error(`Incorrect body color: ${body?.styles.color}`);
    }
    console.log('✓ Extracted computed styles accurately');

    console.log('\nAll scraper tests passed!');
  } catch (error) {
    console.error('\nScraper tests failed:', error.message);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTests();