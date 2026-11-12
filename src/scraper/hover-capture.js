'use strict';

const { config } = require('../config');
const { logger } = require('../logger');

/**
 * Escapes special CSS characters in a selector fragment.
 * @param {string} str
 * @returns {string}
 */
function escapeCSS(str) {
  return str.replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, '\\$&');
}

/**
 * Builds a best-effort CSS selector for a scraped element.
 * @param {{ id: string, className: string, tagName: string }} item
 * @returns {string}
 */
function buildSelector(item) {
  if (item.id) return `#${escapeCSS(item.id)}`;
  if (item.className && typeof item.className === 'string') {
    return `.${escapeCSS(item.className.split(' ')[0])}`;
  }
  return item.tagName.toLowerCase();
}

/**
 * Attempts to hover over a selector using three fallback strategies.
 * Returns true if hover succeeded, false if all strategies failed.
 * @param {import('playwright').Page} page
 * @param {string} selector
 * @returns {Promise<boolean>}
 */
async function tryHover(page, selector) {
  try {
    await page.hover(selector);
    return true;
  } catch (_) {}
  try {
    await page.hover(selector, { force: true });
    return true;
  } catch (_) {}
  try {
    await page.hover(selector, { position: { x: 5, y: 5 } });
    return true;
  } catch (_) {}
  return false;
}

/**
 * Captures hover-state deltas for the interactive elements in `data`.
 * Mutates each matching item in-place, adding `hoverStyles` and `hoverDelta`.
 * @param {import('playwright').Page} page
 * @param {Array} data - full scraped element array; interactive items are filtered internally
 * @returns {Promise<void>}
 */
async function captureHoverStates(page, data) {
  const interactiveElements = data
    .filter(item => item.isInteractive)
    .slice(0, config.scraper.maxInteractiveHovers);

  for (const item of interactiveElements) {
    const selector = buildSelector(item);

    try {
      const normalStyles = await page.evaluate(sel => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const s = window.getComputedStyle(el);
        return {
          color: s.color, backgroundColor: s.backgroundColor,
          transform: s.transform, boxShadow: s.boxShadow,
          borderColor: s.borderColor, opacity: s.opacity,
          textDecoration: s.textDecoration,
        };
      }, selector);

      const hovered = await tryHover(page, selector);
      if (!hovered) continue;

      await page.waitForTimeout(config.scraper.hoverWaitMs);

      const hoverStyles = await page.evaluate(sel => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const s = window.getComputedStyle(el);
        return {
          color: s.color, backgroundColor: s.backgroundColor,
          fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight,
          textDecoration: s.textDecoration, textShadow: s.textShadow,
          boxShadow: s.boxShadow, transform: s.transform,
          borderColor: s.borderColor, borderWidth: s.borderWidth,
          borderStyle: s.borderStyle, borderRadius: s.borderRadius,
          opacity: s.opacity, filter: s.filter,
          backdropFilter: s.backdropFilter, transition: s.transition,
          zIndex: s.zIndex, position: s.position,
        };
      }, selector);

      if (hoverStyles) {
        item.hoverStyles = hoverStyles;
        if (normalStyles) {
          const delta = {};
          for (const [key, val] of Object.entries(hoverStyles)) {
            if (val !== normalStyles[key]) delta[key] = { from: normalStyles[key], to: val };
          }
          item.hoverDelta = delta;
        }
      }
    } catch (e) {
      logger.warn(`Failed to capture hover styles for element ${selector}: ${e.message}`);
    }
  }
}

module.exports = { captureHoverStates };
