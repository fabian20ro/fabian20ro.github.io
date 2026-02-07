# Sentry Statistics Rollout Plan (Safe-by-Default)

## Goal

Track frontend reliability and usage trends while minimizing privacy risk and avoiding sensitive data collection.

## Scope

- In scope: page performance metrics, JS runtime errors, and high-level navigation events.
- Out of scope: user-entered content, query strings with potential identifiers, and full request/response payloads.

## Rollout Steps

1. Create a dedicated Sentry project for this site and keep DSN in deploy-time config.
2. Add Sentry SDK with strict defaults:
   - `sendDefaultPii: false`
   - `maxBreadcrumbs: 20`
   - `attachStacktrace: true`
   - `tracesSampleRate: 0` initially
   - `replaysSessionSampleRate: 0` and `replaysOnErrorSampleRate: 0` initially
3. Add a `beforeSend` scrubber to remove:
   - email-like strings
   - access tokens / API keys
   - URL query strings and fragments
4. Implement allowlist telemetry only:
   - route/page name
   - theme (`light`/`dark`)
   - language (`en`/`ro`)
   - event category (no free-form user text)
5. Respect user consent and browser preferences:
   - do not initialize Sentry until consent is granted
   - disable tracking when `navigator.doNotTrack === '1'`
6. Enable release tracking:
   - set `release` from CI commit SHA
   - upload source maps in CI only
   - block source map public access where possible
7. Start with low sampling in production after validation:
   - `tracesSampleRate: 0.05`
   - keep replay disabled unless explicitly needed
8. Add alert policies for actionable issues only:
   - unhandled exceptions
   - performance regressions above threshold
   - rate-limit alert noise with grouping + environment filters

## Validation Checklist

- Verify events never include form values or URL query params.
- Verify no PII appears in breadcrumbs or tags.
- Verify consent gate works on first load and subsequent visits.
- Verify DNT disables Sentry initialization.
- Verify source maps resolve stack traces without exposing original source publicly.

## Operational Controls

- Data retention: set shortest retention that still supports debugging.
- Access control: least-privilege Sentry roles.
- Incident response: define owner + SLA for new critical alerts.
- Quarterly review: sampling rates, scrubber rules, and alert quality.
