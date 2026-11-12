/**
 * Levelled logger for bioses-incite.
 *
 * Level hierarchy (ascending severity):
 *   DEBUG  – per-keystroke / per-element noise, disabled in production
 *   INFO   – lifecycle events: pipeline stages, config summary
 *   WARN   – recoverable anomalies: hover failure, fallback triggered
 *   ERROR  – unrecoverable failures that abort a code path
 *
 * The level is set once at startup from config.logLevel (or LOG_LEVEL env var).
 * All other modules call `logger.debug/info/warn/error` — never console.*.
 */

'use strict';

const LEVELS = Object.freeze({ debug: 0, info: 1, warn: 2, error: 3 });

let currentLevel = LEVELS.info;

/**
 * Sets the active log level. Messages below this level are suppressed.
 * @param {string} levelName - 'debug' | 'info' | 'warn' | 'error'
 */
function setLevel(levelName) {
  const resolved = LEVELS[levelName.toLowerCase()];
  if (resolved === undefined) {
    console.warn(`[logger] Unknown level "${levelName}", keeping "${getLevel()}"`);
    return;
  }
  currentLevel = resolved;
}

/**
 * Returns the current level name.
 * @returns {string}
 */
function getLevel() {
  return Object.keys(LEVELS).find(k => LEVELS[k] === currentLevel) || 'info';
}

/**
 * @param {string} levelName
 * @param {string} message
 * @param {...unknown} args
 */
function log(levelName, message, ...args) {
  if (LEVELS[levelName] < currentLevel) return;

  const ts = new Date().toISOString();
  const tag = levelName.toUpperCase().padEnd(5);
  const formatted = `[${ts}] ${tag} ${message}`;

  if (levelName === 'error') {
    // eslint-disable-next-line no-console
    console.error(formatted, ...args);
  } else if (levelName === 'warn') {
    // eslint-disable-next-line no-console
    console.warn(formatted, ...args);
  } else {
    // eslint-disable-next-line no-console
    console.log(formatted, ...args);
  }
}

const logger = Object.freeze({
  setLevel,
  getLevel,
  /** @param {string} message @param {...unknown} args */
  debug: (message, ...args) => log('debug', message, ...args),
  /** @param {string} message @param {...unknown} args */
  info: (message, ...args) => log('info', message, ...args),
  /** @param {string} message @param {...unknown} args */
  warn: (message, ...args) => log('warn', message, ...args),
  /** @param {string} message @param {...unknown} args */
  error: (message, ...args) => log('error', message, ...args),
});

module.exports = { logger };
