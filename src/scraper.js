const { chromium } = require('playwright');

/**
 * Scrapes a URL and extracts computed styles from all visible elements and asset information.
 * @param {string} url - The URL to scrape.
 * @returns {Promise<Object>} - A promise that resolves to an object containing style data, asset information, and page object.
 */
async function scrape(url) {
  const browser = await chromium.launch({ headless: true });
  let page;
  try {
    page = await browser.newPage();
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

    // Handle actual hover capture for detected interactive elements
    const interactiveElements = data.filter(item => item.isInteractive).slice(0, 15); // Increase limit to 15 for better coverage
    for (const item of interactiveElements) {
      // Define selector outside try block so it's available in catch
      // Simple CSS escape for IDs and classes
      const escapeCSS = (str) => str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&');
      const selector = item.id ? `#${escapeCSS(item.id)}` : 
                      item.className ? `.${escapeCSS(item.className.split(' ')[0])}` : 
                      item.tagName.toLowerCase();
      
      try {
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
        
        // Wait longer for transitions to complete (increased from 200ms to 500ms)
        await page.waitForTimeout(500);

        const hStyles = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          const s = window.getComputedStyle(el);
          
          // Capture comprehensive hover state styles
          return {
            // Text styles
            color: s.color,
            backgroundColor: s.backgroundColor,
            fontFamily: s.fontFamily,
            fontSize: s.fontSize,
            fontWeight: s.fontWeight,
            textDecoration: s.textDecoration,
            textShadow: s.textShadow,
            
            // Box styles
            boxShadow: s.boxShadow,
            transform: s.transform,
            borderColor: s.borderColor,
            borderWidth: s.borderWidth,
            borderStyle: s.borderStyle,
            borderRadius: s.borderRadius,
            
            // Layout styles
            opacity: s.opacity,
            filter: s.filter,
            backdropFilter: s.backdropFilter,
            
            // Transition styles
            transition: s.transition,
            
            // Positioning
            zIndex: s.zIndex,
            position: s.position
          };
        }, selector);

        if (hStyles) {
          item.hoverStyles = hStyles;
        }
      } catch (e) {
        // Log error for debugging but continue with other elements
        console.warn(`Failed to capture hover styles for element ${selector}:`, e.message);
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

    return {
      styles: sanitizedData,
      assets: assets,
      page: page
    };
  } finally {
    // Don't close the browser here - let the caller handle it
    // await browser.close();
  }
}

module.exports = { scrape };