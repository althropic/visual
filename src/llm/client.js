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
    Hover States: ${JSON.stringify(data.hoverStates || {})}
    
    Return a structured JSON object with the following keys:
    - colorTokens: { primaryAction, secondaryAction, surface, textMain, textMuted }
    - spatialTokens: { baseUnit, containerPadding, stackGap }
    - typographyTokens: { scaleType, baseSize }
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

  const client = getClient();
  
  try {
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [
        { role: "system", content: "You are a design systems expert. Always respond with valid JSON only." },
        { role: "user", content: prompt }
      ],
      // Remove response_format for local providers that don't support it
      ...(process.env.OPENAI_BASE_URL ? {} : { response_format: { type: "json_object" } })
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
        scaleType: 'Major Third',
        baseSize: '16px'
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

module.exports = { mapSemanticRoles, getClient };