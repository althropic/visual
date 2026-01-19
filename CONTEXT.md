# CONTEXT.md
```markdown
# Project Context: design-extractor-auto

## Tech Stack
- **Runtime:** Node.js (LTS)
- **Engine:** Playwright (Headless Browser Extraction)
- **Intelligence:** OpenAI API (GPT-4o Structured Outputs)
- **Analysis:** Chroma-js (Color Clustering) & Simple-Statistics (Spatial Pattern Detection)
- **Output:** Markdown / CSS Variable Tokens

## Core Objectives
1. **Headless Extraction:** Navigate to a target URL and extract `window.getComputedStyle` from all visible DOM nodes.
2. **Heuristic Clustering:** Analyze extracted data to identify the underlying spatial system (e.g., 8pt grid) and color palette.
3. **Semantic Mapping:** Utilize LLM reasoning to assign functional roles to raw values (e.g., identifying which hex code is the "Primary Action" vs "Muted Text").
4. **Auto-Documentation:** Generate a `DESIGN.md` manifesto that follows the "Groundwork" principles (Hierarchy, Symmetry, and Semantic Logic).

## Design System Groundwork (The "Manifesto" Target)
To ensure the automated output is high-quality, the extractor must look for:
- **Spatial Fulcrum:** Identification of the primary content alignment axis.
- **8pt Grid Consistency:** Rounding raw pixel values to the nearest multiple of the detected base unit.
- **Interaction DNA:** Extraction of transition timings and easing functions from CSS animations.
- **Semantic Hierarchy:** Mapping typography to a geometric scale (Major Third/Minor Third).

## Target Workflow
`URL Input` -> `Playwright Scrape` -> `Data Sanitization` -> `LLM Semantic Analysis` -> `DESIGN.md Output`
```

---

### Next Step Recommendation
To proceed following your **AGENTS.md** rules, I should now create **TASKS.md** and move the first atomic task into **Active**. 

**Task Proposal:**
`Project: Initialize TASKS.md (Create the initial backlog based on CONTEXT.md)`