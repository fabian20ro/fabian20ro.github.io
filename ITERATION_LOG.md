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

<!-- New entries above this line, most recent first -->

### 2026-04-06

- Added the `harness-manager` project to `app.js` under the `liveProjects` list.
- Generated new EN and RO descriptions as requested, adhering to the Linguist sub-agent guidelines.
- Selected "🪢" as an appropriate emoji icon suggesting "harness".
- Extracted and added the GitHub Action badge `Deploy Pages` which correctly verified on the live API.
- Verified changes using headless Playwright script to render a screenshot.
