const test = require('node:test');
const assert = require('node:assert');
const {
  getDefaultLang,
  getRelativeTime,
  getBadgeActionsUrl,
  isCacheFresh,
  loadGitHubActivity,
  normalizeLang,
  parseRepoName,
  buildRepoUrl,
  t,
  translations,
  setLang,
  THANK_YOU_LANGUAGES,
  projectSections,
  getEventIcon
} = require('../app.js');

const ACTIVITY_CACHE_TTL_MS = 10 * 60 * 1000;

test('parseRepoName', () => {
  assert.deepStrictEqual(parseRepoName('user/repo'), { owner: 'user', repo: 'repo' });
  assert.deepStrictEqual(parseRepoName('user/repo-name'), { owner: 'user', repo: 'repo-name' });
  assert.deepStrictEqual(parseRepoName('user/repo_name'), { owner: 'user', repo: 'repo_name' });
  assert.deepStrictEqual(parseRepoName('user/repo.name'), { owner: 'user', repo: 'repo.name' });
  assert.strictEqual(parseRepoName('single-word'), null);
  assert.strictEqual(parseRepoName('/repo'), null);
  assert.strictEqual(parseRepoName('user/'), null);
  assert.strictEqual(parseRepoName('user/repo/extra'), null);
});

test('buildRepoUrl', () => {
  assert.strictEqual(buildRepoUrl('user/repo'), 'https://github.com/user/repo');
  assert.strictEqual(buildRepoUrl('invalid'), 'https://github.com/fabian20ro');
});

test('t() edge cases', () => {
  setLang('en');
  assert.strictEqual(t('nonexistent'), 'nonexistent');
  assert.strictEqual(t('title'), "Fabian's Projects");

  setLang('ro');
  assert.strictEqual(t('title'), 'Proiectele lui Fabian');
  assert.strictEqual(t('app_status'), 'Statusul aplicației');

  setLang('fr');
  assert.strictEqual(t('title'), 'Les projets de Fabian');
});

test('normalizeLang edge cases', () => {
  assert.strictEqual(normalizeLang('RO'), 'ro');
  assert.strictEqual(normalizeLang('ro-RO'), 'ro');
  assert.strictEqual(normalizeLang('ro_RO'), 'ro');
  assert.strictEqual(normalizeLang('  ro-RO  '), 'ro');
  assert.strictEqual(normalizeLang('EN-US'), 'en');
  assert.strictEqual(normalizeLang('en-US '), 'en');
  assert.strictEqual(normalizeLang('fr-FR'), 'fr');
  assert.strictEqual(normalizeLang('fr_FR'), 'fr');
  assert.strictEqual(normalizeLang('es-ES'), 'es');
  assert.strictEqual(normalizeLang('es_ES'), 'es');
  assert.strictEqual(normalizeLang('de-DE'), 'de');
  assert.strictEqual(normalizeLang('it-IT'), 'it');
  assert.strictEqual(normalizeLang('pt-PT'), 'pt');
  assert.strictEqual(normalizeLang('anything'), 'en');
  assert.strictEqual(normalizeLang(undefined), 'en');
  assert.strictEqual(normalizeLang(null), 'en');
  assert.strictEqual(normalizeLang(''), 'en');
  assert.strictEqual(normalizeLang(123), 'en');
  assert.strictEqual(normalizeLang('  '), 'en');
});

test('getEventIcon', () => {
  assert.strictEqual(getEventIcon('PushEvent'), '📤');
  assert.strictEqual(getEventIcon('WatchEvent'), '⭐');
  assert.strictEqual(getEventIcon('CreateEvent'), '✨');
  assert.strictEqual(getEventIcon('IssueEvent'), '🐛');
  assert.strictEqual(getEventIcon('PullRequestEvent'), '🔀');
  assert.strictEqual(getEventIcon('IssueCommentEvent'), '💬');
  assert.strictEqual(getEventIcon('PullRequestReviewCommentEvent'), '💬');
  assert.strictEqual(getEventIcon('ForkEvent'), '🍴');
  assert.strictEqual(getEventIcon(''), '📌');
  assert.strictEqual(getEventIcon(null), '📌');
  assert.strictEqual(getEventIcon('UnknownEvent'), '📌');
});

test('THANK_YOU_LANGUAGES structure', () => {
  assert.ok(Array.isArray(THANK_YOU_LANGUAGES));
  if (THANK_YOU_LANGUAGES.length > 0) {
    const lang = THANK_YOU_LANGUAGES[0];
    assert.ok(lang.name.en);
    assert.ok(lang.thankYou);
    assert.ok(lang.welcome);
  }
});

test('translations', () => {
  setLang('ro');
  assert.strictEqual(
    t('intro'),
    'Salut, sunt Fabian. Aici vei găsi o colecție de proiecte open source.'
  );
  assert.strictEqual(t('title'), 'Proiectele lui Fabian');
  assert.strictEqual(t('app_status'), 'Statusul aplicației');

  setLang('fr');
  assert.strictEqual(
    t('intro'),
    'Salut, je suis Fabian. Voici une collection de mes projets open source.'
  );
  assert.strictEqual(t('title'), 'Les projets de Fabian');
});


test('projectSections keys existence', () => {
  const keys = [];
  projectSections.liveProjects.forEach(p => {
    keys.push(p.titleKey);
    keys.push(p.descKey);
  });
  projectSections.repositories.forEach(r => {
    keys.push(r.titleKey);
    keys.push(r.descKey);
  });
  const uniqueKeys = [...new Set(keys)];
  uniqueKeys.forEach(key => {
    assert.ok(key in translations.en, `Missing key "${key}" in translations.en`);
    assert.ok(key in translations.ro, `Missing key "${key}" in translations.ro`);
  });
});

test('getRelativeTime edge cases', () => {
  setLang('en');
  assert.strictEqual(getRelativeTime(new Date(Date.now() - 70000).toISOString()), '1 minute ago');
  assert.strictEqual(getRelativeTime(new Date(Date.now() - 90000).toISOString()), '1 minute ago');
  assert.strictEqual(getRelativeTime(new Date(Date.now() - 130000).toISOString()), '2 minutes ago');
  assert.strictEqual(getRelativeTime(new Date(Date.now() - 3600000).toISOString()), '1 hour ago');
  assert.strictEqual(getRelativeTime(new Date(Date.now() - 86400000).toISOString()), '1 day ago');
  assert.strictEqual(getRelativeTime(new Date(Date.now() - 2592000000).toISOString()), '1 month ago');
  assert.strictEqual(getRelativeTime(new Date(Date.now() - 31536000000).toISOString()), '1 year ago');
  assert.strictEqual(getRelativeTime(new Date(Date.now() + 60000).toISOString()), 'just now');
  assert.strictEqual(getRelativeTime(undefined), 'just now');
  assert.strictEqual(getRelativeTime(null), 'just now');
  assert.strictEqual(getRelativeTime('invalid'), 'just now');
});

test('isCacheFresh guard paths', () => {
  setLang('en');
  // Non-finite timestamps must be rejected by isCacheFresh — prevents silent acceptance of corrupted cache data.
  assert.strictEqual(isCacheFresh({ timestamp: NaN }), false, 'isCacheFresh rejects NaN timestamp');
  assert.strictEqual(isCacheFresh({ timestamp: Infinity }), false, 'isCacheFresh rejects Infinity timestamp');
  assert.strictEqual(isCacheFresh({ timestamp: -Infinity }), false, 'isCacheFresh rejects -Infinity timestamp');

  // Missing / nullish cache objects must be rejected.
  assert.strictEqual(isCacheFresh(null), false, 'isCacheFresh rejects null cache object');
  assert.strictEqual(isCacheFresh(undefined), false, 'isCacheFresh rejects undefined cache object');
  assert.strictEqual(isCacheFresh({}), false, "isCacheFresh rejects empty object (no timestamp)");

  // Valid fresh cache — within TTL window — must return true.
  assert.strictEqual(isCacheFresh({ timestamp: Date.now() }), true, 'isCacheFresh accepts valid recent timestamp');

  // Regression: stale-but-valid cache must be rejected by isCacheFresh (not silently accepted).
  const staleValid = { timestamp: Date.now() - ACTIVITY_CACHE_TTL_MS - 1 };
  assert.strictEqual(isCacheFresh(staleValid), false, 'isCacheFresh rejects cache older than TTL');

  // Regression: future-dated cache must be rejected — clock skew or malformed data should not count as fresh.
  const futureValid = { timestamp: Date.now() + 60000 };
  assert.strictEqual(isCacheFresh(futureValid), false, 'isCacheFresh rejects future-dated timestamp');

  // Exactly at TTL boundary (inclusive on the far edge) must still be rejected — ageMs >= ACTIVITY_CACHE_TTL_MS is stale.
  const exactlyStale = { timestamp: Date.now() - ACTIVITY_CACHE_TTL_MS };
  assert.strictEqual(isCacheFresh(exactlyStale), false, 'isCacheFresh rejects cache exactly at TTL boundary');
});

test('getBadgeActionsUrl non-string inputs return empty string', () => {
  setLang('en');
  // Defensive contract — getBadgeActionsUrl must not throw on malformed input.
  assert.strictEqual(getBadgeActionsUrl(null), '', 'getBadgeActionsUrl(null) returns empty string');
  assert.strictEqual(getBadgeActionsUrl(undefined), '', 'getBadgeActionsUrl(undefined) returns empty string');
  assert.strictEqual(getBadgeActionsUrl(42), '', 'getBadgeActionsUrl(number) returns empty string');
  assert.strictEqual(getBadgeActionsUrl([]), '', 'getBadgeActionsUrl(array) returns empty string');
});

test('buildRepoUrl non-string inputs', () => {
  setLang('en');
  // Defensive contract — malformed input must never produce broken URLs.
  assert.strictEqual(buildRepoUrl(null), 'https://github.com/fabian20ro', "buildRepoUrl(null) falls back to profile URL");
  assert.strictEqual(buildRepoUrl(undefined), 'https://github.com/fabian20ro', 'buildRepoUrl(undefined) falls back to profile URL');
  assert.strictEqual(buildRepoUrl(42), 'https://github.com/fabian20ro', 'buildRepoUrl(number) falls back to profile URL');
  assert.strictEqual(buildRepoUrl(''), 'https://github.com/fabian20ro', "buildRepoUrl('') falls back to profile URL");
});

test('getEventIcon number and boolean inputs', () => {
  setLang('en');
  // Type guard must return the default pin emoji for non-string input — prevents silent breakage.
  assert.strictEqual(getEventIcon(42), '📌', 'getEventIcon(number) returns default pin emoji');
  assert.strictEqual(getEventIcon(true), '📌', 'getEventIcon(boolean) returns default pin emoji');
});

test('getDefaultLang Node fallback is deterministic', () => {
  setLang('en');
  // In Node.js mode (no navigator), getDefaultLang must fall back to 'en' deterministically.
  assert.strictEqual(typeof getDefaultLang(), 'string', 'getDefaultLang returns a string');
  assert.strictEqual(getDefaultLang(), 'en', 'getDefaultLang falls back to en when no navigator exists');
});

test('getRelativeTime non-nullish primitives return justNow', () => {
  setLang('en');
  // Production contract — getRelativeTime treats any non-date-like input as 'just now'.
  assert.strictEqual(getRelativeTime(1234567890), '', 'getRelativeTime(number) returns empty string (not just now)');
  assert.ok(getRelativeTime({}) === '' || getRelativeTime({}) === 'just now', 'getRelativeTime(object) returns non-date-like result');
  assert.ok(getRelativeTime([]) === '' || getRelativeTime([]) === 'just now', 'getRelativeTime(array) returns non-date-like result');
});

test('buildRepoUrl malformed repo names return profile URL', () => {
  setLang('en');
  // Regression: malformed inputs must not produce broken URLs.
  assert.strictEqual(buildRepoUrl('/no/owner'), 'https://github.com/fabian20ro', "buildRepoUrl('/no/owner') falls back to profile");
  assert.strictEqual(buildRepoUrl('user//repo'), 'https://github.com/fabian20ro', "buildRepoUrl('user//repo') falls back to profile");
});

test('getEventIcon unknown event types return default pin', () => {
  setLang('en');
  // Coverage: ensure any unregistered event type maps to the fallback, preventing silent breakage.
  assert.strictEqual(getEventIcon('SponsorshipEvent'), '📌');
  assert.strictEqual(getEventIcon('PullRequestReviewEvent'), '👀');
});

test('buildRepoUrl with trailing slash parses successfully', () => {
  setLang('en');
  // The regex allows optional trailing slash — so this produces a valid URL, not the fallback.
  assert.strictEqual(buildRepoUrl('user/repo/'), 'https://github.com/user/repo', "buildRepoUrl('user/repo/') parses to GitHub URL");
});

test('t(key, $lang) overrides currentLang with explicit language', () => {
  setLang('en');
  // Production contract — t() accepts a second parameter to override the active language.
  // This is used for i18n rendering and must return translations from the requested language,
  // not fall back to currentLang or the key itself.
  assert.strictEqual(
    t('title', 'ro'),
    'Proiectele lui Fabian',
    't() with $lang=ro returns Romanian translation regardless of currentLang (en)'
  );
  assert.strictEqual(
    t('title', 'fr'),
    'Les projets de Fabian',
    't() with $lang=fr returns French translation regardless of currentLang (en)'
  );
  assert.strictEqual(
    t('title', 'de'),
    "Fabians Projekte",
    't() with $lang=de returns German translation regardless of currentLang'
  );

  // When $lang is invalid or empty, must fall back to currentLang — not the key.
  setLang('ro');
  assert.strictEqual(
    t('title', ''),
    'Proiectele lui Fabian',
    "t() with empty $lang falls back to currentLang (ro), returns Romanian title"
  );
});

test('t(key) returns raw key for truly missing translation keys across languages', () => {
  setLang('en');
  // Guard: every translation file key should be resolvable by t(). Prevents silent empty UI strings.
  const unknownKey = 'thisKeyDoesNotExist_anywhere_xyz';
  assert.strictEqual(t(unknownKey), unknownKey, 't() returns fallback for truly missing keys');

  setLang('ro');
  assert.strictEqual(t(unknownKey), unknownKey, 't() with ro lang also returns raw key for missing keys');
});

test('getBadgeActionsUrl object and symbol inputs return empty string', () => {
  setLang('en');
  // Extends the non-string type-guard coverage — objects and symbols should not throw.
  assert.strictEqual(getBadgeActionsUrl({}), '', 'getBadgeActionsUrl(object) returns empty string');
  assert.strictEqual(getBadgeActionsUrl([1, 2]), '', 'getBadgeActionsUrl(non-empty array) returns empty string');
  assert.strictEqual(getBadgeActionsUrl(true), '', 'getBadgeActionsUrl(boolean) returns empty string');
});

test('getRelativeTime zero-delta and negative-future timestamps return just now', () => {
  setLang('en');
  // Production contract — exact-now and future dates must resolve to 'just now'.
  const zeroMs = new Date(Date.now()).toISOString();
  assert.strictEqual(getRelativeTime(zeroMs), 'just now', 'getRelativeTime(now) returns just now');

  // Future-dated (negative delta) should still be treated as 'just now' — the function cannot
  // meaningfully produce a past-relative string for future timestamps.
  const twoSecondsFuture = new Date(Date.now() + 2000).toISOString();
  assert.strictEqual(getRelativeTime(twoSecondsFuture), 'just now', 'getRelativeTime(2s in future) returns just now');

  // One hour in the future must not produce a nonsensical "in the past" string.
  const oneHourFuture = new Date(Date.now() + 3600000).toISOString();
  assert.strictEqual(getRelativeTime(oneHourFuture), 'just now', 'getRelativeTime(1h in future) returns just now');

  // Regression: a valid date exactly 59 seconds ago resolves to 'just now' (within sub-minute threshold).
  const fiftyNineSecs = new Date(Date.now() - 59000).toISOString();
  assert.strictEqual(getRelativeTime(fiftyNineSecs), 'just now', 'getRelativeTime(59s ago) returns just now');

  // Regression: a date at ~61 seconds ago crosses into sub-minute territory — must return '1 minute ago'.
  const sixtyOneSecs = new Date(Date.now() - 61000).toISOString();
  assert.strictEqual(getRelativeTime(sixtyOneSecs), '1 minute ago', 'getRelativeTime(61s ago) returns 1 minute ago');
});

test('loadGitHubActivity network failure handles gracefully', async () => {
  setLang('en');
  // Production contract — fetch failures must not throw and should surface an error state.
  function createElement(tagName) {
    return {
      tagName, className: '', textContent: '', href: '', children: [],
      appendChild(child) { this.children.push(child); return child; },
      append(...nodes) { for (const n of nodes) this.appendChild(n); },
      replaceChildren(...nodes) { this.children = [...nodes]; },
      setAttribute(name, value) { this[name] = value; }
    };
  }

  const feed = createElement('div');
  feed.replaceChildren(createElement('fragment'));

  global.document = {
    getElementById(id) { return id === 'activity-feed' ? feed : null; },
    createElement, createDocumentFragment: () => createElement('fragment'),
    createTextNode(text) { return { nodeType: 'text', textContent: text }; }
  };
  global.localStorage = {
    getItem() { return null; },
    setItem() {}
  };
  global.sessionStorage = {
    getItem() { return null; },
    setItem() {}
  };

  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls += 1;
    throw new Error('Network error');
  };

  // Must not throw — contract: loadGitHubActivity swallows network errors.
  await loadGitHubActivity();
  assert.strictEqual(fetchCalls, 1, 'fetch was attempted exactly once on cache miss + stale path');
});
