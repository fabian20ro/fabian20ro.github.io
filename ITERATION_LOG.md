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
