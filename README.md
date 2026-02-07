# Fabian's Projects

Static portfolio page for live demos, repositories, and recent GitHub activity.

## Features

- Light/dark theme with persisted preference and system-default fallback.
- English/Romanian localization with dynamic `<html lang>` updates.
- GitHub activity feed with local cache (10-minute TTL) to reduce API calls.
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
- Run all checks: `npm run check`
- Format files: `npm run format`

CI runs the same checks on push and pull requests.

## Monitoring Plan

See `docs/sentry-rollout-plan.md` for a safe-by-default rollout plan for Sentry statistics.
