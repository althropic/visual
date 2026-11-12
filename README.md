# visual-mirror

[![CI](https://github.com/YOUR_ORG/visual-mirror/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_ORG/visual-mirror/actions/workflows/ci.yml)

Point it at any website. Get back a complete design system — React components, Tailwind config, color tokens, and brand assets — ready to drop into your project.

---

## What it does

`visual-mirror` visits a URL with a real browser, reads every visible element's computed styles, captures hover states, and downloads logos and favicons. It then uses an LLM to map raw values to semantic design tokens (primary color, spacing scale, type hierarchy) and generates a portable design package you can copy straight into your codebase.

**One command → one folder with:**
- React components styled with Tailwind CSS
- A `tailwind.config.js` pre-loaded with your extracted color and spacing tokens
- A `theme.css` with CSS custom properties for every token
- A `DESIGN.md` documenting the design system in plain language
- Brand assets (logos, favicons)

---

## Requirements

- Node 20+
- An OpenAI API key (or any OpenAI-compatible local LLM)
- Chromium (installed automatically on first run via Playwright)

---

## Setup

```bash
# Install dependencies
npm ci

# Install the headless browser
npx playwright install chromium

# Create your .env file
cp .env.example .env
# → add your OPENAI_API_KEY
```

Your `.env` should look like:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o        # optional, defaults to gpt-4o
OPENAI_BASE_URL=           # optional — point to Ollama or any local LLM
LOG_LEVEL=info             # optional: debug | info | warn | error
```

---

## Usage

```bash
# Extract a design system from any public URL
npm run extract -- https://example.com

# Save to a custom folder instead of dist/
npm run extract -- https://example.com my-output-folder
```

That's it. Output lands in `dist/` (or your chosen folder) and is ready to use.

---

## Output

```
dist/
├── components/
│   ├── Button.jsx          # Generated React components
│   ├── Card.jsx
│   ├── Navigation.jsx
│   ├── index.js            # Barrel export
│   └── README.md           # Component usage guide
├── assets/
│   ├── logos/              # Extracted logo images
│   └── favicons/           # All favicon sizes
├── styles/
│   └── theme.css           # CSS custom properties
├── tailwind.config.js      # Drop-in Tailwind configuration
├── DESIGN.md               # Human-readable design system doc
├── package.json
└── README.md
```

### Using the output in your project

**1. Import the theme:**
```js
// main.tsx or main.jsx
import './path/to/dist/styles/theme.css';
```

**2. Merge the Tailwind config:**
```js
// tailwind.config.js
const extracted = require('./dist/tailwind.config.js');
module.exports = { theme: { extend: { ...extracted.theme.extend } } };
```

**3. Use the components:**
```jsx
import { Button, Card } from './dist/components';
```

---

## Works with local LLMs

Set `OPENAI_BASE_URL` to point at Ollama or any OpenAI-compatible server and the tool will use it instead of the OpenAI API. No API key required.

```env
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_MODEL=llama3
```

---

## Development

```bash
npm run lint        # ESLint — enforces no console.log in src/
npm run test:unit   # 21 fast unit tests, no browser needed
npm test            # Full suite including live Playwright scrape
```

---

## License

ISC
