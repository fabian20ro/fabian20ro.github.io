### 2026-04-06 — Performance Optimization of getEventIcon

**Context:** Optimize the `getEventIcon` function in `app.js` by moving the `icons` object outside the function to prevent repeated instantiation.
**What happened:**

- Created a benchmark script to measure the performance impact.
- Baseline benchmark showed a ~42% improvement (from ~600ms to ~350ms for 10M iterations).
- Moved the `icons` object out of the function and renamed it to `EVENT_ICONS` constant at the top of the file.
- Verified functionality and performance after implementation.
- Final benchmark confirmed the optimization remains effective.
- Ran `npm run check` to ensure code quality.

**Outcome:** Success
**Insight:** Moving object literals outside frequently called functions is a simple but effective optimization in JavaScript to avoid unnecessary memory allocations and CPU cycles.
**Promoted to Lessons Learned:** Yes

# Iteration Log

> Append-only journal of AI agent work sessions.
> **Add an entry at the end of every iteration.**
> Same issue 2+ times? Promote to `LESSONS_LEARNED.md`.

## Entry Format

```
### YYYY-MM-DD — Brief Description

**Context:** What was the goal
**What happened:** Key actions, decisions
**Outcome:** Success / partial / failure
**Insight:** (optional) What would you tell the next agent?
**Promoted to Lessons Learned:** Yes / No
```

### 2026-03-03 — Add Horror-Scope to live projects

**Context:** Add the horror-scope app (humorous horoscope generator via browser fingerprinting) to the portfolio's live projects list, positioned before Image Prompt Expander.
**What happened:**

- Fetched the horror-scope GitHub repo README to understand the app: browser fingerprinting determines zodiac sign, context-free grammar generates absurd daily predictions, bilingual EN/RO, PWA, zero dependencies.
- Used Plan agent to draft three bilingual description options following Linguist agent guidelines. User chose Option A (deadpan privacy joke).
- Added new entry to `projectSections.liveProjects` with 🔮 icon, pointing to `https://fabian20ro.github.io/horror-scope/`.
- Added `horrorScopeTitle` and `horrorScopeDesc` translation keys to both `translations.en` and `translations.ro`.

**Outcome:** Success
**Insight:** Planner + Linguist agent pattern continues to work well (third occurrence). WebFetch on raw GitHub URLs remains the way to read external READMEs.
**Promoted to Lessons Learned:** No

### 2026-03-01 — Add Find The Book to live projects

**Context:** Add the find-the-book PWA (book identification via camera OCR) to the portfolio's live projects list. Move Image Prompt Expander to end of list.
**What happened:**

- Read the find-the-book GitHub repo README to understand capabilities: camera-based book identification using Tesseract.js OCR and Google Books API, runs entirely client-side.
- Invoked the Linguist agent to produce bilingual EN/RO descriptions following the established tone and style.
- Added new entry to `projectSections.liveProjects` with 📚 icon, pointing to `https://fabian20ro.github.io/find-the-book/`.
- Moved Image Prompt Expander from position 3 to position 7 (end of list).
- Added `findBookTitle` and `findBookDesc` translation keys to both `translations.en` and `translations.ro`.

**Outcome:** Success
**Insight:** The Planner and Linguist agents from `.claude/agents/` work well in sequence — plan first, then get copy, then implement.
**Promoted to Lessons Learned:** No (first occurrence)

### 2026-02-24 — Rename ArticleVoice to Article Reader, improve descriptions, create Linguist agent

**Context:** Rename the pixel-article-reader project entry from "ArticleVoice" to "Article Reader" in the portfolio. Improve the EN and RO descriptions based on the project's actual capabilities. Create a Linguist sub-agent for future copy tasks.
**What happened:**

- Read the pixel-article-reader README to understand strengths: content extraction via Readability, markdown rendering, on-device TTS with playback controls (speed, paragraph skip), offline PWA support, share-target integration.
- Created `.claude/agents/linguist.md` — a bilingual copy specialist for EN/RO project descriptions. Registered it in AGENTS.md.
- Renamed `articleVoiceTitle` from "ArticleVoice" to "Article Reader" in both EN and RO translations.
- Rewrote `articleVoiceDesc` in both languages. New descriptions highlight the three things a user can do (paste URL, read clean version, listen) and key features (markdown rendering, on-device TTS, speed control, paragraph skip, offline support).
- Ran `npm run check` — ESLint and Prettier both pass.

**Outcome:** Success
**Insight:** The `gh` CLI is not available in this environment. Use `WebFetch` on raw GitHub URLs to read READMEs from other repos.
**Promoted to Lessons Learned:** No (first occurrence)

### 2026-04-06 — Implement testing infrastructure and `getRelativeTime` tests

**Context:** Analysis and implementation of a testing improvement to increase reliability and coverage.
**What happened:**

- Refactored `app.js` to support CommonJS exports when running in Node.js by adding guards for `window`, `module`, and `module.exports`.
- Set up a testing environment using the built-in Node.js test runner (`node --test`).
- Added a `test` script and updated the `check` script in `package.json`.
- Implemented comprehensive tests for the `getRelativeTime` function in `tests/getRelativeTime.test.js`, covering multiple time intervals and both English and Romanian languages.
- Fixed CI failure by explicitly specifying the test file path in `package.json` instead of using a glob pattern, to ensure compatibility across different environments.
- Updated `AGENTS.md` to reflect the availability of a test framework.

**Outcome:** Success
**Insight:** Modern Node.js versions (v18+) include a built-in test runner that is sufficient for unit testing pure functions in a browser-targeted codebase without adding heavy dependencies like Jest or Mocha.
**Promoted to Lessons Learned:** No

### 2026-05-07 — Clamp future-dated activity timestamps

**Context:** Make the relative-time helper more forgiving when an event timestamp is a few minutes in the future.
**What happened:**

- Updated `getRelativeTime()` in `app.js` to clamp future-dated timestamps to the locale's "just now" string instead of producing negative relative times.
- Added English and Romanian test cases for future timestamps in `tests/getRelativeTime.test.js`.
- Ran `npm test` and `npm run check`; the first `npm run check` failed because the environment initially picked up a global ESLint 6.4.0 without the repo's flat config, so I ran `npm install --no-fund --no-audit` and re-ran the check successfully.

**Outcome:** Success
**Insight:** Relative-time helpers should defensively handle clock skew / future timestamps; the user-facing fallback is usually clearer than exposing a negative duration.
**Promoted to Lessons Learned:** Yes

### 2026-05-11 — Tighten relative-time boundary coverage

**Context:** Add regression coverage for the `getRelativeTime()` helper around minute and hour thresholds.
**What happened:**

- Added English and Romanian test cases for 59-second, 59-minute-59-second, and 23-hour-59-minute boundary inputs.
- Kept the change test-only; no runtime code needed to change.
- Ran `npm test` to verify the suite still passes.

**Outcome:** Success
**Insight:** Boundary coverage around floor-based time formatting is cheap insurance against off-by-one regressions.
**Promoted to Lessons Learned:** No

### 2026-05-11 — Add repo URL helper coverage

**Context:** Increase regression coverage for internal repo-name parsing and GitHub profile URL fallback helpers.
**What happened:**

- Exported `parseRepoName` and `buildRepoUrl` from `app.js` so they can be tested directly.
- Added a focused test block covering valid repo-name parsing, valid URL generation, and fallback behavior for malformed repo names.
- Ran `npm test` and `npm run check`; both passed.

**Outcome:** Success
**Insight:** Small helper exports can make internal contract coverage cheaper without changing browser behavior.
**Promoted to Lessons Learned:** No

### 2026-05-12 — Cover badge actions URL helper

**Context:** Add regression coverage for the helper that turns GitHub badge URLs into their corresponding Actions pages.
**What happened:**

- Exported `getBadgeActionsUrl()` from `app.js` so the helper can be tested directly.
- Added a focused Node test that verifies the GitHub badge URL rewrite and the non-GitHub fallback path.
- Ran `npm test`, `npm run lint`, and `npm run check`; all passed.

**Outcome:** Success
**Insight:** Small helper exports can make internal contract coverage cheap without changing browser behavior.
**Promoted to Lessons Learned:** No

### 2026-05-12 — Broaden locale normalization for Romanian

**Context:** Make the portfolio language selector more forgiving when callers provide locale-style Romanian tags instead of only the bare `ro` code.
**What happened:**

- Updated `normalizeLang()` in `app.js` to trim and lowercase incoming values, then map `ro`, `ro-RO`, and `ro_RO` to Romanian while keeping unrelated strings on English.
- Exported `normalizeLang()` so it can be tested directly.
- Added focused Node tests covering uppercase Romanian input, locale-tag variants, unrelated strings, and non-string values.
- Ran `npm test` and `npm run check`; both passed after formatting `app.js` with Prettier.

**Outcome:** Success
**Insight:** When a language toggle accepts data from multiple sources, treat locale tags as a first-class input rather than assuming a bare two-letter code.
**Promoted to Lessons Learned:** Yes

### 2026-05-12 — Document locale-tag normalization

**Context:** Keep the portfolio README aligned with the current language normalization behavior.
**What happened:**

- Updated `README.md` to note that the English/Romanian localization flow normalizes locale tags like `ro-RO` and `ro_RO`.
- Ran `npm run check` to verify the repo stayed clean after the docs change.

**Outcome:** Success
**Insight:** Small doc updates are useful when they surface already-shipped behavior that users can rely on.
**Promoted to Lessons Learned:** No

<!-- New entries above this line, most recent first -->

### 2026-04-06

- Added the `harness-manager` project to `app.js` under the `liveProjects` list.
- Generated new EN and RO descriptions as requested, adhering to the Linguist sub-agent guidelines.
- Selected "🪢" as an appropriate emoji icon suggesting "harness".
- Extracted and added the GitHub Action badge `Deploy Pages` which correctly verified on the live API.
- Verified changes using headless Playwright script to render a screenshot.

### 2026-05-13 — Lock in trimmed locale normalization

**Context:** Add regression coverage for locale normalization when stored or UI-provided values include surrounding whitespace.
**What happened:**

- Expanded the `normalizeLang` test block to cover whitespace-padded Romanian locale tags and whitespace-padded non-Romanian strings.
- Added a reusable lesson about trimming locale inputs before normalization.
- Ran `npm test` and `npm run check`; both passed.

**Outcome:** Success
**Insight:** Locale normalization should trim first, then lowercase and compare against accepted tags.
**Promoted to Lessons Learned:** Yes
