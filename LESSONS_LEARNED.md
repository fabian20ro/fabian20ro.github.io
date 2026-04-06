# Lessons Learned

> Maintained by AI agents. Contains validated, reusable insights.
> **Read at the start of every task. Update at the end of every iteration.**

## How to Use This File

### Reading (Start of Every Task)

Read this before writing any code to avoid repeating known mistakes.

### Writing (End of Every Iteration)

If a new reusable insight was gained, add it to the appropriate category.

### Promotion from Iteration Log

Patterns appearing 2+ times in `ITERATION_LOG.md` should be promoted here.

### Pruning

Obsolete lessons move to the Archive section at bottom (with date and reason). Never delete.

---

## Code Style

<!-- Format: **[YYYY-MM-DD]** Brief title — Explanation -->

## Architecture

<!-- Format: **[YYYY-MM-DD]** Brief title — Explanation -->

## Accessibility

<!-- Format: **[YYYY-MM-DD]** Brief title — Explanation -->

## Localization

<!-- Format: **[YYYY-MM-DD]** Brief title — Explanation -->

## Theming

<!-- Format: **[YYYY-MM-DD]** Brief title — Explanation -->

## CI / Tooling

**[2026-04-06]** Node.js Test Runner — Use the built-in Node.js test runner (`node --test`) for unit testing pure functions in a browser-targeted project. This avoids adding extra dependencies. For CommonJS, use guards for `module.exports` and `window` in the main script to enable test imports without breaking browser functionality.

## Common Mistakes

<!-- Format: **[YYYY-MM-DD]** Brief title — Explanation -->

---

## Archive

<!-- Format: **[YYYY-MM-DD] Archived [YYYY-MM-DD]** Title — Reason for archival -->
