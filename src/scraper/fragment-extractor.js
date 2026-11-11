'use strict';

const { config } = require('../config');

/**
 * Extracts HTML fragments from complex or frequently recurring elements.
 * @param {import('playwright').Page} page
 * @returns {Promise<Array>}
 */
async function extractHTMLFragments(page) {
  const {
    fragmentMinChildren: minChildren,
    fragmentMaxChildren: maxChildren,
    fragmentMaxHtmlBytes: maxBytes,
    maxFragments: maxFrags,
  } = config.scraper;

  return page.evaluate(
    ({ minChildren, maxChildren, maxBytes, maxFrags }) => {
      const fragments = [];
      const elementSignatures = new Map();

      Array.from(document.querySelectorAll('*')).forEach(el => {
        const childCount = el.children.length;
        if (childCount < minChildren || childCount > maxChildren) return;

        const rect = el.getBoundingClientRect();
        if (rect.width > window.innerWidth * 0.9 || rect.height > window.innerHeight * 0.9) return;

        const signature = `${el.tagName}-${childCount}-${el.className}`;
        if (!elementSignatures.has(signature)) elementSignatures.set(signature, []);
        elementSignatures.get(signature).push(el);
      });

      elementSignatures.forEach((elements, signature) => {
        if (elements.length < 2) return;
        const sample = elements[0];
        const rect   = sample.getBoundingClientRect();
        const style  = window.getComputedStyle(sample);

        let html = sample.outerHTML;
        if (html.length > maxBytes) html = html.substring(0, maxBytes) + '...';

        fragments.push({
          signature,
          frequency:  elements.length,
          tagName:    sample.tagName,
          className:  sample.className,
          childCount: sample.children.length,
          html,
          position: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          styles: {
            display: style.display, flexDirection: style.flexDirection,
            gap: style.gap, padding: style.padding, margin: style.margin,
            backgroundColor: style.backgroundColor,
            borderRadius: style.borderRadius, boxShadow: style.boxShadow,
          },
        });
      });

      return fragments.sort((a, b) => b.frequency - a.frequency).slice(0, maxFrags);
    },
    { minChildren, maxChildren, maxBytes, maxFrags },
  );
}

module.exports = { extractHTMLFragments };
