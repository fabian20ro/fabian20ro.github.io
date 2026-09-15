# Fabian's Projects

**Live site:** <https://fabian20ro.github.io>

Static portfolio page for live demos, repositories, and recent GitHub activity.

## Features

- Light/dark theme with persisted preference and system-default fallback.
- English/Romanian localization with dynamic `<html lang>` updates and normalized locale tags, including whitespace-trimmed values.
- The language toggle also updates visible chrome and ARIA labels in both languages.
- GitHub activity lazy-loads when scrolled into view. A 10-minute cache TTL controls refreshes on every visible-tab return, page restore, and a one-minute visible tick; hidden tabs do not poll. Overlapping triggers share one request. No forced page reload.
- Relative times repaint without replacing focused controls. The styled, localized “Last updated” footer records the last successful fetch, persists through language changes, and never advances on failure.
- Failed requests retain cached activity with a localized warning/retry; successful empty responses are distinct from errors. Requests abort after 15 seconds. Automatic failures retry no more than once per minute; manual retry remains available except while pending or during GitHub's rate-limit window.
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

The project supports English (EN), Romanian (RO), Spanish (ES), German (DE), Italian (IT), and Portuguese (PT).
Locale tags are normalized defensively, so values like `ro-RO`, `ro_RO`, or whitespace-padded variants still resolve to Romanian.
Translations are managed within `app.js`. To add a new language:

1. Add the language key to the `translations` object in `app.js`.
2. Update the `normalizeLang` and `getDefaultLang` functions if necessary.

## Monitoring Plan

See `docs/sentry-rollout-plan.md` for a safe-by-default rollout plan for Sentry statistics.
