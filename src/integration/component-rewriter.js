'use strict';

const { getClient, makeRawAPICall } = require('../llm/client');
const { config } = require('../config');
const { logger } = require('../logger');
const { buildRewritePrompt } = require('./rewrite-prompt');
const { generateReplacementGuide } = require('./replacement-guide');

/**
 * Rewrites a React component to use extracted design tokens via LLM.
 * @param {string} componentCode
 * @param {Object} designTokens
 * @param {string} [namespace='extracted']
 * @returns {Promise<{ rewrittenCode: string, explanation: string }>}
 */
async function rewriteComponent(componentCode, designTokens, namespace = 'extracted') {
  const prompt = buildRewritePrompt(componentCode, designTokens, namespace);
  try {
    const messages = [
      { role: 'system', content: 'You are an expert React developer specializing in design system integration. Rewrite components to use extracted design tokens while maintaining functionality.' },
      { role: 'user', content: prompt },
    ];

    let content;
    if (config.llm.baseURL) {
      content = await makeRawAPICall(messages, config.llm.model);
    } else {
      const client = getClient();
      const res = await client.chat.completions.create({
        model: config.llm.model, messages, temperature: 0.2,
      });
      content = res.choices[0].message.content;
    }

    const codeMatch = content.match(/```(?:jsx|javascript|tsx|typescript)?\s*\n([\s\S]*?)\n```/);
    return {
      rewrittenCode: (codeMatch ? codeMatch[1] : content).trim(),
      explanation: content.replace(/```[\s\S]*?```/g, '').trim(),
    };
  } catch (error) {
    logger.error(`Error rewriting component: ${error.message}`);
    return generateFallbackRewrite(componentCode, namespace);
  }
}

/**
 * Returns the original code unchanged with manual instructions.
 * @param {string} componentCode
 * @param {string} namespace
 * @returns {{ rewrittenCode: string, explanation: string }}
 */
function generateFallbackRewrite(componentCode, namespace) {
  return {
    rewrittenCode: componentCode,
    explanation: `Automatic rewrite failed. Manual steps:
1. Replace color values (e.g., 'bg-blue-500') with '${namespace}-primary-500'
2. Replace spacing (e.g., 'p-4') with 'p-${namespace}-base-unit'
3. Replace fonts with 'font-${namespace}-primary'`,
  };
}

module.exports = { rewriteComponent, generateReplacementGuide };
