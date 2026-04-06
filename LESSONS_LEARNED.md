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

<!-- Format: **[YYYY-MM-DD]** Brief title — Explanation -->

## Common Mistakes

<!-- Format: **[YYYY-MM-DD]** Brief title — Explanation -->

---

## Performance

- **[2026-03-05]** Avoid repeated object instantiation — Move object literals out of frequently called functions (like `getEventIcon`) to prevent unnecessary allocations and improve performance by ~40% at scale.

---

## Archive

<!-- Format: **[YYYY-MM-DD] Archived [YYYY-MM-DD]** Title — Reason for archival -->
