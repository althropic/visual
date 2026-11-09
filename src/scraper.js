'use strict';

const { chromium } = require('playwright');
const { config } = require('./config');
const { logger } = require('./logger');

/**
 * Scrapes a URL and extracts computed styles from all visible elements and asset information.
 * Returns the browser instance so the caller can close it after downstream work finishes.
 * @param {string} url - The URL to scrape.
 * @returns {Promise<Object>} - { styles, assets, fragments, page, browser }
 */
async function scrape(url) {
  const browser = await chromium.launch({ headless: true });
  let page;
  try {
    page = await browser.newPage();
    logger.info(`Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: config.scraper.networkIdleTimeout });

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
          transition: style.transition,
          zIndex: style.zIndex
        };

        // Enhanced interactive element detection
        const interactiveTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'OPTION', 'LABEL'];
        const isInteractive = interactiveTags.includes(el.tagName) || 
                             style.cursor === 'pointer' || 
                             el.onclick != null ||
                             el.onmouseover != null ||
                             el.hasAttribute('tabindex') ||
                             el.hasAttribute('role') && 
                               (el.getAttribute('role') === 'button' || 
                                el.getAttribute('role') === 'link' || 
                                el.getAttribute('role') === 'checkbox' || 
                                el.getAttribute('role') === 'radio');

        if (isInteractive) {
          // Collect additional attributes that indicate interactivity
          const interactiveAttributes = {};
          if (el.hasAttribute('href')) interactiveAttributes.href = el.getAttribute('href');
          if (el.hasAttribute('type')) interactiveAttributes.type = el.getAttribute('type');
          if (el.hasAttribute('role')) interactiveAttributes.role = el.getAttribute('role');
          if (el.hasAttribute('aria-label')) interactiveAttributes.ariaLabel = el.getAttribute('aria-label');
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

    // Handle actual hover capture for detected interactive elements with delta calculation
    const interactiveElements = data.filter(item => item.isInteractive)
      .slice(0, config.scraper.maxInteractiveHovers);
    for (const item of interactiveElements) {
      // Define selector outside try block so it's available in catch
      // Simple CSS escape for IDs and classes
      const escapeCSS = (str) => str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&');
      const selector = item.id ? `#${escapeCSS(item.id)}` : 
                      (item.className && typeof item.className === 'string') ? `.${escapeCSS(item.className.split(' ')[0])}` : 
                      item.tagName.toLowerCase();
      
      try {
        // Capture normal state first
        const normalStyles = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          const s = window.getComputedStyle(el);
          return {
            color: s.color,
            backgroundColor: s.backgroundColor,
            transform: s.transform,
            boxShadow: s.boxShadow,
            borderColor: s.borderColor,
            opacity: s.opacity,
            textDecoration: s.textDecoration
          };
        }, selector);
        
        // Try multiple strategies to hover over the element
        try {
          await page.hover(selector);
        } catch (hoverError) {
          // If direct hover fails, try with force option
          try {
            await page.hover(selector, { force: true });
          } catch (forceHoverError) {
            // If force hover also fails, try with position option
            try {
              await page.hover(selector, { position: { x: 5, y: 5 } });
            } catch (positionHoverError) {
              // Skip this element if all hover attempts fail
              continue;
            }
          }
        }
        
        // Wait longer for transitions to complete
        await page.waitForTimeout(config.scraper.hoverWaitMs);

        const hoverStyles = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          const s = window.getComputedStyle(el);
          
          // Capture comprehensive hover state styles
          return {
            color: s.color,
            backgroundColor: s.backgroundColor,
            fontFamily: s.fontFamily,
            fontSize: s.fontSize,
            fontWeight: s.fontWeight,
            textDecoration: s.textDecoration,
            textShadow: s.textShadow,
            boxShadow: s.boxShadow,
            transform: s.transform,
            borderColor: s.borderColor,
            borderWidth: s.borderWidth,
            borderStyle: s.borderStyle,
            borderRadius: s.borderRadius,
            opacity: s.opacity,
            filter: s.filter,
            backdropFilter: s.backdropFilter,
            transition: s.transition,
            zIndex: s.zIndex,
            position: s.position
          };
        }, selector);

        if (hoverStyles && normalStyles) {
          // Calculate the delta (what actually changed)
          const delta = {};
          for (const [key, hoverValue] of Object.entries(hoverStyles)) {
            const normalValue = normalStyles[key];
            if (hoverValue !== normalValue) {
              delta[key] = {
                from: normalValue,
                to: hoverValue
              };
            }
          }
          
          // Store both hover styles and the delta
          item.hoverStyles = hoverStyles;
          item.hoverDelta = delta;
        } else if (hoverStyles) {
          // Fallback if we couldn't capture normal state
          item.hoverStyles = hoverStyles;
        }
      } catch (e) {
        // Log error for debugging but continue with other elements
        logger.warn(`Failed to capture hover styles for element ${selector}: ${e.message}`);
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

    // Extract asset information including images and favicons
    const assets = await page.evaluate(() => {
      // Get favicon information
      const faviconLinks = Array.from(document.querySelectorAll('link[rel*="icon"]'));
      const favicons = faviconLinks.map(link => ({
        href: link.href,
        type: link.type || 'image/x-icon',
        sizes: link.sizes ? link.sizes.value : null
      }));

      // Get all images
      const images = Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt || null,
        width: img.width,
        height: img.height,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      }));

      // Get meta information for additional assets
      const metaAssets = {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content || null,
        keywords: document.querySelector('meta[name="keywords"]')?.content || null
      };

      return {
        favicons,
        images,
        meta: metaAssets
      };
    });

    // Extract HTML fragments for complex/frequent elements
    const fragments = await extractHTMLFragments(page);

    return {
      styles: sanitizedData,
      assets: assets,
      fragments: fragments,
      page: page,
      browser: browser,  // exposed so caller can close after downstream work
    };
  } finally {
    // Browser is intentionally NOT closed here — caller closes it after
    // all downstream asset downloads (which need page.request) are done.
  }
}

/**
 * Extracts HTML fragments from complex or frequently occurring elements.
 * @param {import('playwright').Page} page - Playwright page object.
 * @returns {Promise<Array>} - Array of HTML fragments with metadata.
 */
async function extractHTMLFragments(page) {
  const { fragmentMinChildren, fragmentMaxChildren, fragmentMaxHtmlBytes, maxFragments } =
    config.scraper;

  return await page.evaluate(
    ({ minChildren, maxChildren, maxBytes, maxFrags }) => {
    const fragments = [];
    const elementSignatures = new Map();
    
    // Find all elements with moderate to high complexity
    const allElements = Array.from(document.querySelectorAll('*'));
    
    allElements.forEach(el => {
      const childCount = el.children.length;

      // Only consider elements with configured child range (molecules/shells)
      if (childCount < minChildren || childCount > maxChildren) return;
      
      // Skip if element is too large (likely a container)
      const rect = el.getBoundingClientRect();
      if (rect.width > window.innerWidth * 0.9 || rect.height > window.innerHeight * 0.9) return;
      
      // Create a signature based on tag and class structure
      const signature = `${el.tagName}-${childCount}-${el.className}`;
      
      if (!elementSignatures.has(signature)) {
        elementSignatures.set(signature, []);
      }
      
      elementSignatures.get(signature).push(el);
    });
    
    // Extract fragments for patterns that appear 2+ times
    elementSignatures.forEach((elements, signature) => {
      if (elements.length >= 2) {
        const sample = elements[0];
        const rect = sample.getBoundingClientRect();
        
        // Get outerHTML but limit size
        let html = sample.outerHTML;
        if (html.length > maxBytes) {
          html = html.substring(0, maxBytes) + '...';
        }
        
        // Get computed styles for the container
        const style = window.getComputedStyle(sample);
        
        fragments.push({
          signature,
          frequency: elements.length,
          tagName: sample.tagName,
          className: sample.className,
          childCount: sample.children.length,
          html,
          position: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          styles: {
            display: style.display,
            flexDirection: style.flexDirection,
            gap: style.gap,
            padding: style.padding,
            margin: style.margin,
            backgroundColor: style.backgroundColor,
            borderRadius: style.borderRadius,
            boxShadow: style.boxShadow
          }
        });
      }
    });
    
    // Sort by frequency (most common first)
    return fragments.sort((a, b) => b.frequency - a.frequency).slice(0, 10);
  });
}

module.exports = { scrape };