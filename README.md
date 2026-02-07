# visual-mirror

Design extraction and cloning tool — captures complete design systems from any website and generates React components with Tailwind CSS.

## Overview

`visual-mirror` is a CLI tool that scrapes a target website, analyzes its visual design (colors, spacing, typography, component patterns), and uses LLM intelligence to generate a portable design system package including React components, Tailwind configuration, and comprehensive documentation.

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file with your OpenAI API key:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o  # optional, defaults to gpt-4o
```

## Usage

### CLI

```bash
# Install globally
npm install -g .

# Extract design from a website
visual-mirror https://example.com

# Specify custom output directory
visual-mirror https://example.com my-design-system
```

### Local (via npm script)

```bash
npm run extract -- https://example.com
```

### Options

| Argument | Description | Default |
|----------|-------------|---------|
| `url` | Target website URL to extract | (required) |
| `output-dir` | Output directory for design package | `dist` |

## Output Structure

The tool generates a complete design system package:

```
dist/
├── components/          # React components (.jsx)
│   ├── index.js        # Component library entry
│   └── README.md       # Component documentation
├── assets/
│   ├── logos/          # Extracted logos
│   └── favicons/       # Favicons
├── styles/
│   └── theme.css       # CSS custom properties
├── tailwind.config.js  # Tailwind configuration
├── DESIGN.md           # Design system documentation
├── package.json        # Design system package info
└── README.md           # Usage guide
```

## Features

- **Visual Analysis**: Extracts color palettes, spacing scales, typography, and layout patterns
- **Component Detection**: Identifies archetypal UI components (buttons, cards, inputs, etc.)
- **Hover State Capture**: Analyzes interaction patterns and animations
- **Asset Extraction**: Downloads logos, favicons, and brand assets
- **LLM-Powered**: Uses OpenAI for semantic mapping and intelligent component generation
- **React Generation**: Produces production-ready React components with Tailwind classes

## Project Structure

```
visual-mirror/
├── bin/
│   └── cli.js          # CLI entry point
├── src/
│   ├── analyzer/       # Design analysis modules
│   │   ├── archetypes.js
│   │   ├── assets.js
│   │   ├── colors.js
│   │   ├── hover.js
│   │   ├── spatial.js
│   │   └── typography.js
│   ├── generator/      # Code generation
│   │   ├── component-index.js
│   │   ├── design-md.js
│   │   ├── fragment-components.js
│   │   ├── react-components.js
│   │   └── tailwind-config.js
│   ├── llm/            # LLM client
│   │   └── client.js
│   ├── index.js        # Main orchestration
│   └── scraper.js      # Web scraping
├── tests/              # Test files
├── package.json
└── README.md
```

## Dependencies

- `playwright` — Web scraping and browser automation
- `openai` — LLM integration for design analysis
- `chroma-js` — Color manipulation and analysis
- `simple-statistics` — Statistical analysis for design patterns
- `dotenv` — Environment variable management

## License

ISC
