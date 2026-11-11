'use strict';

const { chromium } = require('playwright');
const { config } = require('./config');
const { logger } = require('./logger');
const { captureHoverStates } = require('./scraper/hover-capture');
const { extractHTMLFragments } = require('./scraper/fragment-extractor');

/**
 * Scrapes a URL and extracts computed styles, assets, and HTML fragments.
 * Returns the browser instance so the caller can close it after downstream
 * asset-download work (which needs page.request) finishes.
 *
 * @param {string} url
 * @returns {Promise<{ styles, assets, fragments, page, browser }>}
 */
async function scrape(url) {
  const browser = await chromium.launch({ headless: true });
  let page;
  try {
    page = await browser.newPage();
    logger.info(`Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: config.scraper.networkIdleTimeout });

    // 1. Extract computed styles for all visible elements
    const data = await page.evaluate(() => {
      const results = [];
      for (const el of document.querySelectorAll('*')) {
        const style = window.getComputedStyle(el);
        const rect  = el.getBoundingClientRect();
        if (!rect.width || !rect.height || style.visibility === 'hidden' || style.display === 'none') continue;

        const interactiveTags = new Set(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'OPTION', 'LABEL']);
        const role = el.getAttribute('role');
        const isInteractive =
          interactiveTags.has(el.tagName) ||
          style.cursor === 'pointer' ||
          el.onclick != null || el.onmouseover != null ||
          el.hasAttribute('tabindex') ||
          (role && ['button', 'link', 'checkbox', 'radio'].includes(role));

        results.push({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          styles: {
            color: style.color, backgroundColor: style.backgroundColor,
            fontFamily: style.fontFamily, fontSize: style.fontSize,
            fontWeight: style.fontWeight, lineHeight: style.lineHeight,
            marginTop: style.marginTop, marginRight: style.marginRight,
            marginBottom: style.marginBottom, marginLeft: style.marginLeft,
            paddingTop: style.paddingTop, paddingRight: style.paddingRight,
            paddingBottom: style.paddingBottom, paddingLeft: style.paddingLeft,
            display: style.display, position: style.position,
            gap: style.gap, borderRadius: style.borderRadius,
            boxShadow: style.boxShadow, border: style.border,
            transition: style.transition, zIndex: style.zIndex,
          },
          isInteractive,
        });
      }
      return results;
    });

    // 2. Capture hover-state deltas for interactive elements (mutates `data` in-place)
    await captureHoverStates(page, data);

    // 3. Sanitize: normalise transparent backgrounds
    const styles = data.map(item => {
      const sanitizedStyles = { ...item.styles };
      for (const [k, v] of Object.entries(sanitizedStyles)) {
        if (v === 'rgba(0, 0, 0, 0)') sanitizedStyles[k] = 'transparent';
      }
      return { ...item, styles: sanitizedStyles };
    });

    // 4. Extract asset references (favicons + images)
    const assets = await page.evaluate(() => {
      const favicons = Array.from(document.querySelectorAll('link[rel*="icon"]')).map(link => ({
        href: link.href, type: link.type || 'image/x-icon',
        sizes: link.sizes ? link.sizes.value : null,
      }));
      const images = Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src, alt: img.alt || null,
        width: img.width, height: img.height,
        naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight,
      }));
      return {
        favicons, images,
        meta: {
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.content || null,
          keywords: document.querySelector('meta[name="keywords"]')?.content || null,
        },
      };
    });

    // 5. Extract repeated HTML fragments
    const fragments = await extractHTMLFragments(page);
    logger.info(`Scraped ${styles.length} elements, ${fragments.length} fragments`);

    return { styles, assets, fragments, page, browser };
  } finally {
    // Browser is intentionally NOT closed here — caller closes it after
    // all downstream asset downloads (which need page.request) are done.
  }
}

module.exports = { scrape };
