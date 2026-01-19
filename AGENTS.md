# AGENTS.md

Rules and templates for AI agents. Read this at session start.

---

## Rules

### Constraints

- **file length:** max 200 lines; propose refactor if exceeded
- **solid:** single responsibility, dependency inversion
- **environment:** powershell (windows), always use powershell commands.

### Task Management (Atomic Scoping) - STRICT ENFORCEMENT

**CRITICAL:** You MUST follow these rules exactly. No exceptions.

- **The Formula:** Every task MUST follow: `[Category]: {Action} {Subject} ({Definition of Done})`
  - Example: `Auth: Implement user registration (Create registration endpoint with validation)`
- **Granularity:** If a task takes >1 hour of coding, it is **Too Dense**. It MUST be broken into sub-tasks.
- **Active Limit:** Only **1 task** should be in `Active` at a time. NEVER work on multiple tasks simultaneously.
- **Sub-tasks:** Every `Active` task MUST be decomposed into 2-5 atomic sub-steps before work begins.
- **Sub-step Format:** Each sub-step MUST be a checkbox with clear, actionable description
  - Example: `- [ ] Install bcrypt package`
  - Example: `- [ ] Hash passwords before storing`
- **Completion Order:** Work through sub-steps sequentially. Do NOT skip ahead or work out of order.
- **TASKS.md is Source of Truth:** Always read TASKS.md at session start. Always update TASKS.md as you work.

### TASKS.md Editing Rules - MANDATORY

**You MUST follow these editing rules when updating TASKS.md:**

1. **Moving to Active:**
   - Move ONE task from Backlog to Active
   - Immediately decompose it into 2-5 sub-steps
   - Mark parent task as `- [ ]` (unchecked)
   - Mark all sub-steps as `- [ ]` (unchecked)

2. **Completing Sub-steps:**
   - As you complete each sub-step, change `- [ ]` to `- [x]`
   - Update TASKS.md after EACH sub-step completion
   - Commit after EACH sub-step completion

3. **Completing Tasks:**
   - When ALL sub-steps are `- [x]`, mark parent task as `- [x]`
   - Move entire task block from Active to Done section
   - Keep sub-steps visible in Done section for history

4. **Never Skip Steps:**
   - Do NOT mark tasks complete without completing all sub-steps
   - Do NOT work on tasks still in Backlog
   - Do NOT have multiple tasks in Active

### Commits - AUTOMATIC AND MANDATORY

**You MUST commit changes automatically after every meaningful action:**

1. **When to Commit:**
   - After completing each task.
   - After creating/modifying any source file
   - After running tests successfully

2. **Commit Format:**
   - Use conventional commits: `<type>: <description>`
   - Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
   - Style: lowercase, present tense, no trailing period
   - Example: `feat: add user registration endpoint`
   - Example: `test: add unit tests for auth routes`

3. **Commit Process:**
   - Stage relevant files: `git add <files>`
   - Commit with message: `git commit -m "<type>: <description>"`
   - Do NOT ask user permission to commit
   - Commit automatically as part of your workflow
   - Never commit TASKS.md and LOG.md. Keep them local.

4. **Atomic Commits:**
   - One logical change per commit
   - One task typically equals one commit
   - Keep commits small and focused

### .gitignore Management - MANDATORY

**You MUST ensure .gitignore is properly configured:**

1. **At Project Start:**
   - Check if .gitignore exists
   - If missing, create it immediately
   - If exists, verify it contains required patterns

2. **Required Patterns:**
   ```
   # Documentation (keep local)
   TASKS.md
   LOG.md
   
   # Dependencies
   node_modules/
   __pycache__/
   *.pyc
   venv/
   .venv/
   
   # Environment
   .env
   .env.local
   .env.*.local
   
   # IDE
   .idea/
   *.swp
   *.swo
   *~
   
   # OS
   .DS_Store
   Thumbs.db
   
   # Build outputs
   dist/
   build/
   *.log

   # Rule files
   .clinerules
   ```

3. **Language-Specific Additions:**
   - **Node.js:** Add `node_modules/`, `package-lock.json` (if using yarn), `.npm/`
   - **Python:** Add `__pycache__/`, `*.pyc`, `*.pyo`, `.pytest_cache/`, `venv/`
   - **Java:** Add `target/`, `*.class`, `*.jar`
   - **C#:** Add `bin/`, `obj/`, `*.dll`, `*.exe`

4. **Verification:**
   - After creating/updating .gitignore, run: `git status`
   - Ensure no unwanted files are tracked
   - If unwanted files are tracked, run: `git rm --cached <file>`

### Workflow

- **state check:** read CONTEXT.md, AGENTS.md, TASKS.md at session start.
- **atomic breakdown:** If a task is moved to `Active`, the agent MUST first propose/write the sub-steps.
- **tdd:** unit tests required for new functions (>80% coverage).
- **logging:** update LOG.md after each session with compliance status.
- **auto-commit:** commit changes automatically after each sub-step completion.

---

## Self-Correction

If a derived file is missing, create it using the appropriate template:

- Missing `CONTEXT.md` → create with Tech Stack + Core Objectives
- Missing `TASKS.md` → create with Active/Backlog/Done columns

Refer to GUIDE.md for examples and detailed instructions.

---

## Templates

These templates are used by the genesis.ps1 script to scaffold new projects. The script extracts these templates from AGENTS.md and processes them with placeholder replacements.

**Placeholders:**
- `{{PROJECT_NAME}}` - Replaced with the project name
- `{{DATE}}` - Replaced with current date (yyyy-MM-dd format)

### .gitignore Template

```
TASKS.md
LOG.md
!README.md
!AGENTS.md
!GUIDE.md

# Dependencies
node_modules/
__pycache__/
*.pyc
venv/
.venv/

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Build outputs
dist/
build/
*.log

# Rule files
.clinerules
```

### README.md Template

```markdown
# {{PROJECT_NAME}}

Brief project description.

## Overview

[What this project does and why it exists.]

## Getting Started

1. Clone the repository
2. Review `AGENTS.md` for project standards
3. Start coding in `src/`

> **Note:** This project uses Genesis scaffolding. Derived files (CONTEXT.md, TASKS.md) are created by AI agents on-demand.

## Project Structure

\`\`\`
{{PROJECT_NAME}}/
├── src/              # Source code
├── tests/            # Test files
├── AGENTS.md         # AI agent rules and templates
├── GUIDE.md          # Human operator guide
├── LOG.md            # Session activity log
├── README.md         # This file
└── .gitignore        # Git ignore patterns
\`\`\`

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
```

### LOG.md Template

```markdown
# LOG.md

| date | activity | status | compliance |
| :--- | :--- | :--- | :--- |
| {{DATE}} | chore: scaffold project with genesis | completed | pass |
```

