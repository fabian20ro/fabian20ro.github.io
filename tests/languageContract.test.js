const test = require('node:test');
const assert = require('node:assert');
const { THANK_YOU_LANGUAGES } = require('../app.js');

test('THANK_YOU_LANGUAGES is an array', () => {
  assert.ok(Array.isArray(THANK_YOU_LANGUAGES), 'THANK_YOU_LANGUAGES should be an array');
});

test('every THANK_YOU_LANGUAGES entry has required fields', () => {
  THANK_YOU_LANGUAGES.forEach((lang, index) => {
    assert.ok(typeof lang.flag === 'string' && lang.flag.length > 0, `Index ${index}: Missing flag`);
    assert.ok(typeof lang.thankYou === 'string' && lang.thankYou.length > 0, `Index ${index}: Missing thankYou string`);
    assert.ok(typeof lang.thankYouPhonetic === 'string' && lang.thankYouPhonetic.length > 0, `Index ${index}: Missing thankYouPhonetic string`);
    assert.ok(typeof lang.welcome === 'string' && lang.welcome.length > 0, `Index ${index}: Missing welcome string`);
    assert.ok(typeof lang.welcomePhonetic === 'string' && lang.welcomePhonetic.length > 0, `Index ${index}: Missing welcomePhonetic string`);

    // Check language name object keys are non-empty
    Object.keys(lang.name).forEach((l) => {
      assert.ok(l !== '', `Index ${index}: Empty language key in name`);
    });
  });
});

test('every THANK_YOU_LANGUAGES entry has en and ro name keys with values', () => {
  for (const lang of THANK_YOU_LANGUAGES) {
    assert.ok(lang.name && typeof lang.name === 'object', `name must be an object`);
    assert.ok('en' in lang.name, 'missing en key in name');
    assert.ok(typeof lang.name.en === 'string' && lang.name.en.length > 0, 'en value must be a non-empty string');
    assert.ok('ro' in lang.name, 'missing ro key in name');
    assert.ok(typeof lang.name.ro === 'string' && lang.name.ro.length > 0, 'ro value must be a non-empty string');
  }
});

test('translation completeness: every non-base language contains every base translation key', () => {
  const app = require('../app.js');
  const translations = app.translations;
  // SUPPORTED_LANGUAGES is defined in app.js but not exported — access via module internals.
  const supportedLangs = Object.keys(translations);

  const baseLang = 'en';
  assert.ok(baseLang in translations, 'English translation object must exist');
  const baseKeys = Object.keys(translations[baseLang]);

  for (const lang of supportedLangs) {
    if (lang === baseLang) continue;
    assert.ok(lang in translations, `Missing translation object for '${lang}'`);
    const keys = Object.keys(translations[lang]);
    const missing = baseKeys.filter((k) => !keys.includes(k));
    assert.deepStrictEqual(missing, [], `Language '${lang}' is missing ${missing.length} base key(s): ${missing.join(', ')}`);

    // Also check no extra keys (translations are curated — extras suggest drift).
    const extra = keys.filter((k) => !baseKeys.includes(k));
    assert.deepStrictEqual(extra, [], `Language '${lang}' has unexpected ${extra.length} key(s): ${extra.join(', ')}`);
  }
});

test('propositionsDesc is distinct from propositionsTitle in every non-base language', () => {
  const { translations } = require('../app.js');
  for (const lang of Object.keys(translations)) {
    assert.notStrictEqual(
      translations[lang].propositionsDesc,
      translations[lang].propositionsTitle,
      `propositionsDesc must differ from propositionsTitle in '${lang}'`
    );
    assert.ok(
      typeof translations[lang].propositionsDesc === 'string' && translations[lang].propositionsDesc.length > 0,
      `propositionsDesc must be a non-empty string in '${lang}'`
    );
  }
});

test('supported languages constant matches translation object keys', () => {
  const app = require('../app.js');
  const translations = app.translations;
  // Read source directly — SUPPORTED_LANGUAGES is a plain array declaration.
  const fs = require('fs');
  const path = require('path');
  const srcPath = path.join(__dirname, '..', 'app.js');
  const src = fs.readFileSync(srcPath, 'utf8');
  const match = src.match(/const\s+SUPPORTED_LANGUAGES\s*=\s*\[([^\]]+)\]/);
  assert.ok(match, 'SUPPORTED_LANGUAGES declaration not found in app.js');

  // Parse comma-separated string literals from the array contents.
  const raw = match[1];
  const langValues = [...raw.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  assert.deepStrictEqual(
    Object.keys(translations).sort(),
    langValues.sort(),
    'Supported languages must exactly match translation object language keys'
  );
});

test('supported languages entries are unique', () => {
  const fs = require('fs');
  const path = require('path');
  const srcPath = path.join(__dirname, '..', 'app.js');
  const src = fs.readFileSync(srcPath, 'utf8');
  const match = src.match(/const\s+SUPPORTED_LANGUAGES\s*=\s*\[([^\]]+)\]/);
  assert.ok(match, 'SUPPORTED_LANGUAGES declaration not found in app.js');

  const raw = match[1];
  const langValues = [...raw.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  assert.strictEqual(
    new Set(langValues).size,
    langValues.length,
    'SUPPORTED_LANGUAGES must contain no duplicate language codes'
  );
});

test('projectSections entries have only expected keys', () => {
  const { projectSections } = require('../app.js');
  const liveExpected = new Set(['href', 'icon', 'titleKey', 'descKey', 'linkKey', 'badgeUrl']);
  const repoExpected = new Set(['href', 'icon', 'titleKey', 'descKey', 'linkKey', 'liveSiteUrl', 'badgeUrl']);

  for (const item of projectSections.liveProjects) {
    const keys = new Set(Object.keys(item));
    assert.ok(keys.has('href'), 'missing href');
    for (const k of keys) {
      assert.ok(liveExpected.has(k), `unexpected key '${k}' in liveProject`);
    }
  }

  for (const item of projectSections.repositories) {
    const keys = new Set(Object.keys(item));
    assert.ok(keys.has('href'), 'missing href');
    for (const k of keys) {
      assert.ok(repoExpected.has(k), `unexpected key '${k}' in repository`);
    }
  }
});

test('projectSections icons are valid emoji', () => {
  const { projectSections } = require('../app.js');
  for (const item of [...projectSections.liveProjects, ...projectSections.repositories]) {
    assert.ok(typeof item.icon === 'string' && item.icon.length > 0, `icon must be a non-empty string in ${item.href}`);
    // Regional indicators (flags), miscellaneous symbols/pictographs, and other emoji ranges.
    const hasEmoji = /[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAD6}\u{2600}-\u{27BF}\u{1F680}-\u{1F6FF}]/u.test(item.icon);
    assert.ok(hasEmoji, `icon '${item.icon}' in ${item.href} does not appear to be an emoji`);
  }
});

test('projectSections badgeUrls reference valid GitHub workflow badges', () => {
  const { projectSections } = require('../app.js');
  for (const item of [...projectSections.liveProjects, ...projectSections.repositories]) {
    if (!item.badgeUrl) continue;
    assert.ok(
      /^https:\/\/github\.com\/fabian20ro\/[^/]+\/(workflows|actions)\//.test(item.badgeUrl),
      `badgeUrl '${item.badgeUrl}' in ${item.href} must reference a GitHub workflow or actions path`
    );
  }
});

test('projectSections metadata resolves via t() to non-empty strings', () => {
  const { projectSections, translations } = require('../app.js');
  function t(key) {
    // Use the current language from document — fall back to 'en'.
    const lang = (typeof document !== 'undefined' && typeof window !== 'undefined') ? (window.__currentLang || 'en') : 'en';
    return translations[lang]?.[key] ?? translations.en[key];
  }

  for (const item of [...projectSections.liveProjects, ...projectSections.repositories]) {
    assert.ok(t(item.titleKey), `titleKey '${item.titleKey}' in ${item.href} resolves to empty`);
    assert.ok(t(item.descKey), `descKey '${item.descKey}' in ${item.href} resolves to empty`);
    assert.ok(t(item.linkKey), `linkKey '${item.linkKey}' in ${item.href} resolves to empty`);
  }

  // Also verify base translations keys are non-empty.
  for (const [key, value] of Object.entries(translations.en)) {
    if (typeof value === 'string') {
      assert.ok(value.length > 0, `translation key '${key}' resolves to empty string`);
    }
  }
});
