# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- `src/config.js` — central frozen config object; all env-var reads and hardcoded defaults now live here
- `src/logger.js` — levelled logger (`debug/info/warn/error`); replaces all `console.*` in `src/`
- `src/generator/templates.js` — extracted inline template generators (`generateThemeCSS`, `generatePackageJson`, `generateMainReadme`) from `src/index.js`
- `.env.example` — documents every supported environment variable with descriptions and defaults
- Jest test runner (`jest@30`); `npm test` now runs the suite
- `tests/` rewritten to Jest `describe`/`test` syntax with proper assertions

### Changed
- `src/index.js` — wires config and logger; trimmed from 271 to ~130 lines by extracting templates
- `src/scraper.js` — returns `browser` in result object so caller can close it; replaces magic numbers with config values; uses logger
- `src/llm/client.js` — reads model/key/baseURL from config; uses logger
- `src/generator/react-components.js` — uses config and logger; no direct `process.env` access
- `src/generator/fragment-components.js` — uses config and logger
- `src/integration/component-rewriter.js` — uses config and logger; removed stray `console.log` in guide text
- `src/analyzer/colors.js` — similarity threshold and palette size driven by config
- `src/analyzer/spatial.js` — base-unit candidates driven by config
- `src/analyzer/typography.js` — scale tolerance driven by config
- `src/analyzer/archetypes.js` — archetype thresholds driven by config
- `src/analyzer/assets.js` — uses logger instead of console.warn
- `package.json` — `npm test` now runs Jest; added `jest` config block

### Fixed
- Browser process leak: `src/index.js` `finally` block now closes the browser returned by `scraper.js`
- `tests/scraper.test.js` — fixed assertion path from `data.filter(...)` to `data.styles.filter(...)`

---

## [1.0.0] — Initial release

### Added
- Playwright headless scraper with hover-state delta capture
- Color, spatial, typography, archetype, and asset analyzers
- OpenAI LLM semantic mapping with deterministic fallback
- React component generators (archetype-based and fragment-based)
- Tailwind config, theme CSS, and design-doc generators
- Integration utilities: config merger, variable injector, component rewriter
- CLI entry point (`bin/cli.js`) with help, URL validation, and formatted output
