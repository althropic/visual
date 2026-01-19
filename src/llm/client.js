const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a design systems expert." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}

module.exports = { mapSemanticRoles };