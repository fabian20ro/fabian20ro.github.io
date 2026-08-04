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

### 2026-08-04 — Rename Propoziții Absurde repository link

**Context:** The disabled `propozitii-nostime` repository was replaced by `propozitii-absurde`, matching the existing portfolio title.
**What happened:** Updated the live card destination, workflow badge repository, and badge-to-Actions URL fixture.
**Outcome:** Success — lint and formatting passed; all 151 tests passed.
**Insight:** Repository migration still requires the portfolio URL and badge fixture to move together even when localized display copy already matches the new brand.
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

### 2026-05-13 — Lock activity-cache freshness contract

**Context:** Make the 10-minute GitHub activity cache TTL easier to verify directly.
**What happened:**

- Exported `isCacheFresh()` from `app.js` so the cache freshness boundary can be tested without reaching into internal module state.
- Added a focused Node test that covers a fresh cache entry, the exact 10-minute cutoff, and an expired entry.
- Ran `npm test` and `npm run check`; both passed.

**Outcome:** Success
**Insight:** When a user-facing TTL is documented, a tiny direct regression test is a cheap way to keep the contract honest.
**Promoted to Lessons Learned:** No

### 2026-05-14 — Render fresh empty activity caches

**Context:** Keep the portfolio's GitHub activity feed from hanging on the loading placeholder when a fresh cache exists but contains no events.
**What happened:**

- Changed `loadGitHubActivity()` so any parsed cache gets rendered, even when the cached event list is empty.
- Added a focused Node test that stubs the activity feed and confirms a fresh empty cache replaces the loading text with the visible error state instead of triggering a refetch.
- Expanded the `npm test` script to include the new test file and ran `npm test` plus `npm run check`.

**Outcome:** Success
**Insight:** Fresh empty caches still need a visible terminal state; otherwise the UI can look stuck even though the cache path short-circuited correctly.
**Promoted to Lessons Learned:** Yes

### 2026-05-14 — Harden activity cache freshness checks

**Context:** Make the GitHub activity cache helper safer when called with malformed timestamp data.
**What happened:**

- Updated `isCacheFresh()` in `app.js` to reject non-finite timestamps before comparing ages.
- Added direct tests for `NaN` and `Infinity` timestamps in `tests/getRelativeTime.test.js`.
- Ran `npm test` and `npm run check`; both passed.

**Outcome:** Success
**Insight:** Freshness helpers should validate timestamps as numbers before doing arithmetic, otherwise malformed cache data can look valid by accident.
**Promoted to Lessons Learned:** Yes

### 2026-05-14 — Preserve cached activity on refresh failure

**Context:** Keep the README aligned with the activity-feed cache behavior when refreshes fail.
**What happened:**

- Updated the README feature summary to mention that the GitHub activity feed keeps the last rendered content visible if a refresh fails.
- Re-ran `npm test` and `npm run check`; both passed.

**Outcome:** Success
**Insight:** User-facing cache behavior is worth documenting when it affects what the visitor sees after a network failure.
**Promoted to Lessons Learned:** Yes

### 2026-05-14 — Reject future-dated cache timestamps

**Context:** Tighten the GitHub activity cache helper so future timestamps do not count as fresh.
**What happened:**

- Updated `isCacheFresh()` in `app.js` to reject timestamps that are ahead of `Date.now()`.
- Added a regression test for a future-dated cache timestamp in `tests/getRelativeTime.test.js`.
- Added a reusable lesson about treating future timestamps as stale.
- Ran the focused test suite and project checks after the change.

**Outcome:** Success
**Insight:** Freshness logic should reject both malformed and future timestamps; otherwise clock skew or restored data can make stale cache look valid.
**Promoted to Lessons Learned:** Yes

### 2026-05-15 — Reuse locale normalizer for browser defaults

**Context:** Keep the browser-language fallback aligned with the existing locale normalizer.
**What happened:**

- Updated `getDefaultLang()` in `app.js` so it reuses `normalizeLang(browserLang)` instead of duplicating the Romanian detection logic.
- Exported `getDefaultLang()` for direct regression coverage.
- Added a focused Node test that stubs `navigator.language` and verifies trimmed Romanian tags default to `ro` while English and missing values still fall back to `en`.
- Ran `npm test` and `npm run check`; both passed.

**Outcome:** Success
**Insight:** Browser defaults and stored preferences should share the same normalization path so locale handling stays consistent when the accepted tag set changes.
**Promoted to Lessons Learned:** Yes

### 2026-05-15 — Document lazy-loaded activity feed

**Context:** Keep the README aligned with the portfolio's current activity-feed behavior.
**What happened:**

- Updated the feature summary in `README.md` to mention that the GitHub activity feed lazy-loads when it scrolls into view, alongside the existing cache/refresh behavior.
- Kept the change docs-only; no runtime code or tests needed.

**Outcome:** Success
**Insight:** User-facing performance affordances are worth documenting when they affect how the page behaves on first render.
**Promoted to Lessons Learned:** No

### 2026-05-15 — Document long-gap activity refresh

**Context:** Keep the portfolio README aligned with the reopen-refresh behavior around the GitHub activity feed.
**What happened:**

- Updated the README feature summary to mention that the activity feed lazy-loads on intersection, refreshes once after a long away period, and still preserves the cached feed on refresh failure.
- Added a reusable lesson for the one-time reopen refresh guard.

**Outcome:** Success
**Insight:** User-facing cache behavior includes both TTLs and reopen thresholds; the docs should mention both when they affect what visitors see after returning to the page.
**Promoted to Lessons Learned:** Yes

### 2026-05-16 — Cover localized UI chrome updates

**Context:** Add regression coverage for the language toggle updating page chrome and persistent card affordances.
**What happened:**

- Added a Node test that proves `setLang('ro')` updates `document.documentElement.lang`, translated text nodes, card-link `aria-label`/`title`, and the language/theme toggle labels.
- Ran `npm test` and `npx prettier --check tests/getRelativeTime.test.js`; both passed after formatting the test file.

**Outcome:** Success
**Insight:** Locale switches should be tested against visible chrome and ARIA labels, not only normalization helpers.
**Promoted to Lessons Learned:** Yes

### 2026-05-16 — Sync README with localized chrome behavior

**Context:** Keep the portfolio README aligned with the language toggle's visible chrome updates.
**What happened:**

- Updated the README feature summary to mention that the locale toggle also refreshes visible labels and ARIA affordances in both languages.
- No runtime code changed; this was a docs-only sync.

**Outcome:** Success
**Insight:** Docs should name user-visible chrome updates when a toggle changes more than the `<html lang>` attribute.
**Promoted to Lessons Learned:** No

### 2026-05-17 — Harden badge URL helper inputs

**Context:** Make the exported badge-actions URL helper safer for malformed project metadata.
**What happened:**

- Added a string-type guard to `getBadgeActionsUrl()` so nullish or non-string values do not throw.
- Added regression assertions for `null` and `undefined` inputs.
- Verified the touched files with unit, lint, and focused formatting checks.

**Outcome:** Success
**Insight:** Exported helpers that process optional project metadata should fail closed instead of throwing when callers pass absent values.
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

### 2026-05-13 — Sync README locale copy with normalization behavior

**Context:** Keep the portfolio README aligned with the current locale-normalization contract.
**What happened:**

- Updated the feature summary and localization section in `README.md` to mention whitespace-trimmed locale values alongside the existing `ro-RO` and `ro_RO` examples.
- Ran `npm run check` to verify linting, formatting, and tests still pass after the docs-only change.

**Outcome:** Success
**Insight:** Small README updates are useful when they mirror already-tested behavior, especially for normalization rules that callers may not guess correctly.
**Promoted to Lessons Learned:** No

### 2026-05-16 — Add link verification utility

**Context:** Ensure all project and repository links in the portfolio remain active.
**What happened:**

- Created \`scripts/verify-links.mjs\` which parses \`app.js\` for URLs and checks them via HTTP HEAD requests.
- Verified that 13 critical links (live sites and GitHub repos) are healthy.
- Ran full project check (\`npm run check\`) to confirm no regressions in linting, formatting, or unit tests.
  **Outcome:** Success
  **Insight:** Automated link verification prevents the portfolio from becoming stale with broken references.
  **Promoted to Lessons Learned:** No

### 2026-05-19 — Clear compound gate quality failure

**Context:** `make gate` blocked on this repo because the PR `quality` job failed during `format:check`.
**What happened:**

- Confirmed the failed CI log pointed at `ITERATION_LOG.md` Prettier formatting.
- Verified the local branch already contained the formatting fix and passed `npm run check`.
- Pushed the branch so GitHub could rerun the PR checks.

**Outcome:** Success
**Insight:** No new reusable lesson; this was a stale remote branch missing an already-local formatting fix.
**Promoted to Lessons Learned:** No

### 2026-05-24 — Restore compound branch quality checks

**Context:** Replacement PR #42 failed its `quality` job after reopening the compound branch against current `main`.
**What happened:**

- Confirmed the failing CI log pointed to Prettier formatting in `app.js`.
- Ran `npx prettier --write app.js`.
- Verified locally with `npm run check`.

**Outcome:** Success
**Insight:** No new reusable lesson; branch drift left the code valid but not formatted for current CI.
**Promoted to Lessons Learned:** No

### May 22 Iteration

- Implemented Thank You multilingual phrase rotation feature
- Added 10 common languages with translations and phonetic representations
- Display randomly updates every 15 seconds ensuring even distribution using Fisher-Yates array shuffle.
- Safely handled DOM update routines inside node environment bypassing `document is not defined` errors.
- Handled text replacement dynamically in `app.js` instead of defining a static HTML block so that the label (e.g. Spanish vs Spaniolă) updates immediately during language toggle.

### May 23 Iteration - Multilingual Thank You Update

- Added 40 new languages to the `THANK_YOU_LANGUAGES` array, bringing the total to 50.
- Included all major European languages and common global languages (e.g., Mandarin, Hindi, Arabic) to reach 50.
- Updated `renderThankYouMessage` to create 3 distinct lines using HTML elements instead of a single string.
- Styled the language name and flags to be bold on the first line.
- Styled the phonetic pronunciations to be italicized on lines 2 and 3.
- Refactored `.thank-you-message` CSS to use Flexbox (`display: flex`, `flex-direction: column`, `align-items: center`) to properly structure and align the 3 lines cleanly on both mobile and desktop.

- 2026-05-25: Renamed header language button id in index.html from `lang-template` to `lang-toggle` so it matches `app.js` selectors in `init()` and `setLang()`. Verified no remaining `lang-template` references via ripgrep.

### 2026-05-25 — Language toggle shows target arrow+flag affordance

**Context:** Update the EN/RO language switcher so it clearly shows the target language as arrow + flag, per UX request.
**What happened:**

- Updated `setLang()` to render the language toggle as `➡️ 🇷🇴` when current language is English, and `➡️ 🇬🇧` when current language is Romanian.
- Added explicit localized action labels for accessibility: `switchToRomanian` / `switchToEnglish` in both EN and RO translations, and wired them to the toggle `aria-label` and `title`.
- Updated the localization regression test to validate the new toggle text and ARIA/title behavior.
- Ran `npm test` and `npm run check` successfully.

**Outcome:** Success
**Insight:** For language switchers, showing the destination language (not current state) reduces ambiguity and makes the control feel responsive.
**Promoted to Lessons Learned:** No

### 2026-06-06 — Expand thank-you exercise with phonetic dedup

**Context:** Refocus the multilingual thank-you rotation so each entry teaches a distinct spoken thank-you cue for choosing the correct "you're welcome" response.
**What happened:**

- Removed current exact phonetic duplicates from `THANK_YOU_LANGUAGES`, including repeated `Obrigado`, `Takk`, and `Hvala` groups.
- Added a broad global candidate set through Latin, keeping distinct normalized `thankYouPhonetic` values.
- Verified the final list has 157 entries and zero duplicate normalized thank-you phonetic keys.
- Ran `node --check app.js` and `npm run format:check`; `npm run lint` could not run because local `eslint` was not installed.

**Outcome:** Success
**Insight:** For this exercise, the dedup key should be the opponent's spoken thank-you cue, not the written language label or script.
**Promoted to Lessons Learned:** Yes

### 2026-06-06 — Split thank-you language data from app logic

**Context:** Keep the expanded thank-you phrase list without making `app.js` carry the full data payload.
**What happened:**

- Moved the expanded `THANK_YOU_LANGUAGES` data into `thank-you-languages.js`.
- Added a small guarded loader in `app.js` so browsers read `window.THANK_YOU_LANGUAGES` and Node/CommonJS reads the data file directly.
- Updated `index.html` to load `thank-you-languages.js` before `app.js`, and bumped the script cache keys.
- Verified both JS files parse and the data file still has 157 entries with zero duplicate normalized thank-you phonetic keys.

**Outcome:** Success
**Insight:** Large static browser data can live in a separate UMD-style script while preserving the existing non-module app and CommonJS test import pattern.
**Promoted to Lessons Learned:** Yes

### 2026-07-21 — Repair project card actions

**Context:** Make the project-card arrow functional, place it beside copy at the right edge, and replace the platform clipboard emoji with a theme-consistent two-rectangle glyph.
**What happened:**

- Converted the arrow from a decorative span into a native link and grouped it with the copy button.
- Isolated link/button click and keyboard events from whole-card navigation.
- Added 44px themed action targets, a CSS two-rectangle copy glyph, and non-shifting accessible copy feedback.
- Added focused regression tests for structure, URLs, icon markup, clipboard behavior, and propagation.
- Verified arrow navigation, copy feedback, 393px/570px mobile layouts, and light/dark themes in Playwright.
- Confirmed lint and formatting pass. The focused tests pass; the full suite retains an unrelated existing `app_edge_cases.test.js` failure where an ineffective cache mock reaches DOM-only error rendering.

**Outcome:** Success
**Insight:** Nested controls inside a keyboard-activated card must stop keydown propagation as well as click propagation.
**Promoted to Lessons Learned:** Yes

### 2026-07-23 — Remove invalid duplicate activity-cache test

**Context:** CI failed after an edge-case test tried to replace an exported CommonJS function.
**What happened:** Removed the duplicate test. The focused activity-cache suite already covers malformed JSON, missing events, non-array events, and invalid timestamps through the public `loadGitHubActivity` behavior.
**Outcome:** Success
**Insight:** Replacing an exported CommonJS property does not replace a same-module lexical binding; test public behavior with environment fixtures instead.
**Promoted to Lessons Learned:** Yes

### 2026-08-03 — Update Emot-ID project destination

**Context:** The Emot-ID repository and GitHub Pages path moved from `emot-id` to `emotid`.
**What happened:**

- Updated the live project card to `https://fabian20ro.github.io/emotid/`.
- Updated its deployment badge to the `fabian20ro/emotid` GitHub Actions workflow.
- Kept generic URL-parser fixtures unchanged because they test URL shapes, not current project metadata.
- Ran `npm run check`; lint, formatting, and all 151 tests pass.

**Outcome:** Success
**Insight:** Project migrations require updating both the visible destination and its linked deployment-status source.
**Promoted to Lessons Learned:** No

### 2026-08-03 — Update Alt InfoTB project destination

**Context:** The disabled `alt-stb` repository was recovered into the fresh `alt-infotb` repository and its GitHub Pages path changed.
**What happened:** Updated the project card destination and deployment badge to `alt-infotb`, changed the displayed project title to the new Alt InfoTB brand in every supported locale, and updated the corresponding live-project URL fixtures.
**Outcome:** Success — the portfolio points to the verified Alt InfoTB Pages deployment.
**Insight:** A project rename affects the external card's destination, badge source, displayed brand, and live-project test fixtures together.
**Promoted to Lessons Learned:** No

### 2026-08-03 — Update Random Passwords project destination

**Context:** The disabled `password-generator` repository was recovered into the fresh `random-passwords` repository and its GitHub Pages path changed.
**What happened:** Updated the project card destination and deployment badge to `random-passwords`, changed the displayed title to the new Random Passwords brand in every supported locale, and updated the corresponding badge URL fixture.
**Outcome:** Success — the portfolio now targets the replacement repository and Pages path.
**Insight:** Repository migrations require the card destination, status badge, localized brand, and URL fixture to move together.
**Promoted to Lessons Learned:** No

### 2026-08-04 — Add The Goldilocks Engine

**Context:** The disabled `goldlocks-engine` repository was recovered under its intended `goldilocks-engine` name and had no portfolio entry.
**What happened:** Added a live-project card with the corrected Pages destination, deployment badge, unique icon, and localized description across all seven supported languages; added a focused badge URL fixture.
**Outcome:** Success — lint, formatting, and all 151 tests passed; deployment verification continues after push.
**Insight:** A newly indexed migrated project needs the same destination, status, localization, and fixture coverage as an existing renamed card.
**Promoted to Lessons Learned:** No

### 2026-08-04 — Update Book Finder project destination

**Context:** The disabled `find-the-book` repository was recovered into the fresh `book-finder` repository and its GitHub Pages path changed.
**What happened:** Updated the project card destination and deployment badge to `book-finder`, changed the displayed title to the Book Finder brand in every supported locale, and updated the corresponding badge URL fixture.
**Outcome:** Success — the portfolio now targets the replacement repository and Pages path.
**Insight:** Repository migrations require the card destination, status badge, localized brand, and URL fixture to move together.
**Promoted to Lessons Learned:** No

### 2026-08-04 — Update Browser Zodiac project destination

**Context:** The disabled `horror-scope` repository was recovered into the fresh `browser-zodiac` repository and its GitHub Pages path changed.
**What happened:** Updated the project card destination and deployment badge to `browser-zodiac`, changed the displayed title to the Browser Zodiac brand in every supported locale, and updated the corresponding badge URL fixture.
**Outcome:** Success — the portfolio now targets the replacement repository and Pages path.
**Insight:** Repository migrations require the card destination, status badge, localized brand, and URL fixture to move together.
**Promoted to Lessons Learned:** No

### 2026-08-04 — Update Booking Exclusion Filter project destination

**Context:** The disabled `booking-filter-out` repository was recovered into the fresh `booking-exclusion-filter` repository and its GitHub Pages path changed.
**What happened:** Updated the repository card, Pages destination, deployment badge, and focused badge fixture; changed the displayed title to Booking Exclusion Filter and corrected the product description in all seven supported locales.
**Outcome:** Success — the portfolio now targets the replacement repository and Pages path.
**Insight:** A repository migration is also a chance to replace stale portfolio copy with a precise description of the current product behavior.
**Promoted to Lessons Learned:** No

### 2026-08-04 — Curate visible project lists

**Context:** Harness Manager is no longer maintained or relevant to the public portfolio, and Goldilocks Engine should close the live-project list.
**What happened:** Removed the Harness Manager repository card and its now-unused translation keys, then moved Goldilocks Engine after Rebus Generator as the final live project.
**Outcome:** Success — the portfolio reflects the current maintained-project priorities.
**Insight:** Retired project cards should be removed together with metadata that becomes unreachable from the project lists.
**Promoted to Lessons Learned:** No
