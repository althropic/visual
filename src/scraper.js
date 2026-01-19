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

    // Extract computed styles from all elements including state changes
    const data = await page.evaluate(async () => {
      const elements = Array.from(document.querySelectorAll('*'));
      const results = [];

      for (const el of elements) {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();

        // Only include visible elements with dimensions
        if (rect.width === 0 || rect.height === 0 || style.visibility === 'hidden' || style.display === 'none') {
          continue;
        }

        const baseStyles = {
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
        };

        let hoverStyles = null;
        const interactiveTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
        const isInteractive = interactiveTags.includes(el.tagName) || 
                             style.cursor === 'pointer' || 
                             el.onclick != null;

        if (isInteractive) {
          // Trigger hover state simulation in DOM if possible
          // Note: In evaluate context, we can only see styles. Actual hovering is done via Playwright page.hover()
          // But we can check for CSS hover rules if we had a way. 
          // For now, we rely on the main process to handle the actual hover interaction for specific archetypes.
        }

        results.push({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          rect: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          styles: baseStyles,
          isInteractive
        });
      }
      return results;
    });

    // Handle actual hover capture for detected interactive elements
    const interactiveElements = data.filter(item => item.isInteractive).slice(0, 10); // Limit to top 10 for performance
    for (const item of interactiveElements) {
      try {
        const selector = item.id ? `#${CSS.escape(item.id)}` : 
                        item.className ? `.${CSS.escape(item.className.split(' ')[0])}` : 
                        item.tagName.toLowerCase();
        
        await page.hover(selector);
        await page.waitForTimeout(200); // Wait for potential transitions

        const hStyles = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          const s = window.getComputedStyle(el);
          return {
            color: s.color,
            backgroundColor: s.backgroundColor,
            boxShadow: s.boxShadow,
            transform: s.transform
          };
        }, selector);

        if (hStyles) {
          item.hoverStyles = hStyles;
        }
      } catch (e) {
        // Skip elements that can't be hovered or found
      }
    }

    // Filter out elements with redundant or default styles to reduce data volume
    const sanitizedData = data.filter(item => {
      // Basic heuristic: if it has no background, no color change, and no border, it might be a layout wrapper
      // But we keep it if it has children with styles. For now, we keep everything that passed the visibility check.
      return item !== null;
    }).map(item => {
      // Sanitize style values (e.g., convert "rgba(0, 0, 0, 0)" to "transparent" if needed)
      const sanitizedStyles = { ...item.styles };
      for (const [key, value] of Object.entries(sanitizedStyles)) {
        if (value === 'rgba(0, 0, 0, 0)') sanitizedStyles[key] = 'transparent';
      }
      return { ...item, styles: sanitizedStyles };
    });

    return sanitizedData;
  } finally {
    await browser.close();
  }
}

module.exports = { scrape };