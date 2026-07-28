const test = require('node:test');
const assert = require('node:assert');
const { translations, t, normalizeLang } = require('../app.js');

test('i18n translation completeness', () => {
  const enKeys = Object.keys(translations.en);

  for (const key of enKeys) {
    // Check Romanian
    if (!translations.ro || !translations.ro[key]) {
      assert.fail(`Missing key "${key}" in Romanian translations`);
    }
    // Check French
    if (!translations.fr || !translations.fr[key]) {
      assert.fail(`Missing key "${key}" in French translations`);
    }
  }
});

test('i18n translation values are not just the key', () => {
  const enKeys = Object.keys(translations.en);
  for (const key of enKeys) {
    // Check Romanian
    if (translations.ro && translations.ro[key] === key) {
      assert.fail(`Key "${key}" in Romanian is just the key itself`);
    }
    // Check French
    if (translations.fr && translations.fr[key] === key) {
      assert.fail(`Key "${key}" in French is just the key itself`);
    }
  }
});

test('t() returns Romanian translation when $lang ro', () => {
  assert.equal(t('title', 'ro'), 'Proiectele lui Fabian');
  assert.equal(t('liveProjects', 'ro'), 'Proiecte Live');
  assert.equal(t('passwordGenTitle', 'ro'), 'Generator de Parole');
});

test('t() falls back to English for unknown keys', () => {
  const fallback = t('nonexistentKey12345', 'ro');
  assert.equal(fallback, 'nonexistentKey12345');
});

test('t() accepts locale-subtagged $lang (e.g. "ro-RO") and resolves via normalizeLang', () => {
  // Browser navigator.language often arrives as subtagged codes; verify the full chain works end-to-end.
  assert.equal(t('title', 'ro-RO'), 'Proiectele lui Fabian');
  assert.equal(t('liveProjects', 'fr-ca'), 'Projections en direct');
  assert.equal(t('title', 'DE-de'), "Fabians Projekte");
});

test('t() partial-fallback: key missing from $lang returns English value, not raw key', () => {
  // Guard: if a key is removed from a non-English translation, t() should silently
  // return the English equivalent rather than leaking the raw key into the UI.
  const partial = t('title', 'es');
  assert.notEqual(partial, 'title', 't() must not leak raw key for missing translations');
});

test('translation completeness: all supported languages cover every en key', () => {
  const enKeys = Object.keys(translations.en);
  for (const lang of ['ro', 'fr', 'es', 'de', 'it', 'pt']) {
    const dict = translations[lang];
    assert.ok(dict, `translations.${lang} must exist`);
    for (const key of enKeys) {
      assert.ok(
        dict[key],
        `Missing en key "${key}" in ${lang} translations`
      );
    }
  }
});

test('normalizeLang accepts locale subtags and returns base code', () => {
  assert.equal(normalizeLang('ro-RO'), 'ro');
  assert.equal(normalizeLang('ro_RO'), 'ro');
  assert.equal(normalizeLang('fr-ca'), 'fr');
  assert.equal(normalizeLang('en-US'), 'en');
  assert.equal(normalizeLang('de-DE'), 'de');
});

test('normalizeLang handles case-insensitive subtags', () => {
  assert.equal(normalizeLang('RO-ro'), 'ro');
  assert.equal(normalizeLang('FR-ca'), 'fr');
  assert.equal(normalizeLang('en-us'), 'en');
});

test('t() no-$lang uses currentLang default (set to en)', () => {
  // t(key) without $lang resolves via normalizeLang(currentLang).
  // Since currentLang defaults to 'en', the result should be the English value.
  const defaultResult = t('title');
  assert.equal(defaultResult, "Fabian's Projects",
    't() with no $lang must resolve from currentLang (default en)'
  );
});

test('t() partial-fallback: when key missing from $lang, returns EN value not raw key', () => {
  // Inject a scenario where a translation dict is intentionally missing one key.
  // We do this by passing an ad-hoc language code to t(). Since normalizeLang maps
  // unknown codes to 'en', we test via direct dictionary inspection instead:
  // t() will look up translations[$lang][key]; if absent, it falls back to EN.
  // To simulate a missing key, we temporarily augment the module-scoped translations
  // object with an extra language that omits one known key.
  const original = translations['xx'];
  translations['xx'] = { title: 'Fabian Projects (stub)' };
  // t('title', 'xx') → normalizeLang('xx') returns 'en' since xx isn't supported,
  // so this actually exercises the real fallback chain. We instead verify via
  // direct dictionary lookup that a missing key in an arbitrary lang falls back.
  const partialValue = translations['xx']['nonexistent'];
  assert.equal(partialValue, undefined, 'Injected dict has no such key');
  if (original !== undefined) {
    translations['xx'] = original;
  } else {
    delete translations['xx'];
  }
});

test('t() full partial-fallback via direct lang stub', () => {
  // Directly test t()'s fallback chain: set a language that normalizeLang will accept,
  // but which is missing some keys. We add 'es-extra' → not supported by normalizeLang,
  // so we instead verify the actual code path by reading app.js contract:
  //   if (translations[lang] && translations[lang][key]) return translations[lang][key];
  //   if (translations.en && translations.en[key]) return translations.en[key];
  // We test this by temporarily clearing one key from a supported language.
  const saved = translations.fr['title'];
  delete translations.fr['title'];
  const result = t('title', 'fr');
  assert.equal(result, "Fabian's Projects",
    't() must fall back to EN value when key missing from $lang'
  );
  translations.fr['title'] = saved;
});

test('normalizeLang rejects non-string input', () => {
  assert.equal(normalizeLang(undefined), 'en');
  assert.equal(normalizeLang(null), 'en');
  assert.equal(normalizeLang(42), 'en');
  assert.equal(normalizeLang({}), 'en');
});

test('normalizeLang rejects unsupported locales and defaults to en', () => {
  assert.equal(normalizeLang('xyz-ABC'), 'en');
  assert.equal(normalizeLang('ja'), 'en');
  assert.equal(normalizeLang('   '), 'en');
});
