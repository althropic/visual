const OpenAI = require('openai');
require('dotenv').config();

// Initialize lazily to avoid errors during testing/mocking
let openai;
function getClient() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('Missing OPENAI_API_KEY environment variable');
    }
    const options = {
      apiKey: process.env.OPENAI_API_KEY,
    };

    // Support for local providers or custom base URLs
    if (process.env.OPENAI_BASE_URL) {
      options.baseURL = process.env.OPENAI_BASE_URL;
    }

    openai = new OpenAI(options);
  }
  return openai;
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
    
    Return a structured JSON object with the following keys:
    - colorTokens: { primaryAction, secondaryAction, surface, textMain, textMuted }
    - spatialTokens: { baseUnit, containerPadding, stackGap }
    - typographyTokens: { scaleType, baseSize }
  `;

  const client = getClient();
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o",
    messages: [
      { role: "system", content: "You are a design systems expert." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}

module.exports = { mapSemanticRoles };