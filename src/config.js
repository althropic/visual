/**
 * Central runtime configuration.
 * All defaults and environment-variable reads live here.
 * Import this module and use the exported `config` object — never read
 * `process.env.*` directly in other modules.
 */

'use strict';

require('dotenv').config();

/**
 * @typedef {Object} LLMConfig
 * @property {string} apiKey
 * @property {string} model
 * @property {string|null} baseURL
 * @property {number} temperature
 */

/**
 * @typedef {Object} ScraperConfig
 * @property {number} networkIdleTimeout   ms to wait for networkidle
 * @property {number} hoverWaitMs          ms after hover before style capture
 * @property {number} maxInteractiveHovers max elements to hover-capture
 * @property {number} maxFragments         max HTML fragments to extract
 * @property {number} fragmentMinChildren  min children for fragment candidacy
 * @property {number} fragmentMaxChildren  max children for fragment candidacy
 * @property {number} fragmentMaxHtmlBytes max HTML length before truncation
 */

/**
 * @typedef {Object} AnalyzerConfig
 * @property {number[]} baseUnitCandidates spacing divisors to score
 * @property {number}   colorSimilarityThreshold chroma distance below which colors cluster
 * @property {number}   topPaletteSize     max colors kept in palette
 * @property {number}   scaleTolerancePct  fraction tolerance for named-scale match
 * @property {number}   archetypeSimilarityThreshold Jaccard threshold for grouping
 * @property {number}   archetypeMinCount  min occurrences to keep an archetype
 */

/**
 * @typedef {Object} OutputConfig
 * @property {string}  defaultOutputDir
 */

/**
 * @typedef {Object} Config
 * @property {LLMConfig}      llm
 * @property {ScraperConfig}  scraper
 * @property {AnalyzerConfig} analyzer
 * @property {OutputConfig}   output
 * @property {string}         logLevel
 */

/** @type {Config} */
const config = Object.freeze({
  llm: Object.freeze({
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    baseURL: process.env.OPENAI_BASE_URL || null,
    temperature: 0.3,
  }),

  scraper: Object.freeze({
    networkIdleTimeout: 60_000,
    hoverWaitMs: 500,
    maxInteractiveHovers: 15,
    maxFragments: 10,
    fragmentMinChildren: 3,
    fragmentMaxChildren: 20,
    fragmentMaxHtmlBytes: 5_000,
  }),

  analyzer: Object.freeze({
    baseUnitCandidates: [8, 4, 10, 5],
    colorSimilarityThreshold: 5,
    topPaletteSize: 10,
    scaleTolerancePct: 0.05,
    archetypeSimilarityThreshold: 0.7,
    archetypeMinCount: 2,
  }),

  output: Object.freeze({
    defaultOutputDir: 'dist',
  }),

  logLevel: process.env.LOG_LEVEL || 'info',
});

module.exports = { config };
