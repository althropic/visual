'use strict';

const OpenAI = require('openai');
const { config } = require('../config');
const { logger } = require('../logger');

// Initialize lazily to avoid errors during testing/mocking
let openai;
function getClient() {
  if (!openai) {
    if (!config.llm.apiKey) {
      throw new Error('Missing OPENAI_API_KEY environment variable');
    }
    const options = { apiKey: config.llm.apiKey };

    if (config.llm.baseURL) {
      options.baseURL = config.llm.baseURL;
      logger.info(`LLM backend: local provider at ${config.llm.baseURL}`);
    } else {
      logger.info('LLM backend: OpenAI API');
    }

    openai = new OpenAI(options);
  }
  return openai;
}

/**
 * Makes a raw API call to handle streaming responses from local LLMs
 * @param {Array} messages - Chat messages
 * @param {string} model - Model name
 * @returns {Promise<string>} - Response content
 */
async function makeRawAPICall(messages, model) {
  const baseURL = config.llm.baseURL;
  const url = `${baseURL}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.llm.apiKey || 'not-needed'}`,
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: config.llm.temperature,
      stream: false,
    }),
  });
  
  const rawText = await response.text();
  
  // Check if it's a streaming response (multiple JSON objects)
  if (rawText.includes('}\n{')) {
    // Parse NDJSON streaming response
    const lines = rawText.split('\n').filter(l => l.trim());
    let fullContent = '';
    
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.message && parsed.message.content) {
          fullContent += parsed.message.content;
        }
        // Check if this is the final message
        if (parsed.done === true) {
          break;
        }
      } catch (e) {
        // Skip invalid lines
      }
    }
    
    return fullContent;
  } else {
    // Single JSON response
    const parsed = JSON.parse(rawText);
    if (parsed.choices && parsed.choices[0] && parsed.choices[0].message) {
      return parsed.choices[0].message.content;
    }
    throw new Error('Unexpected response format');
  }
}

/**
 * Uses LLM to assign semantic roles to raw style values.
 * @param {Object} data - The collected style and analysis data.
 * @returns {Promise<Object>} - A promise that resolves to semantic design tokens.
 */
async function mapSemanticRoles(data) {
  const prompt = `
    Analyze the following design system data extracted from a website and assign semantic roles to the values.
    Follow the "Groundwork" principles: Hierarchy, Symmetry, and Semantic Logic.
    
    Data:
    Colors: ${JSON.stringify(data.colors)}
    Spatial: ${JSON.stringify(data.spatial)}
    Typography: ${JSON.stringify(data.typography)}
    Hover States: ${JSON.stringify(data.hoverStates || {})}
    
    Return a structured JSON object with the following keys:
    - colorTokens: { primaryAction, secondaryAction, surface, textMain, textMuted }
    - spatialTokens: { baseUnit, containerPadding, stackGap }
    - typographyTokens: { 
        scaleType: "${data.typography?.scaleName || 'Custom'}",
        scaleRatio: ${data.typography?.scaleRatio || 1.25},
        baseSize: "${data.typography?.bodySize || 16}px",
        primaryFont: "${data.typography?.primaryFont || 'system-ui'}"
      }
    - interactionTokens: { 
        hover: {
          colorShift: string,
          backgroundColorShift: string,
          transformEffect: string,
          shadowEffect: string
        }
      }
    
    IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks.
  `;

  const messages = [
    { role: "system", content: "You are a design systems expert. Always respond with valid JSON only." },
    { role: "user", content: prompt }
  ];
  
  try {
    // Use raw API call for local LLMs that might stream
    if (config.llm.baseURL) {
      logger.info(`Calling local LLM: ${config.llm.model}`);
      const content = await makeRawAPICall(messages, config.llm.model);
      
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      const cleanContent = jsonMatch ? jsonMatch[1].trim() : content.trim();
      
      return JSON.parse(cleanContent);
    }
    
    // Use OpenAI SDK for official API
    logger.info(`Calling OpenAI API: ${config.llm.model}`);
    const client = getClient();
    const response = await client.chat.completions.create({
      model: config.llm.model,
      messages: messages,
      response_format: { type: "json_object" }
    });

    let content = response.choices[0].message.content;
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      content = jsonMatch[1];
    }
    
    // Clean up any leading/trailing whitespace
    content = content.trim();
    
    return JSON.parse(content);
  } catch (error) {
    console.error('LLM API Error:', error.message);
    console.error('Using fallback semantic mapping...');
    
    // Fallback: return a basic structure based on the data
    return {
      colorTokens: {
        primaryAction: data.colors.palette?.[0] || '#000000',
        secondaryAction: data.colors.palette?.[1] || '#666666',
        surface: data.colors.palette?.[2] || '#ffffff',
        textMain: data.colors.palette?.[3] || '#000000',
        textMuted: data.colors.palette?.[4] || '#999999'
      },
      spatialTokens: {
        baseUnit: data.spatial.baseUnit || 8,
        containerPadding: data.spatial.commonSpacing?.[0] || 16,
        stackGap: data.spatial.commonSpacing?.[1] || 8
      },
      typographyTokens: {
        scaleType: data.typography?.scaleName || 'Custom',
        scaleRatio: data.typography?.scaleRatio || 1.25,
        baseSize: `${data.typography?.bodySize || 16}px`,
        primaryFont: data.typography?.primaryFont || 'system-ui'
      },
      interactionTokens: {
        hover: {
          colorShift: 'lighten',
          backgroundColorShift: 'darken',
          transformEffect: 'scale(1.05)',
          shadowEffect: '0 4px 8px rgba(0,0,0,0.1)'
        }
      }
    };
  }
}

module.exports = { mapSemanticRoles, getClient, makeRawAPICall };