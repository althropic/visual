'use strict';

const { getClient, makeRawAPICall } = require('../llm/client');
const { config } = require('../config');
const { logger } = require('../logger');
const { buildFragmentPrompt } = require('./fragment-prompts');
const { generateFragmentComponentName, generateFallbackFragmentComponent } = require('./fragment-fallbacks');

/**
 * Generates React components from repeated HTML fragments using LLM.
 * Falls back to deterministic generation when the LLM call fails.
 * @param {Array} fragments - HTML fragments with metadata.
 * @param {Object} designTokens - Semantic design tokens.
 * @returns {Promise<Object>} - Map of component names to React source code.
 */
async function generateFragmentComponents(fragments, designTokens) {
  logger.info(`generateFragmentComponents: processing ${fragments.length} fragment(s)`);
  const components = {};

  for (const fragment of fragments) {
    try {
      const componentName = generateFragmentComponentName(fragment);
      const code = await generateComponentFromFragment(fragment, designTokens);
      components[componentName] = code;
      logger.debug(`generateFragmentComponents: generated ${componentName}`);
    } catch (error) {
      logger.error(`generateFragmentComponents: failed for fragment ${fragment.signature} — ${error.message}`);
    }
  }

  logger.info(`generateFragmentComponents: done, ${Object.keys(components).length} component(s) produced`);
  return components;
}

/**
 * Calls the LLM to generate a React component from a single HTML fragment.
 * Uses raw-fetch path when a custom base URL is configured (local LLM support).
 * Falls back to a deterministic component on any LLM error.
 * @param {Object} fragment - Fragment metadata with HTML and styles.
 * @param {Object} designTokens - Semantic design tokens.
 * @returns {Promise<string>} - React component source code.
 */
async function generateComponentFromFragment(fragment, designTokens) {
  const prompt = buildFragmentPrompt(fragment, designTokens);
  const messages = [
    {
      role: 'system',
      content: 'You are an expert React developer. Convert HTML fragments into clean, functional React components using Tailwind CSS. Return ONLY the component code, no explanations or markdown.',
    },
    { role: 'user', content: prompt },
  ];

  try {
    let code;

    if (config.llm.baseURL) {
      logger.debug('generateComponentFromFragment: using raw-fetch path (baseURL set)');
      code = await makeRawAPICall(messages, config.llm.model);
    } else {
      logger.debug('generateComponentFromFragment: using OpenAI SDK');
      const client = getClient();
      const response = await client.chat.completions.create({
        model: config.llm.model,
        messages,
        temperature: config.llm.temperature,
      });
      code = response.choices[0].message.content;
    }

    // Strip markdown fences if the LLM wraps its output
    return code.replace(/```(?:jsx|javascript|tsx|typescript)?\s*\n?/g, '').replace(/```\s*$/g, '').trim();
  } catch (error) {
    logger.warn(`generateComponentFromFragment: LLM failed for fragment ${fragment.signature}, using fallback — ${error.message}`);
    return generateFallbackFragmentComponent(fragment);
  }
}

module.exports = { generateFragmentComponents };
