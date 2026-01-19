# TASKS.md

## Backlog

### Analysis: Build color clustering module (Create chroma-js based palette extractor)
- [ ] Create src/analyzer/colors.js module
- [ ] Implement hex color extraction from style data
- [ ] Use chroma-js for color clustering and palette generation
- [ ] Detect primary, secondary, and accent colors
- [ ] Export color analysis function

### Analysis: Build spatial pattern detector (Create grid system identifier)
- [ ] Create src/analyzer/spatial.js module
- [ ] Extract spacing values (margin, padding, gaps) from style data
- [ ] Use simple-statistics to find common spacing patterns
- [ ] Detect base unit (e.g., 8pt grid) and validate consistency
- [ ] Export spatial analysis function

### LLM: Implement OpenAI semantic mapping (Create style-to-meaning API integration)
- [ ] Create src/llm/client.js with OpenAI configuration
- [ ] Design prompt template for semantic style analysis
- [ ] Implement function to send style data to GPT-4o
- [ ] Parse structured output for design tokens
- [ ] Export semantic mapping function

### Generator: Create DESIGN.md output formatter (Build markdown documentation generator)
- [ ] Create src/generator/design-md.js module
- [ ] Design DESIGN.md template following Groundwork principles
- [ ] Implement color palette documentation section
- [ ] Implement spatial system documentation section
- [ ] Implement typography hierarchy section
- [ ] Export generateDesignDoc function

### Integration: Build main orchestration pipeline (Connect all modules end-to-end)
- [ ] Create src/index.js as main entry point
- [ ] Import and wire together scraper, analyzers, LLM, and generator
- [ ] Implement URL input and DESIGN.md output flow
- [ ] Add error handling and logging
- [ ] Export main extractDesign function

### Testing: Validate scraper with test URL (Test extraction against known design system)
- [ ] Create tests/scraper.test.js
- [ ] Set up test URL with predictable styles
- [ ] Verify computed style extraction accuracy
- [ ] Test visibility filtering logic
- [ ] Run and validate scraper tests

### Testing: Validate color analysis (Test palette extraction accuracy)
- [ ] Create tests/colors.test.js
- [ ] Create mock style data with known color patterns
- [ ] Test color extraction and clustering
- [ ] Verify primary/accent color detection
- [ ] Run and validate color tests

### Testing: Validate spatial analysis (Test grid system detection)
- [ ] Create tests/spatial.test.js
- [ ] Create mock style data with 8pt grid spacing
- [ ] Test base unit detection algorithm
- [ ] Verify spacing pattern recognition
- [ ] Run and validate spatial tests

### Testing: Validate LLM semantic mapping (Test GPT-4o style interpretation)
- [ ] Create tests/llm.test.js
- [ ] Mock OpenAI API responses
- [ ] Test prompt formatting and data sending
- [ ] Verify structured output parsing
- [ ] Run and validate LLM tests

### Testing: End-to-end integration test (Test complete URL-to-DESIGN.md workflow)
- [ ] Create tests/integration.test.js
- [ ] Set up test URL with comprehensive design system
- [ ] Run full extraction pipeline
- [ ] Verify DESIGN.md output structure and content
- [ ] Validate all sections (colors, spacing, typography)

### CLI: Create command-line interface (Build URL input and output file handling)
- [ ] Create bin/cli.js with shebang and argument parsing
- [ ] Implement URL parameter validation
- [ ] Add output file path option (default: DESIGN.md)
- [ ] Integrate with main extraction pipeline
- [ ] Test CLI with sample URLs

### Documentation: Write project README (Document setup and usage instructions)
- [ ] Document project overview and objectives
- [ ] Write installation and setup instructions
- [ ] Create usage examples for CLI and programmatic API
- [ ] Document output format and design token structure
- [ ] Add troubleshooting section

## Active

### Scraper: Implement Playwright extraction engine (Create URL-to-style-data pipeline)
- [ ] Create src/scraper.js with Playwright browser launch
- [ ] Implement page navigation and load wait logic
- [ ] Extract computed styles from all visible DOM nodes
- [ ] Filter and sanitize extracted style data
- [ ] Export scrape function with URL parameter

## Done

### Setup: Initialize Node.js project (Create package.json with dependencies)
- [x] Run `npm init -y` to create package.json
- [x] Install Playwright: `npm install playwright`
- [x] Install OpenAI SDK: `npm install openai`
- [x] Install analysis libraries: `npm install chroma-js simple-statistics`
- [x] Create .env file template for API keys