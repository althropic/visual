const { chromium } = require('playwright');

/**
 * Scrapes a URL and extracts computed styles from all visible elements.
 * @param {string} url - The URL to scrape.
 * @returns {Promise<Array>} - A promise that resolves to an array of element style data.
 */
async function scrape(url) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    // Navigate to URL and wait for network to be idle to ensure dynamic content is loaded
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

    // Extract computed styles from all elements
    const data = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.map(el => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();

        // Only include visible elements with dimensions
        if (rect.width === 0 || rect.height === 0 || style.visibility === 'hidden' || style.display === 'none') {
          return null;
        }

        return {
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          rect: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          styles: {
            color: style.color,
            backgroundColor: style.backgroundColor,
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            lineHeight: style.lineHeight,
            marginTop: style.marginTop,
            marginRight: style.marginRight,
            marginBottom: style.marginBottom,
            marginLeft: style.marginLeft,
            paddingTop: style.paddingTop,
            paddingRight: style.paddingRight,
            paddingBottom: style.paddingBottom,
            paddingLeft: style.paddingLeft,
            display: style.display,
            position: style.position,
            gap: style.gap,
            borderRadius: style.borderRadius,
            boxShadow: style.boxShadow,
            border: style.border,
            transition: style.transition
          }
        };
      }).filter(Boolean);
    });

    return data;
  } finally {
    await browser.close();
  }
}

module.exports = { scrape };