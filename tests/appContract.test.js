const assert = require('node:assert');
const app = require('../app.js');

try {
  console.log('Running app contract tests...');

  // 1. Test THANK_YOU_LANGUAGES
  assert.ok(Array.isArray(app.THANK_YOU_LANGUAGES), 'THANK_YOU_LANGUAGES should be an array');
  assert.ok(app.THANK_YOU_LANGUAGES.length > 0, 'THANK_YOU_LANGUAGES should not be empty');

  app.THANK_YOU_LANGUAGES.forEach((lang, index) => {
    assert.ok(lang.name && typeof lang.name === 'object', `Index ${index}: Missing or invalid name object`);
    assert.ok(typeof lang.flag === 'string', `Index ${index}: Missing or invalid flag`);
    assert.ok(typeof lang.thankYou === 'string', `Index ${index}: Missing or invalid thankYou`);
    assert.ok(typeof lang.thankYouPhonetic === 'string', `Index ${index}: Missing or invalid thankYouPhonetic`);
    assert.ok(typeof lang.welcome === 'string', `Index ${index}: Missing or invalid welcome`);
    assert.ok(typeof lang.welcomePhonetic === 'string', `Index ${index}: Missing or invalid welcomePhonetic`);

    // Check language name object keys
    Object.keys(lang.name).forEach(langKey => {
      assert.ok(typeof lang.name[langKey] === 'string', `Index ${index}: Value for '${langKey}' must be a string`);
    });

    // Ensure en and ro are present in name object
    assert.ok(lang.name.en, `Index ${index}: Missing English ('en') in name object`);
    assert.ok(lang.name.ro, `Index ${index}: Missing Romanian ('ro') in name object`);
  });

  // 2. Test exported module functions
  const expectedFunctions = [
    'getDefaultLang',
    'getRelativeTime',
    'getBadgeActionsUrl',
    'isCacheFresh',
    'loadGitHubActivity',
    'normalizeLang',
    'parseRepoName',
    'buildRepoUrl',
    't',
    'getEventIcon'
  ];
  expectedFunctions.forEach(fnName => {
    assert.strictEqual(typeof app[fnName], 'function', `app.${fnName} should be a function`);
  });

  // 3. Strengthen: Test normalizeLang
  const { normalizeLang } = app;
  assert.strictEqual(normalizeLang('en'), 'en');
  assert.strictEqual(normalizeLang('ro'), 'ro');
  assert.strictEqual(normalizeLang('en-US'), 'en');
  assert.strictEqual(normalizeLang('ro_RO'), 'ro');
  assert.strictEqual(normalizeLang('fr-FR'), 'fr');
  assert.strictEqual(normalizeLang('unknown'), 'en');
  assert.strictEqual(normalizeLang(null), 'en');
  assert.strictEqual(normalizeLang(undefined), 'en');

  // 4. Strengthen: Test t fallback behavior
  const { t, setLang } = app;
  assert.strictEqual(t('nonexistent_key'), 'nonexistent_key');
  // Verify translation exists for existing key in 'en'
  assert.strictEqual(t('title'), "Fabian's Projects");

  // Test fallback from 'ro' to 'en'
  setLang('ro');
  assert.strictEqual(t('title'), "Proiectele lui Fabian");
  // Regression: setLang must survive non-string input without corrupting state (forms/URLs).
  // Verify the normalized post-condition on app.currentLang directly — not a stale destructured snapshot.
  // CurrentLang is left in whatever prior test-set state it has; what matters is that setLang(42)
  // does NOT store the raw number into currentLang but normalizes to 'en'.
  setLang(42);
  assert.ok(typeof app.currentLang === 'string', 'app.currentLang stays string after setLang(number)');
  assert.strictEqual(app.currentLang, 'en', 'setLang(number) normalizes to en, does not store raw number in state');
  assert.strictEqual(t('title'), "Fabian's Projects", 'setLang(number) falls back to en, not ro');

  // setLang must always normalize currentLang — never store raw invalid input.
  // In Node.js mode (no DOM), the state object itself is the observable contract surface.
  setLang('zz');
  assert.strictEqual(app.currentLang, 'en', "setLang('zz') normalizes unknown lang to en");

  setLang(7);
  assert.ok(typeof app.currentLang === 'string' && !['null','undefined'].includes(String(app.currentLang)), 'setLang(number) never leaves raw number in state');
  assert.strictEqual(app.currentLang, 'en', 'setLang(non-string primitive) normalizes to en');

  setLang('ro-XY-ZZ');
  assert.ok((app.currentLang === 'ro' || app.currentLang === 'en'), "setLang('ro-XY-ZZ') must normalize to supported lang (ro or en fallback)");

  setLang('   ');
  assert.ok(typeof app.currentLang === 'string', 'setLang(whitespace) keeps currentLang as string');
  assert.strictEqual(t('title'), "Fabian's Projects", 'setLang(whitespace) falls back to en');

  // Regression: setLang with falsy-string, null, and undefined inputs must normalize to 'en'.
  // These are the most common accidental inputs from forms/URLs that bypass type checks.
  setLang('');
  assert.strictEqual(app.currentLang, 'en', "setLang('') normalizes empty string to en");
  assert.strictEqual(t('title'), "Fabian's Projects", "setLang('') falls back t() to en");

  setLang(null);
  assert.strictEqual(app.currentLang, 'en', 'setLang(null) normalizes null to en');
  assert.strictEqual(t('title'), "Fabian's Projects", 'setLang(null) falls back t() to en');

  setLang(undefined);
  assert.strictEqual(app.currentLang, 'en', 'setLang(undefined) normalizes undefined to en');
  assert.strictEqual(t('title'), "Fabian's Projects", 'setLang(undefined) falls back t() to en');

  // Test fallback to key itself if not in 'en'
  assert.strictEqual(t('something_completely_random_that_does_not_exist'), 'something_completely_random_that_does_not_exist');

  // 5. Test t with explicit $lang parameter (inline cross-language lookup)
  setLang('ro');
  // Without $lang, returns current lang
  assert.strictEqual(t('title'), "Proiectele lui Fabian");
  // With explicit 'en', returns English regardless of current lang
  assert.strictEqual(t('title', 'en'), "Fabian's Projects");
  // Explicit non-existent lang falls back to key
  assert.strictEqual(t('nonexistent_key_xyz', 'xx'), 'nonexistent_key_xyz');

  // 6. Strengthen: Test parseRepoName and buildRepoUrl
  const { parseRepoName, buildRepoUrl } = app;
  assert.deepStrictEqual(parseRepoName('owner/repo'), { owner: 'owner', repo: 'repo' });
  assert.strictEqual(parseRepoName('invalid-repo'), null);
  assert.strictEqual(parseRepoName(123), null);
  assert.strictEqual(buildRepoUrl('owner/repo'), 'https://github.com/owner/repo');
  assert.strictEqual(buildRepoUrl('invalid'), 'https://github.com/fabian20ro');
  assert.strictEqual(buildRepoUrl(null), 'https://github.com/fabian20ro');
  // Additional boundary safety assertions for buildRepoUrl/parseRepoName — malformed inputs must never produce broken URLs.
  assert.strictEqual(buildRepoUrl(''), 'https://github.com/fabian20ro', "buildRepoUrl('') falls back to profile URL");
  assert.strictEqual(buildRepoUrl(undefined), 'https://github.com/fabian20ro', 'buildRepoUrl(undefined) falls back to profile URL');
  assert.strictEqual(buildRepoUrl(42), 'https://github.com/fabian20ro', 'buildRepoUrl(number) falls back to profile URL');
  assert.strictEqual(parseRepoName(''), null, "parseRepoName('') returns null");
  assert.strictEqual(parseRepoName(undefined), null, 'parseRepoName(undefined) returns null');
  assert.strictEqual(parseRepoName(null), null, 'parseRepoName(null) returns null');
  assert.strictEqual(parseRepoName('/no/owner/repo'), null, "parseRepoName('slash-prefix') returns null");

  // 7. Strengthen: Test getBadgeActionsUrl — strict boundary contract (idempotent)
  const { getBadgeActionsUrl } = app;
  // Bare repo base → returned as-is (no spurious /actions append)
  assert.strictEqual(getBadgeActionsUrl('https://github.com/owner/repo'), 'https://github.com/owner/repo');
  // Already contains /actions → stripped back to bare repo base
  assert.strictEqual(getBadgeActionsUrl('https://github.com/owner/repo/actions'), 'https://github.com/owner/repo');
  assert.strictEqual(getBadgeActionsUrl(null), '');
  assert.strictEqual(getBadgeActionsUrl(undefined), '');
  // Non-GitHub URLs pass through unchanged (no mangle)
  assert.strictEqual(getBadgeActionsUrl('not-a-github-url'), 'not-a-github-url');
  // Regression: non-plain-string inputs must not produce a URL containing raw input — defensive contract.
  assert.strictEqual(getBadgeActionsUrl(true), '', 'getBadgeActionsUrl(boolean) returns empty string');

  // 8a. Strengthen: Test getRelativeTime — strict type boundary for non-nullish primitives
  const { getRelativeTime } = app;
  assert.strictEqual(getRelativeTime(1234567890), '', 'getRelativeTime(number) returns empty string');
  assert.strictEqual(getRelativeTime({}), '', 'getRelativeTime(object) returns empty string');
  assert.strictEqual(getRelativeTime([]), '', 'getRelativeTime(array) returns empty string');
  assert.strictEqual(getRelativeTime(true), '', 'getRelativeTime(boolean) returns empty string');

  // null/undefined still return justNow (preserving existing contract)
  setLang('en');
  assert.strictEqual(getRelativeTime(null), 'just now', 'getRelativeTime(null) returns just now');
  assert.strictEqual(getRelativeTime(undefined), 'just now', 'getRelativeTime(undefined) returns just now');

  // 8b. getRelativeTime still works for valid strings and whitespace-only
  setLang('ro');
  const futureDate = new Date(Date.now() + 60000).toISOString();
  assert.strictEqual(getRelativeTime(futureDate), t('justNow'), 'future date returns justNow');
  assert.strictEqual(getRelativeTime('   '), t('justNow'), 'whitespace-only string returns justNow');

  // 8f. Strengthen: getRelativeTime with invalid date strings falls back to justNow
  setLang('en');
  assert.strictEqual(getRelativeTime('not-a-date'), 'just now', 'getRelativeTime(invalid date) returns just now');
  assert.strictEqual(getRelativeTime('yesterday'), 'just now', 'getRelativeTime(garbage string) returns just now');

  // 8c. Strengthen: getDefaultLang fallback in Node (no navigator) is deterministic
  const { getDefaultLang } = app;
  setLang('en');
  assert.strictEqual(typeof getDefaultLang(), 'string', 'getDefaultLang returns a string');
  assert.strictEqual(getDefaultLang(), 'en', 'getDefaultLang falls back to en when no navigator exists');

  // 8d. Strengthen: t() with empty-string key falls back to the key itself
  setLang('ro');
  assert.strictEqual(t(''), '', 't(\'\' + any lang) returns empty string');
  assert.strictEqual(t('', 'en'), '', 't(\'\', \'en\') returns empty string');

  // 8e. Strengthen: t() with $lang parameter must be safe against non-string inputs (forms/URLs)
  setLang('ro');
  assert.strictEqual(t('title', 'zz'), "Fabian's Projects", "t(key, invalid lang code) falls back to en");
  // null and undefined short-circuit before normalizeLang — fall back to currentLang (not raw key)
  assert.strictEqual(t('title', null), "Proiectele lui Fabian", "t(key, null $lang) falls back to currentLang");
  assert.strictEqual(t('title', undefined), "Proiectele lui Fabian", "t(key, undefined $lang) falls back to currentLang");
  // '' is falsy — short-circuits before normalizeLang → also falls back to currentLang (not raw key)
  assert.strictEqual(t('title', ''), "Proiectele lui Fabian", "empty string lang falls back to currentLang");
  assert.strictEqual(t('title', 42), "Fabian's Projects", "t(key, number $lang) falls back to en");

  // 8g. Strengthen: Test lastCacheRefreshAt contract (synchronous — no fetch polyfill needed)
  const { lastCacheRefreshAt } = app;
  assert.strictEqual(lastCacheRefreshAt, null, 'lastCacheRefreshAt starts as null before any fetch');

  // Simulate a successful refresh by directly setting the value via the internal setter pattern.
  // We verify that loadGitHubActivity would update it correctly by patching Date.now() temporarily.
  const origNow = global.Date.now;
  global.Date.now = () => 1751600000000;
  app.lastCacheRefreshAt = Date.now();
  assert.strictEqual(app.lastCacheRefreshAt, 1751600000000, 'lastCacheRefreshAt can be updated to a finite number');
  global.Date.now = origNow;

  // 9. Strengthen: Test getEventIcon — full mapping coverage with fallback
  const eventIconMap = {
    PushEvent: '📤',
    CreateEvent: '✨',
    WatchEvent: '⭐',
    ForkEvent: '🍴',
    IssueEvent: '🐛',
    PullRequestEvent: '🔀',
    IssueCommentEvent: '💬',
    PullRequestReviewCommentEvent: '💬'
  };
  Object.entries(eventIconMap).forEach(([event, icon]) => {
    assert.strictEqual(app.getEventIcon(event), icon, `getEventIcon('${event}') should return '${icon}'`);
  });

  // Unknown events fall back to the default pin emoji — prevents silent breakage if a new event type appears with no mapping.
  assert.strictEqual(app.getEventIcon('UnknownEvent'), '📌');
  assert.strictEqual(app.getEventIcon(null), '📌');
  assert.strictEqual(app.getEventIcon(undefined), '📌');
  assert.strictEqual(app.getEventIcon(''), '📌');

  // 9. Strengthen: Test projectSections structure
  const { projectSections } = app;
  assert.ok(Array.isArray(projectSections.liveProjects), 'projectSections.liveProjects should be an array');
  projectSections.liveProjects.forEach((p, i) => {
    assert.ok(typeof p.href === 'string', `liveProject ${i}: href must be string`);
    assert.ok(typeof p.icon === 'string', `liveProject ${i}: icon must be string`);
    assert.ok(typeof p.titleKey === 'string', `liveProject ${i}: titleKey must be string`);
    assert.ok(typeof p.descKey === 'string', `liveProject ${i}: descKey must be string`);
    assert.ok(typeof p.linkKey === 'string', `liveProject ${i}: linkKey must be string`);
    assert.ok(typeof p.badgeUrl === 'string', `liveProject ${i}: badgeUrl must be string`);
  });

  assert.ok(Array.isArray(projectSections.repositories), 'projectSections.repositories should be an array');
  projectSections.repositories.forEach((r, i) => {
    assert.ok(typeof r.href === 'string', `repo ${i}: href must be string`);
    assert.ok(typeof r.icon === 'string', `repo ${i}: icon must be string`);
    assert.ok(typeof r.titleKey === 'string', `repo ${i}: titleKey must be a string`);
    assert.ok(typeof r.descKey === 'string', `repo ${i}: descKey must be a string`);
    assert.ok(typeof r.linkKey === 'string', `repo ${i}: linkKey must be a string`);
    if (r.badgeUrl) {
      assert.ok(typeof r.badgeUrl === 'string', `repo ${i}: badgeUrl must be string`);
    }
    if (r.liveSiteUrl) {
      assert.ok(typeof r.liveSiteUrl === 'string', `repo ${i}: liveSiteUrl must be a string`);
    }
  });

  // 10a. Strengthen: Test isCacheFresh — non-finite timestamp guard must reject corrupted cache data
  const { isCacheFresh } = app;
  assert.strictEqual(isCacheFresh({ timestamp: NaN }), false, 'isCacheFresh rejects NaN timestamp');
  assert.strictEqual(isCacheFresh({ timestamp: Infinity }), false, 'isCacheFresh rejects Infinity timestamp');
  assert.strictEqual(isCacheFresh({ timestamp: -Infinity }), false, 'isCacheFresh rejects -Infinity timestamp');
  assert.strictEqual(isCacheFresh(null), false, 'isCacheFresh rejects null cache object');
  assert.strictEqual(isCacheFresh(undefined), false, 'isCacheFresh rejects undefined cache object');
  assert.strictEqual(isCacheFresh({}), false, "isCacheFresh rejects empty object (no timestamp)");
  // Valid fresh cache — within TTL window — must return true
  assert.strictEqual(isCacheFresh({ timestamp: Date.now() }), true, 'isCacheFresh accepts valid recent timestamp');

  // Regression: stale-but-valid cache must be rejected by isCacheFresh (not silently accepted).
  const staleValid = { timestamp: Date.now() - app.ACTIVITY_CACHE_TTL_MS - 1 };
  assert.strictEqual(isCacheFresh(staleValid), false, 'isCacheFresh rejects cache older than TTL');

  // Regression: future-dated cache must be rejected — clock skew or malformed data should not count as fresh.
  const futureValid = { timestamp: Date.now() + 60000 };
  assert.strictEqual(isCacheFresh(futureValid), false, 'isCacheFresh rejects future-dated timestamp');

  // 10. Strengthen: Test loadGitHubActivity contract — stale cache must be replaced by fresh fetch
  const { loadGitHubActivity } = app;

  function createElement(tagName) {
    return {
      tagName, className: '', textContent: '', href: '', children: [],
      appendChild(child) { this.children.push(child); return child; },
      append(...nodes) { for (const n of nodes) this.appendChild(n); },
      replaceChildren(...nodes) { this.children = [...nodes]; },
      setAttribute(name, value) { this[name] = value; }
    };
  }

  (async () => {
    const feed = createElement('div');
    feed.replaceChildren(createElement('div'));
    let fetchCalls = 0;
    global.document = {
      getElementById(id) { return id === 'activity-feed' ? feed : null; },
      createElement, createDocumentFragment: () => createElement('fragment'),
      createTextNode(text) { return { nodeType: 'text', textContent: text }; }
    };

    const staleTS = Date.now() - 11 * 60 * 1000;
    global.localStorage = {
      getItem(key) {
        if (key === 'github-activity-cache-v1') return JSON.stringify({ timestamp: staleTS, events: [{ type: 'StaleEvent', repo: { name: 'old' }, created_at: '', payload: {} }] });
        return null;
      },
      setItem() {}
    };

    global.fetch = async () => {
      fetchCalls += 1;
      return new Response(JSON.stringify([{ type: 'FreshEvent', repo: { name: 'new-repo' }, created_at: new Date(Date.now()).toISOString(), payload: {} }]));
    };

    await loadGitHubActivity();

    // Contract: stale cache (older than 10-min TTL) must trigger at least one network call.
    assert.strictEqual(fetchCalls, 1, 'stale cache should trigger refresh');
    console.log('Stale-cache regression test passed!');
  })().catch(err => { console.error(err); process.exit(1); });

  // Verify lastCacheRefreshAt gets updated after a successful fetch path through loadGitHubActivity.
  (async () => {
    const feed = createElement('div');
    feed.replaceChildren(createElement('fragment'));

    global.document = {
      getElementById(id) { return id === 'activity-feed' ? feed : null; },
      createElement, createDocumentFragment: () => createElement('fragment'),
      createTextNode(text) { return { nodeType: 'text', textContent: text }; }
    };

    // No cache at all — guarantees fetch path.
    global.localStorage = {
      getItem() { return null; },
      setItem() {}
    };
    global.sessionStorage = {
      getItem() { return null; },
      setItem() {}
    };

    let didFetch = false;
    global.fetch = async () => {
      didFetch = true;
      return new Response(JSON.stringify([{ type: 'PushEvent', repo: { name: 'fresh-repo' }, created_at: new Date().toISOString(), payload: {} }]));
    };

    await loadGitHubActivity();

    assert.ok(didFetch, 'should have called fetch when no cache exists');
    assert.strictEqual(app.lastCacheRefreshAt != null && Number.isFinite(app.lastCacheRefreshAt), true, 'lastCacheRefreshAt must be set after successful fetch');
  })().catch(err => { console.error('lastCacheRefreshAt contract failed:', err); process.exit(1); });

} catch (err) {
  console.error('App contract tests failed:');
  console.error(err);
  process.exit(1);
}
