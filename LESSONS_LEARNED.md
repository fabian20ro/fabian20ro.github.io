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

**[2026-05-12]** Locale tag normalization — When a UI accepts language codes from storage or browser APIs, normalize them defensively (trim, lowercase, and accept locale tags like `ro-RO` / `ro_RO`) so valid regional variants don't fall back to the wrong language.

<!-- Format: **[YYYY-MM-DD]** Brief title — Explanation -->

## Theming

<!-- Format: **[YYYY-MM-DD]** Brief title — Explanation -->

## CI / Tooling

**[2026-04-06]** Node.js Test Runner — Use the built-in Node.js test runner (`node --test`) for unit testing pure functions in a browser-targeted project. This avoids adding extra dependencies. For CommonJS, use guards for `module.exports` and `window` in the main script to enable test imports without breaking browser functionality.

## Common Mistakes

\*\*[2026-05-07] Clamp future relative times — Relative-time helpers should treat future-dated timestamps as "just now" (or the locale equivalent) instead of emitting negative minutes/hours. Browser clock skew and delayed event timestamps can otherwise produce confusing output.

---

## Performance

- **[2026-03-05]** Avoid repeated object instantiation — Move object literals out of frequently called functions (like `getEventIcon`) to prevent unnecessary allocations and improve performance by ~40% at scale.

---

## Archive

<!-- Format: **[YYYY-MM-DD] Archived [YYYY-MM-DD]** Title — Reason for archival -->
