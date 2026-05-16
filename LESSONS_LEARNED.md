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

**[2026-05-15]** Reuse the locale normalizer for browser defaults — The browser-language fallback should call the same normalization path as stored preferences so one code path handles trimming, regional tags, and future locale tweaks consistently.

**[2026-05-13]** Trim locale inputs before normalization — Locale values can arrive with surrounding whitespace from storage or UI plumbing. Trim before comparing, then lowercase and accept locale tags like `ro-RO` / `ro_RO` so valid regional variants don't fall back to the wrong language.

**[2026-05-12]** Locale tag normalization — When a UI accepts language codes from storage or browser APIs, normalize them defensively (trim, lowercase, and accept locale tags like `ro-RO` / `ro_RO`) so valid regional variants don't fall back to the wrong language.

**[2026-05-16]** Test localized chrome, not just normalization — When a locale toggle updates persistent UI chrome, regression tests should cover the page `lang` attribute, translated text, and ARIA labels/titles on always-visible controls.
**[2026-05-16]** Document locale-toggle chrome updates — When a language switch updates always-visible labels or ARIA affordances, mention those visible chrome updates in the README alongside `<html lang>` so the public docs match the tested surface.

<!-- Format: **[YYYY-MM-DD]** Brief title — Explanation -->

## Theming

<!-- Format: **[YYYY-MM-DD]** Brief title — Explanation -->

## CI / Tooling

**[2026-04-06]** Node.js Test Runner — Use the built-in Node.js test runner (`node --test`) for unit testing pure functions in a browser-targeted project. This avoids adding extra dependencies. For CommonJS, use guards for `module.exports` and `window` in the main script to enable test imports without breaking browser functionality.

## Common Mistakes

**[2026-05-15]** One-time refresh after a long gap — If the page stores a last-seen timestamp, trigger a single refresh when the gap exceeds the reopen threshold so cached UI can catch up without looping.

**[2026-05-13]** Directly test documented TTL boundaries — When the UI or docs promise a fixed freshness window, add a focused boundary test for the exact cutoff instead of relying only on indirect integration coverage.

**[2026-05-14]** Render visible states for empty fresh caches — If a fresh cache can legitimately contain zero items, render the cache anyway and show an explicit empty/error state. Skipping the render path can leave the UI stuck on a loading placeholder even though the cache was accepted.
**[2026-05-14]** Reject non-finite freshness timestamps — Cache freshness checks should guard against `NaN` and `Infinity` before doing age math. `Number.isFinite(...)` is the simplest way to keep malformed restored data from being treated as fresh.
**[2026-05-14]** Reject future-dated freshness timestamps — Cache freshness checks should treat timestamps in the future as stale. A future timestamp can happen after clock skew or malformed restored data, and it should not count as fresh content.
**[2026-05-14]** Preserve cached activity on refresh failure — If a stale cache already rendered successfully, a failed refresh should leave the cached content visible instead of swapping the feed back to an error state.

**[2026-05-07]** Clamp future relative times — Relative-time helpers should treat future-dated timestamps as "just now" (or the locale equivalent) instead of emitting negative minutes/hours. Browser clock skew and delayed event timestamps can otherwise produce confusing output.

---

## Performance

- **[2026-03-05]** Avoid repeated object instantiation — Move object literals out of frequently called functions (like `getEventIcon`) to prevent unnecessary allocations and improve performance by ~40% at scale.

---

## Archive

<!-- Format: **[YYYY-MM-DD] Archived [YYYY-MM-DD]** Title — Reason for archival -->
