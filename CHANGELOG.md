# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- `src/generator/tailwind-tokens.js` — Tailwind scale mapper: converts extracted px/rem values to nearest named tokens (`p-4`, `rounded-lg`, `max-w-7xl`), falling back to arbitrary-value syntax (`p-[18px]`) when no named token is close enough
- `src/generator/fragment-prompts.js` — extracted from `fragment-components.js`; owns `buildFragmentPrompt`
- `src/generator/fragment-fallbacks.js` — extracted from `fragment-components.js`; owns `generateFragmentComponentName` + `generateFallbackFragmentComponent`
- `eslint.config.mjs` — ESLint flat config with `no-console: error` targeting `src/`; test, bin, and logger files have appropriate overrides
- `.github/workflows/ci.yml` — CI pipeline: lint + unit tests on every push/PR; Playwright browser tests on main/master only
- ARIA & accessibility pass on all fallback generators: `button` gets `type="button"` + `aria-label` prop; `input` gets correct `type` + `id` + `aria-label`; `a` gets `aria-label`; `img` gets required `alt`; `nav`/`header`/`footer`/`main`/`aside` get landmark roles; interactive elements get `focus-visible:ring-2` focus ring
- `jest@30.5.2` added to `devDependencies`; `npm test` and `npm run test:unit` scripts wired up
- `tests/setup.js` — silences dotenv startup noise in test output

### Changed
- `src/generator/fragment-components.js` — slim orchestrator (177 → 69 lines); uses `config.llm.*` instead of `process.env`; all errors go through `logger`
- `src/generator/component-fallbacks.js` — ARIA attributes + token-mapped spacing/radius classes replacing arbitrary px values
- `src/generator/component-prompts.js` — LLM prompts now explicitly instruct ARIA attributes and focus-ring classes per element type
- `src/analyzer/spatial.js` — removed unused `stats` and `config` imports
- `src/analyzer/typography.js` — fixed duplicate `*/` parse error; removed unused `config` import
- `src/analyzer/archetype-classifiers.js` — eliminated unused `styles` variable
- `src/analyzer/color-scales.js`, `src/analyzer/colors.js` — renamed catch variables to `_e` for ESLint compliance
- `src/generator/templates.js` — renamed unused `assets` param to `_assets`
- `src/index.js` — renamed empty catch variable to `_e` with inline comment
- `src/integration/variable-injector.js` — removed unused `path` import
- `src/llm/client.js` — renamed unused NDJSON catch variable to `_e`
- `src/logger.js` — removed stale `eslint-disable-next-line` comments (now covered by ESLint config override)
- `src/scraper/hover-capture.js` — renamed `_` catch variables to `_e`; fixed unnecessary escape in regex
- `README.md` — added CI badge

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
