# TASKS.md

## Backlog

## Active

## Done

### LLM: Configure local provider support (Update client to support custom base URL and model ID)
- [x] Update `src/llm/client.js` to support `OPENAI_BASE_URL` and `OPENAI_MODEL`
- [x] Update `.env.example` with new configuration options
- [x] Update `README.md` with local provider instructions

### Documentation: Write project README (Document setup and usage instructions)
- [x] Document project overview and objectives
- [x] Write installation and setup instructions
- [x] Create usage examples for CLI and programmatic API
- [x] Document output format and design token structure
- [x] Add troubleshooting section

### CLI: Create command-line interface (Build URL input and output file handling)
- [x] Create bin/cli.js with shebang and argument parsing
- [x] Implement URL parameter validation
- [x] Add output file path option (default: DESIGN.md)
- [x] Integrate with main extraction pipeline
- [x] Test CLI with sample URLs

### Testing: End-to-end integration test (Test complete URL-to-DESIGN.md workflow)
- [x] Create tests/integration.test.js
- [x] Set up test URL with comprehensive design system
- [x] Run full extraction pipeline
- [x] Verify DESIGN.md output structure and content
- [x] Validate all sections (colors, spacing, typography)

### Testing: Validate LLM semantic mapping (Test GPT-4o style interpretation)
- [x] Create tests/llm.test.js
- [x] Mock OpenAI API responses
- [x] Test prompt formatting and data sending
- [x] Verify structured output parsing
- [x] Run and validate LLM tests

### Testing: Validate spatial analysis (Test grid system detection)
- [x] Create tests/spatial.test.js
- [x] Create mock style data with 8pt grid spacing
- [x] Test base unit detection algorithm
- [x] Verify spacing pattern recognition
- [x] Run and validate spatial tests

### Testing: Validate color analysis (Test palette extraction accuracy)
- [x] Create tests/colors.test.js
- [x] Create mock style data with known color patterns
- [x] Test color extraction and clustering
- [x] Verify primary/accent color detection
- [x] Run and validate color tests

### Testing: Validate scraper with test URL (Test extraction against known design system)
- [x] Create tests/scraper.test.js
- [x] Set up test URL with predictable styles
- [x] Verify computed style extraction accuracy
- [x] Test visibility filtering logic
- [x] Run and validate scraper tests

### Integration: Build main orchestration pipeline (Connect all modules end-to-end)
- [x] Create src/index.js as main entry point
- [x] Import and wire together scraper, analyzers, LLM, and generator
- [x] Implement URL input and DESIGN.md output flow
- [x] Add error handling and logging
- [x] Export main extractDesign function

### Generator: Create DESIGN.md output formatter (Build markdown documentation generator)
- [x] Create src/generator/design-md.js module
- [x] Design DESIGN.md template following Groundwork principles
- [x] Implement color palette documentation section
- [x] Implement spatial system documentation section
- [x] Implement typography hierarchy section
- [x] Export generateDesignDoc function

### LLM: Implement OpenAI semantic mapping (Create style-to-meaning API integration)
- [x] Create src/llm/client.js with OpenAI configuration
- [x] Design prompt template for semantic style analysis
- [x] Implement function to send style data to GPT-4o
- [x] Parse structured output for design tokens
- [x] Export semantic mapping function

### Analysis: Build spatial pattern detector (Create grid system identifier)
- [x] Create src/analyzer/spatial.js module
- [x] Extract spacing values (margin, padding, gaps) from style data
- [x] Use simple-statistics to find common spacing patterns
- [x] Detect base unit (e.g., 8pt grid) and validate consistency
- [x] Export spatial analysis function

### Analysis: Build color clustering module (Create chroma-js based palette extractor)
- [x] Create src/analyzer/colors.js module
- [x] Implement hex color extraction from style data
- [x] Use chroma-js for color clustering and palette generation
- [x] Detect primary, secondary, and accent colors
- [x] Export color analysis function

### Scraper: Implement Playwright extraction engine (Create URL-to-style-data pipeline)
- [x] Create src/scraper.js with Playwright browser launch
- [x] Implement page navigation and load wait logic
- [x] Extract computed styles from all visible DOM nodes
- [x] Filter and sanitize extracted style data
- [x] Export scrape function with URL parameter

### Setup: Initialize Node.js project (Create package.json with dependencies)
- [x] Run `npm init -y` to create package.json
- [x] Install Playwright: `npm install playwright`
- [x] Install OpenAI SDK: `npm install openai`
- [x] Install analysis libraries: `npm install chroma-js simple-statistics`
- [x] Create .env file template for API keys