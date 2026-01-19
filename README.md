# bioses-incite

Brief project description.

## Overview

[What this project does and why it exists.]

## Getting Started

1. Clone the repository
2. Review `AGENTS.md` for project standards
3. Start coding in `src/`

> **Note:** This project uses Genesis scaffolding. Derived files (CONTEXT.md, TASKS.md) are created by AI agents on-demand.

## Project Structure

```
bioses-incite/
├── src/              # Source code
├── tests/            # Test files
├── AGENTS.md         # AI agent rules and templates
├── GUIDE.md          # Human operator guide
├── LOG.md            # Session activity log
├── README.md         # This file
└── .gitignore        # Git ignore patterns
```

## Workflow

See `GUIDE.md` for detailed workflow instructions and prompt library.

Quick start:
1. Tell your AI agent: "Read AGENTS.md, create CONTEXT.md and TASKS.md"
2. Define your objectives in CONTEXT.md
3. Let the agent populate TASKS.md with atomic tasks
4. Start executing tasks one at a time

## Rules

This project follows strict task management rules defined in `AGENTS.md`:
- Exactly 1 task in Active at a time
- Every task broken into 2-5 atomic sub-steps
- Automatic commits after each sub-step
- Sequential sub-step completion (no skipping)

For the complete rule set, see `AGENTS.md`.