# design-extractor-auto

Automated design system extractor that generates a `DESIGN.md` manifesto from any URL.

## Overview
This tool navigates to a target URL, extracts computed styles from visible DOM nodes, and uses heuristic analysis combined with LLM reasoning (GPT-4o or compatible) to identify and document the underlying design system (colors, spacing, typography).

## Getting Started

### Prerequisites
- Node.js (LTS)
- OpenAI API Key (or local provider)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file based on `.env.example`
   - Add your `OPENAI_API_KEY`
   - (Optional) Add `OPENAI_BASE_URL` and `OPENAI_MODEL` for local or custom providers (e.g., Ollama, LocalAI).

#### Using a Local Provider
To use a local OpenAI-compatible provider (like Ollama), configure your `.env` file as follows:
```env
OPENAI_API_KEY=not-needed-for-local
OPENAI_BASE_URL=http://localhost:5050/ollama/api
OPENAI_MODEL=kimi-k2-thinking
```

## Usage

### CLI
Run the extractor from the command line:
```bash
node bin/cli.js <url> [output-path]
```
Example:
```bash
node bin/cli.js https://example.com my-design.md
```

### Programmatic API
```javascript
const { extractDesign } = require('./src/index');

(async () => {
  const tokens = await extractDesign('https://example.com');
  console.log('Detected Tokens:', tokens);
})();
```

## Output Format (`DESIGN.md`)
The generated manifesto follows the "Groundwork" principles:
- **Color Palette:** Semantic roles (Primary Action, Surface, etc.) assigned to hex values.
- **Spatial System:** Detected base unit (e.g., 8pt grid) and common spacing patterns.
- **Typography Hierarchy:** Geometric scale mapping and base font sizes.

## Project Structure
- `src/scraper.js`: Playwright extraction engine.
- `src/analyzer/`: Heuristic clustering for colors and spatial patterns.
- `src/llm/`: OpenAI GPT-4o semantic mapping integration.
- `src/generator/`: Markdown manifesto formatter.
- `bin/cli.js`: Command-line interface.

## Troubleshooting
- **Missing API Key:** Ensure `OPENAI_API_KEY` is set in your `.env` file.
- **Navigation Timeout:** Increase the timeout in `src/scraper.js` if the target site is slow.
- **Playwright Errors:** Ensure browser binaries are installed via `npx playwright install`.