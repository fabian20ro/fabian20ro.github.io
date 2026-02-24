# AGENTS.md

> This file provides non-discoverable bootstrap context.
> If the model can find it in the codebase, it does not belong here.
> For corrections and patterns, see LESSONS_LEARNED.md.

## Constraints

- **No test framework:** There is no test runner or `npm test` script. Do not assume tests exist or try to run them.
- **Sentry planned, not implemented:** `docs/sentry-rollout-plan.md` describes a future Sentry integration. The SDK is NOT yet in the project. Do not add Sentry code unless explicitly asked.
- **SECURITY.md is a placeholder:** The version table in SECURITY.md is GitHub-generated boilerplate. It does not reflect actual project versions.
- **Remote default branch is `main`:** Pull requests target `origin/main`. The local branch may be named `master`.

## Legacy & Deprecated

Nothing deprecated at this time.

## Learning System

This project uses a persistent learning system. Follow this workflow every session:

1. **Start of task:** Read `LESSONS_LEARNED.md` — it contains validated corrections and patterns
2. **During work:** Note any surprises or non-obvious discoveries
3. **End of iteration:** Append to `ITERATION_LOG.md` with what happened
4. **If insight is reusable and validated:** Also add to `LESSONS_LEARNED.md`
5. **If same issue appears 2+ times in log:** Promote to `LESSONS_LEARNED.md`
6. **If something surprised you:** Flag it to the developer

| File                 | Purpose                           | When to Write            |
| -------------------- | --------------------------------- | ------------------------ |
| `LESSONS_LEARNED.md` | Curated, validated wisdom         | When insight is reusable |
| `ITERATION_LOG.md`   | Raw session journal (append-only) | Every iteration (always) |

Rules: Never delete from ITERATION_LOG. Obsolete lessons go to the Archive section in LESSONS_LEARNED (not deleted). Date-stamp everything YYYY-MM-DD.

### Periodic Maintenance

This project's config files are audited periodically using `SETUP_AI_AGENT_CONFIG.md`.
The maintenance protocol ensures all files stay lean and current.

## Sub-Agents

Specialized agents in `.claude/agents/`. Invoke proactively — don't wait to be asked.

| Agent         | File                              | Invoke When                                              |
| ------------- | --------------------------------- | -------------------------------------------------------- |
| Architect     | `.claude/agents/architect.md`     | System design, scalability, refactoring decisions        |
| Planner       | `.claude/agents/planner.md`       | Complex multi-step features — plan before coding         |
| UX Expert     | `.claude/agents/ux-expert.md`     | UI components, interaction patterns, accessibility       |
| Agent Creator | `.claude/agents/agent-creator.md` | Need a new specialized agent for a recurring task domain |
