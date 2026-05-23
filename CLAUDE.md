# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward correctness and caution over speed. For trivial tasks, use judgment.

---

## Precedence (UPDATED SYSTEM MODEL)

When instructions conflict, follow this order:

1. **Runtime Memory System (HIGHEST PRIORITY)**
   - .cursor/memory/state.md
   - .cursor/memory/context.md
   - .cursor/memory/tasks.md

   **Memory log layout:** Each file uses `### MM-DD-YYYY` markdown headings with bullet lines underneath; newest date sections appear at the top. Full protocol lives in `.cursor/rules/memory-bank.mdc`.
   **`tasks.md` completions:** Pair each stable task ID with a **one-line outcome** so the log is readable without Cursor plans or private links; details and examples in `.cursor/rules/memory-bank.mdc` (§6, tasks.md section, session wrap-up).

2. Explicit user instructions

3. Project-specific rules (e.g., `.cursor/`, `.mdc`, repo docs)

4. This file (`CLAUDE.md`)

Do not silently resolve conflicts—call them out explicitly.

If memory conflicts with any rule in this file, memory ALWAYS wins.

---

## Codebase Exploration (TokenSave MCP)

Follow `.cursor/rules/tokensave.mdc`: prefer TokenSave MCP tools over broad file exploration in this repository.

- Start most tasks with `tokensave_context` for entry points, relevant symbols, and code snippets.
- Use `tokensave_search` to locate a symbol by name.
- Use call-graph/impact tools (`tokensave_callers`, `tokensave_callees`, `tokensave_impact`, etc.) before changes that may ripple.
- Avoid exploratory scans or reading many files directly unless TokenSave cannot answer.
- If a tool response includes `tokensave_metrics: before=N after=M`, mention the approximate savings.

The rule file is the source of truth; this section only ensures it is honored.

---

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State assumptions explicitly
- If uncertain, ask for clarification
- If multiple interpretations exist, present them
- If a simpler approach exists, propose it
- If something is unclear, stop and ask

Push back when:
- The request is overcomplicated
- There is a simpler or more correct approach
- Requirements are inconsistent or underspecified

---

## 2. Simplicity First

Write the minimum code required to solve the problem.

- No speculative features
- No unnecessary abstractions
- No premature optimization
- No unused flexibility
- No handling of impossible scenarios

Define "impossible scenarios" as:
- Not supported by system constraints
- Not part of the defined contract

If unsure → ask

Rule of thumb:
If 200 lines can be 50, rewrite it.

---

## 3. Surgical Changes

Touch only what is required.

- Do not modify unrelated code
- Do not refactor unless requested
- Match existing style
- Do not fix unrelated issues

If you notice issues:
- Report them separately
- Do not fix them unless instructed

---

## 4. Goal-Driven Execution

Define success criteria and verify outcomes.

Examples:
- Feature → tests for invalid inputs → implementation
- Bug → failing test → fix → verify
- Refactor → behavior unchanged

Testing rules:
- Use existing test structure
- If none exists: `src/__tests__`
- Only test realistic inputs

---

Execution plan format:
1. Step → verification
2. Step → verification
3. Step → verification

Do not proceed without verification when feasible.

---

## 5. Check Your Code

Always validate after completing work:

- `yarn run lint` → fix all issues
- `npx tsc --noEmit` → fix all type errors

If unavailable:
- explicitly state what cannot be validated

Do not consider work complete until:
- code compiles
- lint passes
- tests pass (if applicable)

---

## 6. Common Failure Modes

Avoid:
- unstated assumptions
- overengineering
- unrelated changes
- unnecessary abstractions
- skipping validation
- ignoring project conventions
- unclear success criteria

---

## 7. Output Expectations

- Be concise
- Prefer code over explanation
- Explain only non-obvious decisions
- Separate assumptions, plan, execution when needed

---

## Summary

- Think first
- Keep it minimal
- Change only what is required
- Define and verify success
- Validate before completion