'use strict';

const { getClient, makeRawAPICall } = require('../llm/client');
const { config } = require('../config');
const { logger } = require('../logger');
const { buildAtomPrompt, buildMoleculePrompt, buildShellPrompt } = require('./component-prompts');
const {
  generateFallbackAtomComponent,
  generateFallbackMoleculeComponent,
  generateFallbackShellComponent,
} = require('./component-fallbacks');

/**
 * Converts a role string to a PascalCase component name.
 * @param {string} role
 * @param {string} type - 'atom' | 'molecule' | 'shell'
 * @returns {string}
 */
function generateComponentName(role, type) {
  const cleaned = role
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
  return cleaned || `${type.charAt(0).toUpperCase() + type.slice(1)}Component`;
}

/**
 * Sends a prompt to the LLM and returns cleaned JSX code.
 * @param {Array} messages
 * @returns {Promise<string>}
 */
async function callLLM(messages) {
  let code;
  if (config.llm.baseURL) {
    code = await makeRawAPICall(messages, config.llm.model);
  } else {
    const client = getClient();
    const res = await client.chat.completions.create({
      model: config.llm.model, messages, temperature: config.llm.temperature,
    });
    code = res.choices[0].message.content;
  }
  return code.replace(/```(?:jsx|javascript|tsx|typescript)?\s*\n?/g, '').replace(/```\s*$/g, '').trim();
}

const SYSTEM_MSG = 'You are an expert React developer. Generate clean, functional React components using Tailwind CSS. Return ONLY the component code, no explanations or markdown.';

async function generateAtomComponent(atom, designTokens) {
  try {
    return await callLLM([{ role: 'system', content: SYSTEM_MSG }, { role: 'user', content: buildAtomPrompt(atom, designTokens) }]);
  } catch (e) {
    logger.error(`Error generating atom component for ${atom.role}: ${e.message}`);
    return generateFallbackAtomComponent(atom);
  }
}

async function generateMoleculeComponent(molecule, designTokens) {
  try {
    return await callLLM([{ role: 'system', content: SYSTEM_MSG }, { role: 'user', content: buildMoleculePrompt(molecule, designTokens) }]);
  } catch (e) {
    logger.error(`Error generating molecule component for ${molecule.role}: ${e.message}`);
    return generateFallbackMoleculeComponent(molecule);
  }
}

async function generateShellComponent(shell, designTokens) {
  try {
    return await callLLM([{ role: 'system', content: SYSTEM_MSG }, { role: 'user', content: buildShellPrompt(shell, designTokens) }]);
  } catch (e) {
    logger.error(`Error generating shell component for ${shell.role}: ${e.message}`);
    return generateFallbackShellComponent(shell);
  }
}

/**
 * Generates React components for all archetypes.
 * @param {{ atoms: Array, molecules: Array, shells: Array }} archetypes
 * @param {Object} designTokens
 * @returns {Promise<Object>} map of component name → JSX source
 */
async function generateReactComponents(archetypes, designTokens) {
  const components = {};
  for (const atom of archetypes.atoms || []) {
    components[generateComponentName(atom.role, 'atom')] = await generateAtomComponent(atom, designTokens);
  }
  for (const molecule of archetypes.molecules || []) {
    components[generateComponentName(molecule.role, 'molecule')] = await generateMoleculeComponent(molecule, designTokens);
  }
  for (const shell of archetypes.shells || []) {
    components[generateComponentName(shell.role, 'shell')] = await generateShellComponent(shell, designTokens);
  }
  return components;
}

module.exports = { generateReactComponents, generateComponentName };
