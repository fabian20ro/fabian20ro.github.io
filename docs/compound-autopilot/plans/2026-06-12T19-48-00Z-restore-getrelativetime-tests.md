# Plan: Restore comprehensive tests for getRelativeTime

**Goal**: Restore full test coverage for `getRelativeTime` in `tests/getRelativeTime.test.js` to ensure edge cases and language variations are verified.

**Current behavior**: `tests/getRelativeTime.test.js` contains only a few minimal smoke tests, having lost significant coverage of edge cases and multiple languages.

**Contract surfaces**:
- `getRelativeTime(date)` returns a relative time string (e.g., "just now", "2 minutes ago", "1 month ago").
- Supports different locales (en, ro, fr, es, de, it, pt).

**Risks**:
- Regression in time calculation logic.
- Regression in internationalization/translation key handling.

**Implementation units**:
- **Tier 1**: Restore English test cases including edge cases (future dates, invalid dates, extreme years).
- **Tier 1**: Restore Romanian and other language test cases.
- **Tier 1**: Restore `getDefaultLang` and `normalizeLang` tests.
- **Tier 2**: Verify `t()` translation lookup and `setLang` functionality.

**Expected files**:
- `tests/getRelativeTime.test.js`
- `src/app.js` (to verify exported functions)

**Verification**:
- `npm run check`
