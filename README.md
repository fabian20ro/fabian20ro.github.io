# Fabian's Projects

**Live site:** <https://fabian20ro.github.io>

Static portfolio page for live demos, repositories, and recent GitHub activity.

## Features

- Light/dark theme with persisted preference and system-default fallback.
- English/Romanian localization with dynamic `<html lang>` updates and normalized locale tags, including whitespace-trimmed values.
- The language toggle also updates visible chrome and ARIA labels in both languages.
- GitHub activity feed lazy-loads when it scrolls into view, refreshes once after a long away period so stale tabs catch up, and uses a local cache (10-minute TTL) to reduce API calls and keep the last rendered feed visible if refresh fails.
- DOM-based activity rendering (no raw `innerHTML` from API data).
- Keyboard-accessible controls with visible focus states.

## Project Structure

- `index.html`: HTML shell and SEO metadata.
- `styles.css`: layout, theming, and responsive styles.
- `app.js`: localization, theme controls, project card rendering, and activity feed logic.

## Development

1. Serve locally (example):
   - `python3 -m http.server 8080`
2. Open `http://localhost:8080`.

## Quality Checks

- Install dependencies: `npm install`
- Run all checks (lint, format, test): `npm run check`
- Run tests: `npm test`
- Format files: `npm run format`

CI runs the same checks on push and pull requests.

## Localization

The project supports English (EN) and Romanian (RO).
Locale tags are normalized defensively, so values like `ro-RO`, `ro_RO`, or whitespace-padded variants still resolve to Romanian.
Translations are managed within `app.js`. To add a new language:

1. Add the language key to the `translations` object in `app.js`.
2. Update the `normalizeLang` and `getDefaultLang` functions if necessary.

## Monitoring Plan

See `docs/sentry-rollout-plan.md` for a safe-by-default rollout plan for Sentry statistics.
