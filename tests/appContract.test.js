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
    't'
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
  const { t } = app;
  assert.strictEqual(t('nonexistent_key'), 'nonexistent_key');
  // Verify translation exists for existing key in 'en'
  assert.strictEqual(t('title'), "Fabian's Projects");

  // 5. Strengthen: Test parseRepoName and buildRepoUrl
  const { parseRepoName, buildRepoUrl } = app;
  assert.deepStrictEqual(parseRepoName('owner/repo'), { owner: 'owner', repo: 'repo' });
  assert.strictEqual(parseRepoName('invalid-repo'), null);
  assert.strictEqual(parseRepoName(123), null);
  assert.strictEqual(buildRepoUrl('owner/repo'), 'https://github.com/owner/repo');
  assert.strictEqual(buildRepoUrl('invalid'), 'https://github.com/fabian20ro');

  // 6. Strengthen: Test getEventIcon
  assert.strictEqual(app.getEventIcon('PushEvent'), '📤');
  assert.strictEqual(app.getEventIcon('UnknownEvent'), '📌');

  console.log('App contract tests passed!');

} catch (err) {
  console.error('App contract tests failed:');
  console.error(err);
  process.exit(1);
}
