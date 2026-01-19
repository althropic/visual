# GUIDE.md

Human workflow guide for working with AI agents. For AI rules, see AGENTS.md.

---

## Quick Start

1. **New project?** Run `Invoke-Genesis` from PowerShell
2. **First session?** Tell agent: "Read AGENTS.md, create CONTEXT.md and TASKS.md"
3. **Continuing?** Tell agent: "Read state files, pick next task from Backlog"

---

## The Loop

```
┌─────────────────────────────────────────┐
│  1. Agent reads AGENTS.md + TASKS.md    │
│  2. Moves 1 task to Active              │
│  3. Breaks into 2-5 sub-steps           │
│  4. Executes sub-steps (1 commit each)  │
│  5. Moves task to Done, updates LOG.md  │
│  6. Repeat                              │
└─────────────────────────────────────────┘
```

---

## Core Principles

### The Agent MUST:
- Read AGENTS.md at every session start
- Keep exactly ONE task in Active at all times
- Break every Active task into 2-5 sub-steps
- Complete sub-steps sequentially (no skipping)
- Update TASKS.md after each sub-step
- Commit automatically after each sub-step
- Never ask permission to commit

### You SHOULD:
- Be specific about what you want
- Reference AGENTS.md when agent deviates
- Review commits regularly
- Keep tasks atomic (< 1 hour each)
- Trust the process

---

## Prompt Library

### 🚀 Session Initialization

#### First Time Setup
```
Read AGENTS.md completely. Then create CONTEXT.md with our tech stack and objectives, 
and create TASKS.md following the strict format in AGENTS.md. Don't start implementing yet.
```

#### Continuing Session
```
Read AGENTS.md and TASKS.md. Verify .gitignore is properly configured. 
What's the current Active task and which sub-step are we on?
```

#### Agent Acting Strange
```
Stop. Re-read AGENTS.md completely, especially the "CRITICAL" sections. 
Then tell me what you should be doing right now according to the rules.
```

---

### 📋 Planning & Task Management

#### Create Initial Task List
```
I want to build [describe feature/project]. Read AGENTS.md, then create tasks in TASKS.md 
following the atomic formula: [Category]: {Action} {Subject} ({Definition of Done}). 
Each task should take < 1 hour. Don't implement yet, just plan.
```

#### Break Down Dense Task
```
The task "[task name]" seems too dense (>1 hour). Break it down into 2-4 smaller tasks, 
each following the formula in AGENTS.md. Update TASKS.md Backlog.
```

#### Add New Task
```
Add this task to TASKS.md Backlog: [Category]: {Action} {Subject} ({Definition of Done}).
Include a brief description of what needs to be done.
```

#### Prioritize Backlog
```
Review TASKS.md Backlog. Reorder by priority: most impactful and foundational tasks first, 
dependent tasks after their dependencies.
```

#### Review Task Quality
```
Review all tasks in TASKS.md Backlog. Check that each follows the formula from AGENTS.md. 
Flag any that are too vague, too dense (>1 hour), or missing Definition of Done.
```

---

### ⚡ Execution Commands

#### Start Next Task
```
Move the top task from Backlog to Active. Decompose it into 2-5 atomic sub-steps. 
Show me the sub-steps, then start with sub-step 1.
```

#### Start Specific Task
```
Move "[task name]" from Backlog to Active. Break it into 2-5 sub-steps following AGENTS.md rules. 
Then implement sub-step 1.
```

#### Continue Current Task
```
Continue with the next unchecked sub-step in the Active task. 
Update TASKS.md and commit when done.
```

#### Complete Sub-step
```
Mark the current sub-step as complete in TASKS.md, commit your changes with a conventional 
commit message, then move to the next sub-step.
```

#### Finish Task
```
All sub-steps are done. Mark the parent task as complete, move the entire task block 
to Done section (keep sub-steps visible), commit, and tell me what's next in Backlog.
```

---

### 🔧 Maintenance & Corrections

#### Fix TASKS.md Format
```
TASKS.md doesn't follow the strict format in AGENTS.md. Reformat it exactly as shown 
in the template, including the Real-World Example structure.
```

#### Enforce Single Active Task
```
There are multiple tasks in Active. This violates AGENTS.md rules. Move all but the 
highest priority task back to Backlog. Keep only ONE task in Active.
```

#### Add Missing Sub-steps
```
The Active task has no sub-steps. This violates AGENTS.md. Break it down into 2-5 
atomic sub-steps right now before continuing.
```

#### Fix Incomplete Task
```
You marked the task complete but not all sub-steps are checked. This violates AGENTS.md. 
Either complete the remaining sub-steps or explain why they're not needed.
```

#### Create Missing File
```
Create [CONTEXT.md / TASKS.md / ARCHITECTURE.md] using the exact template from AGENTS.md.
```

#### Update Architecture
```
We've made structural changes. Update ARCHITECTURE.md with the current directory map 
and key components.
```

---

### 🔍 Review & Status

#### Check Current State
```
Read TASKS.md. Tell me: 1) What task is Active? 2) Which sub-step are we on? 
3) How many tasks are in Backlog? 4) How many completed in Done?
```

#### Review Progress
```
Review TASKS.md and LOG.md. Summarize what we've accomplished this session and 
what's next in priority order.
```

#### Audit Compliance
```
Audit the project against AGENTS.md rules. Check: 1) Is .gitignore properly configured? 
2) Is there exactly 1 Active task? 3) Does Active task have 2-5 sub-steps? 
4) Are all files following templates? Report any violations.
```

#### End of Session
```
We're ending this session. Update LOG.md with today's progress, ensure TASKS.md is 
current, and summarize what we accomplished and what's next.
```

---

### 🐛 Debugging & Fixes

#### Agent Skipped Steps
```
You skipped ahead. AGENTS.md requires sequential sub-step completion. Go back to the 
first unchecked sub-step and complete it properly.
```

#### Agent Forgot to Commit
```
You didn't commit after completing that sub-step. AGENTS.md requires automatic commits. 
Commit now with a conventional commit message, then continue.
```

#### Agent Forgot to Update TASKS.md
```
You completed work but didn't update TASKS.md. Update it now to mark the sub-step 
as complete, then commit the TASKS.md change.
```

#### Agent Working on Multiple Tasks
```
Stop. You're working on multiple tasks simultaneously. AGENTS.md strictly forbids this. 
Move all but one task back to Backlog. Focus only on the Active task.
```

#### Agent Asked Permission to Commit
```
Don't ask permission to commit. AGENTS.md section "Commits - AUTOMATIC AND MANDATORY" 
requires you to commit automatically. Commit now and continue.
```

---

### 🎯 Specific Workflows

#### Test-Driven Development
```
Move "[task name]" to Active. Break into sub-steps following TDD: 1) Write failing tests, 
2) Implement minimum code to pass, 3) Refactor, 4) Commit. Follow AGENTS.md rules.
```

#### Refactoring Task
```
Create a refactoring task: "Refactor: [Component] ([Goal])". Move to Active, break into 
sub-steps: 1) Write tests for current behavior, 2) Refactor code, 3) Verify tests pass, 
4) Update docs. Follow AGENTS.md.
```

#### Bug Fix Task
```
Create bug fix task: "Fix: [Issue] ([Expected behavior])". Move to Active, break into 
sub-steps: 1) Write test reproducing bug, 2) Fix bug, 3) Verify test passes, 4) Check 
for similar issues. Follow AGENTS.md.
```

#### Documentation Task
```
Create docs task: "Docs: [Subject] ([Deliverable])". Move to Active, break into sub-steps. 
Remember: AGENTS.md requires *.md in .gitignore except README.md, AGENTS.md, GUIDE.md.
```

---

### 🔐 .gitignore Management

#### Check .gitignore
```
Read .gitignore. Verify it contains all required patterns from AGENTS.md section 
".gitignore Management - MANDATORY". Report any missing patterns.
```

#### Fix .gitignore
```
Update .gitignore to include all required patterns from AGENTS.md. Then run git status 
to verify no unwanted files are tracked.
```

#### Add Language-Specific Patterns
```
We're using [Node.js/Python/Java/C#]. Add the language-specific .gitignore patterns 
from AGENTS.md section ".gitignore Management".
```

#### Remove Tracked Files
```
These files shouldn't be tracked: [list files]. Add them to .gitignore, then run 
git rm --cached [files] to untrack them.
```

---

### 💡 Advanced Prompts

#### Parallel Sub-tasks
```
The Active task has sub-steps that could be done in parallel. Reorganize them so 
independent sub-steps are grouped together, but maintain the 2-5 sub-step limit.
```

#### Nested Sub-steps
```
Sub-step "[name]" is too dense (>30 minutes). AGENTS.md allows nesting. Break it into 
2-4 nested checkboxes under that sub-step.
```

#### Group Light Tasks
```
We have several small fixes (typos, minor tweaks). AGENTS.md says to group these. 
Create one task: "Chore: UI Polish (Fix minor issues)" with sub-steps for each fix.
```

#### Validate Definition of Done
```
Review the Active task. Does the Definition of Done match what the sub-steps will 
accomplish? If not, either update the DoD or adjust the sub-steps.
```

#### Cross-reference with CONTEXT.md
```
Read CONTEXT.md objectives. Are our TASKS.md Backlog items aligned with these objectives? 
Flag any misalignment or suggest missing tasks.
```

---

## File Roles

| File | Created By | Purpose | Tracked in Git? |
|------|------------|---------|-----------------|
| AGENTS.md | Genesis | Rules + templates for AI | ✅ Yes |
| GUIDE.md | Genesis | This guide (for humans) | ✅ Yes |
| README.md | Genesis | Project info | ✅ Yes |
| LOG.md | Genesis | Session activity log | ❌ No (local) |
| CONTEXT.md | AI Agent | Tech stack + objectives | ❌ No (local) |
| TASKS.md | AI Agent | Task board (Backlog/Active/Done) | ❌ No (local) |
| ARCHITECTURE.md | AI Agent | Directory map + components | ❌ No (local) |

---

## Common Mistakes & Fixes

### ❌ Mistake: Agent works on multiple tasks
**Fix:** `"Stop. AGENTS.md requires exactly 1 Active task. Move extras back to Backlog."`

### ❌ Mistake: Agent skips sub-steps
**Fix:** `"Go back to the first unchecked sub-step. AGENTS.md requires sequential completion."`

### ❌ Mistake: Agent doesn't commit
**Fix:** `"Commit now. AGENTS.md requires automatic commits after each sub-step."`

### ❌ Mistake: Agent asks permission to commit
**Fix:** `"Don't ask. AGENTS.md section 'Commits - AUTOMATIC AND MANDATORY' requires automatic commits."`

### ❌ Mistake: Task has no sub-steps
**Fix:** `"Break this task into 2-5 atomic sub-steps before continuing. AGENTS.md requires this."`

### ❌ Mistake: Task marked complete with unchecked sub-steps
**Fix:** `"You can't mark the task complete. AGENTS.md requires all sub-steps to be checked first."`

### ❌ Mistake: TASKS.md format is wrong
**Fix:** `"Reformat TASKS.md using the exact template from AGENTS.md, including the Real-World Example structure."`

### ❌ Mistake: .gitignore missing patterns
**Fix:** `"Update .gitignore with all required patterns from AGENTS.md '.gitignore Management' section."`

---

## Tips for Success

### 🎯 Be Specific
- ✅ "Move 'Auth: Implement user registration' to Active and break into sub-steps"
- ❌ "Start the auth thing"

### 📖 Reference AGENTS.md
- ✅ "According to AGENTS.md, you must commit after each sub-step"
- ❌ "You should probably commit"

### 🔄 Trust the Process
- Let the agent commit automatically
- Don't micromanage sub-steps
- Review commits in batches

### ⚡ Keep Tasks Atomic
- Each task < 1 hour of coding
- If longer, break it down
- Use the formula: `[Category]: {Action} {Subject} ({Definition of Done})`

### 📝 Maintain State Files
- TASKS.md is the source of truth
- Update LOG.md at session end
- Keep ARCHITECTURE.md current

### 🚫 Don't Fight the System
- One Active task at a time
- Sequential sub-step completion
- Automatic commits
- These rules exist for good reasons

---

## Troubleshooting

### Agent isn't following AGENTS.md
```
Stop everything. Re-read AGENTS.md from top to bottom, especially sections marked 
"CRITICAL", "MANDATORY", and "STRICT ENFORCEMENT". Then tell me what rules you violated 
and how you'll fix them.
```

### Project feels chaotic
```
Audit the project: 1) Read AGENTS.md, 2) Check TASKS.md format, 3) Verify exactly 1 
Active task, 4) Confirm .gitignore is correct, 5) Review recent commits. Report status.
```

### Lost track of progress
```
Read TASKS.md and LOG.md. Create a summary: What's done? What's Active? What's next? 
What blockers exist?
```

### Need to reset
```
Read AGENTS.md. Audit TASKS.md against the strict format. Fix any violations. Ensure 
exactly 1 Active task with 2-5 sub-steps. Report when ready to continue.
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│  AGENT MUST DO                                              │
├─────────────────────────────────────────────────────────────┤
│  ✓ Read AGENTS.md at session start                         │
│  ✓ Keep exactly 1 task in Active                           │
│  ✓ Break Active task into 2-5 sub-steps                    │
│  ✓ Complete sub-steps sequentially                         │
│  ✓ Update TASKS.md after each sub-step                     │
│  ✓ Commit automatically after each sub-step                │
│  ✓ Use conventional commit format                          │
│  ✓ Verify .gitignore at session start                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  AGENT MUST NOT DO                                          │
├─────────────────────────────────────────────────────────────┤
│  ✗ Work on multiple tasks simultaneously                   │
│  ✗ Skip sub-steps or work out of order                     │
│  ✗ Mark tasks complete without finishing sub-steps         │
│  ✗ Ask permission to commit                                │
│  ✗ Forget to update TASKS.md                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TASK FORMULA                                               │
├─────────────────────────────────────────────────────────────┤
│  [Category]: {Action} {Subject} ({Definition of Done})     │
│                                                             │
│  Example:                                                   │
│  Auth: Implement user registration                         │
│        (Create registration endpoint with validation)      │
└─────────────────────────────────────────────────────────────┘
```

---

## Emergency Commands

### Nuclear Option - Full Reset
```
Stop all work. Read AGENTS.md completely. Audit all files against templates. 
Fix TASKS.md format. Ensure exactly 1 Active task. Verify .gitignore. 
Report all violations found and fixes applied. Wait for my approval to continue.
```

### Force Compliance
```
You are violating AGENTS.md rules. Stop immediately. Re-read the "CRITICAL" and 
"MANDATORY" sections. List every rule you're breaking. Fix them now. Don't continue 
until you're compliant.
```

### Checkpoint
```
Pause. Commit all current changes. Update TASKS.md to reflect current state. 
Update LOG.md with progress. Tell me: What's done? What's in progress? What's next?
```

---

**Remember:** AGENTS.md contains the rules. This guide helps you enforce them.
When in doubt, reference AGENTS.md explicitly in your prompts.
